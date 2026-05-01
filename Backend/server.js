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
  rooms: [
    { id: 1, code: "Room101", floor: 1, status: "occupied" },
    { id: 2, code: "Room102", floor: 1, status: "available" },
    { id: 3, code: "Room103", floor: 1, status: "maintenance" },
    { id: 4, code: "Room201", floor: 2, status: "occupied" },
    { id: 5, code: "Room202", floor: 2, status: "available" },
    { id: 6, code: "Room203", floor: 2, status: "available" },
  ],
  workers: [
    { id: "w1", name: "Alex" },
    { id: "w2", name: "Sam" },
    { id: "w3", name: "Taylor" },
  ],
  tasks: [
    {
      id: 1,
      roomCode: "Room101",
      title: "Replace towels",
      notes: "2 bath towels + 2 hand towels",
      status: "pending",
      workerId: "w1",
      createdAt: new Date().toISOString(),
      completedAt: null,
      proofImageUrl: null,
      proofImageHash: null,
    },
  ],
  issues: [],
};

let taskIdSeq = db.tasks.length + 1;
let issueIdSeq = 1;
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

app.get("/api/issues", (_, res) => {
  res.json(db.issues.sort((a, b) => b.id - a.id));
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