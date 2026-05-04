const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const upload = multer({ storage: multer.memoryStorage() });

const db = {
  reviews: [],
  rooms: [],
  workers: [],
  tasks: [],
  issues: [],
};

let taskIdSeq = 1;
let issueIdSeq = 1;
let reviewIdSeq = 1;
const usedImageHashes = new Set();
const hashToTaskId = new Map();
const statusAllowed = new Set(["available", "occupied", "maintenance"]);

function saveBufferToUploads(file) {
  const ext = path.extname(file.originalname || "") || ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const fullPath = path.join(uploadsDir, filename);
  fs.writeFileSync(fullPath, file.buffer);
  return `/uploads/${filename}`;
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.get("/api/workers", (_, res) => res.json(db.workers));

app.post("/api/workers", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required." });
  const id = `w${Date.now()}`;
  const worker = { id, name };
  db.workers.push(worker);
  return res.status(201).json(worker);
});

app.delete("/api/workers/:id", (req, res) => {
  const idx = db.workers.findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Worker not found." });
  db.workers.splice(idx, 1);
  return res.json({ ok: true });
});

app.get("/api/stats", (_, res) => {
  const available = db.rooms.filter((r) => r.status === "available").length;
  const occupied = db.rooms.filter((r) => r.status === "occupied").length;
  const maintenance = db.rooms.filter((r) => r.status === "maintenance").length;
  const pendingTasks = db.tasks.filter((t) => t.status === "pending").length;
  const completedTasks = db.tasks.filter((t) => t.status === "completed").length;

  res.json({
    roomsTotal: db.rooms.length,
    available,
    occupied,
    maintenance,
    pendingTasks,
    completedTasks,
    issuesOpen: db.issues.filter((i) => i.status === "open").length,
  });
});

app.get("/api/rooms", (_, res) => res.json(db.rooms));

app.post("/api/rooms", (req, res) => {
  const { code, floor, status = "available" } = req.body;
  if (!code || !floor) return res.status(400).json({ error: "code and floor are required." });
  if (db.rooms.find((r) => r.code.toLowerCase() === code.toLowerCase()))
    return res.status(409).json({ error: "Room code already exists." });
  if (!statusAllowed.has(status)) return res.status(400).json({ error: "Invalid status." });
  const room = { id: db.rooms.length + 1, code, floor: Number(floor), status };
  db.rooms.push(room);
  return res.status(201).json(room);
});

app.patch("/api/rooms/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!statusAllowed.has(status)) return res.status(400).json({ error: "Invalid room status." });
  const room = db.rooms.find((r) => r.id === id);
  if (!room) return res.status(404).json({ error: "Room not found." });

  room.status = status;
  return res.json(room);
});

app.get("/api/tasks", (req, res) => {
  const { workerId } = req.query;
  let tasks = db.tasks;
  if (workerId) tasks = tasks.filter((t) => t.workerId === workerId);
  res.json(tasks.sort((a, b) => b.id - a.id));
});

app.post("/api/tasks", (req, res) => {
  const { roomCode, title, notes = "", workerId } = req.body;
  if (!roomCode || !title || !workerId) return res.status(400).json({ error: "roomCode, title, workerId are required." });
  const worker = db.workers.find((w) => w.id === workerId);
  if (!worker) return res.status(400).json({ error: "Worker not found." });

  const task = {
    id: taskIdSeq++,
    roomCode,
    title,
    notes,
    status: "pending",
    workerId,
    createdAt: new Date().toISOString(),
    completedAt: null,
    proofImageUrl: null,
    proofImageHash: null,
  };
  db.tasks.push(task);
  return res.status(201).json(task);
});

app.post("/api/tasks/:id/complete", upload.single("image"), (req, res) => {
  const taskId = Number(req.params.id);
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) return res.status(404).json({ error: "Task not found." });
  if (task.status === "completed") return res.status(400).json({ error: "Task already completed." });
  if (!req.file) return res.status(400).json({ error: "Image proof is required." });

  const hash = sha256(req.file.buffer);
  if (usedImageHashes.has(hash)) {
    const existingTaskId = hashToTaskId.get(hash);
    if (existingTaskId !== task.id) return res.status(409).json({ error: "Duplicate image detected." });
  }

  const proofImageUrl = saveBufferToUploads(req.file);
  task.status = "completed";
  task.completedAt = new Date().toISOString();
  task.proofImageUrl = proofImageUrl;
  task.proofImageHash = hash;

  usedImageHashes.add(hash);
  hashToTaskId.set(hash, task.id);

  return res.json(task);
});

app.get("/api/reviews", (_, res) => {
  res.json(db.reviews.sort((a, b) => b.id - a.id));
});

app.post("/api/reviews", (req, res) => {
  const { guestName = "Anonymous", roomCode, rating, comment } = req.body;
  if (!roomCode || !rating || !comment) return res.status(400).json({ error: "roomCode, rating, and comment are required." });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be between 1 and 5." });
  const review = { id: reviewIdSeq++, guestName, roomCode, rating, comment, createdAt: new Date().toISOString() };
  db.reviews.push(review);
  return res.status(201).json(review);
});

app.get("/api/issues", (_, res) => {
  res.json(db.issues.sort((a, b) => b.id - a.id));
});

app.patch("/api/issues/:id/resolve", (req, res) => {
  const issue = db.issues.find((i) => i.id === Number(req.params.id));
  if (!issue) return res.status(404).json({ error: "Issue not found." });
  issue.status = "resolved";
  return res.json(issue);
});

app.post("/api/issues", upload.single("image"), (req, res) => {
  const { location, description = "" } = req.body;
  if (!location) return res.status(400).json({ error: "location is required." });
  if (!description && !req.file) return res.status(400).json({ error: "Provide a description or an image." });

  const imageUrl = req.file ? saveBufferToUploads(req.file) : null;
  const issue = {
    id: issueIdSeq++,
    location,
    description,
    imageUrl,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  db.issues.push(issue);

  const room = db.rooms.find((r) => r.code.toLowerCase() === location.toLowerCase());
  if (room && room.status !== "maintenance") room.status = "maintenance";

  return res.status(201).json(issue);
});

app.listen(PORT, () => {
  console.log(`Hotel Ops API running on http://localhost:${PORT}`);
});