const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Requested-With"],
  credentials: true,
}));

app.use(express.json({ limit: "50kb" }));

function csrfGuard(req, res, next) {
  if (["POST", "PATCH", "DELETE"].includes(req.method)) {
    if (!req.headers["x-requested-with"]) {
      return res.status(403).json({ error: "Forbidden: missing CSRF header." });
    }
  }
  next();
}
app.use(csrfGuard);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_, file, cb) {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed."));
    cb(null, true);
  },
});

const DB_PATH = path.join(__dirname, "db.json");

const DEFAULT_DB = {
  manager: { password: "admin1234" },
  settings: { hotelName: "", contactEmail: "" },
  rooms: [],
  workers: [],
  tasks: [],
  issues: [],
  reviews: [],
  tickets: [],
};

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

function saveDb() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db));
}

const db = loadDb();

if (!db.manager) db.manager = { password: "admin1234" };
if (!db.settings) db.settings = { hotelName: "", contactEmail: "" };
if (!db.reviews) db.reviews = [];
if (!db.tickets) db.tickets = [];

(function dedupeRooms() {
  const seen = new Set();
  let changed = false;
  db.rooms = db.rooms.filter((r) => {
    if (seen.has(r.id)) { changed = true; return false; }
    seen.add(r.id);
    return true;
  });
  if (changed) saveDb();
})();

const usedImageHashes = new Set(db.tasks.filter((t) => t.proofImageHash).map((t) => t.proofImageHash));
const hashToTaskId = new Map(db.tasks.filter((t) => t.proofImageHash).map((t) => [t.proofImageHash, t.id]));

let roomIdSeq = db.rooms.length ? Math.max(...db.rooms.map((r) => r.id)) + 1 : 1;
let taskIdSeq = db.tasks.length ? Math.max(...db.tasks.map((t) => t.id)) + 1 : 1;
let issueIdSeq = db.issues.length ? Math.max(...db.issues.map((i) => i.id)) + 1 : 1;
let reviewIdSeq = db.reviews.length ? Math.max(...db.reviews.map((r) => r.id)) + 1 : 1;

const statusAllowed = new Set(["available", "occupied", "maintenance"]);

// In-memory DND status map, seeded from existing rooms
let roomDndStatuses = {};
db.rooms.forEach((r) => {
  if (!roomDndStatuses[r.code]) {
    roomDndStatuses[r.code] = { status: r.status, dndUntil: null };
  }
});

const ALLOWED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function saveBufferToUploads(file) {
  const rawExt = path.extname(file.originalname || "").toLowerCase();
  const ext = ALLOWED_IMAGE_EXTS.has(rawExt) ? rawExt : ".jpg";
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const fullPath = path.join(uploadsDir, filename);
  if (!fullPath.startsWith(uploadsDir + path.sep) && fullPath !== uploadsDir) {
    throw new Error("Invalid file path.");
  }
  fs.writeFileSync(fullPath, file.buffer);
  return `/uploads/${filename}`;
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function multerError(err, req, res, next) {
  if (err) return res.status(400).json({ error: err.message });
  next();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post("/api/auth/manager/login", (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required." });
  if (password !== db.manager.password) return res.status(401).json({ error: "Incorrect password." });
  return res.json({ ok: true });
});

app.post("/api/auth/manager/change-password", (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both passwords required." });
  if (currentPassword !== db.manager.password) return res.status(401).json({ error: "Incorrect current password." });
  if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });
  db.manager.password = newPassword;
  saveDb();
  return res.json({ ok: true });
});

app.post("/api/auth/worker/login", (req, res) => {
  const { workerId, pin } = req.body;
  const worker = db.workers.find((w) => w.id === workerId);
  if (!worker) return res.status(404).json({ error: "Worker not found." });
  if (worker.pin !== String(pin)) return res.status(401).json({ error: "Incorrect PIN." });
  return res.json({ ok: true, worker: { id: worker.id, name: worker.name } });
});

// ── Settings ──────────────────────────────────────────────────────────────────
app.get("/api/settings", (_, res) => res.json(db.settings));

app.patch("/api/settings", (req, res) => {
  const { hotelName, contactEmail } = req.body;
  if (hotelName !== undefined) db.settings.hotelName = hotelName;
  if (contactEmail !== undefined) db.settings.contactEmail = contactEmail;
  saveDb();
  return res.json(db.settings);
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ ok: true }));

// ── Workers ───────────────────────────────────────────────────────────────────
app.get("/api/workers", (_, res) => res.json(db.workers.map((w) => ({ id: w.id, name: w.name }))));

app.post("/api/workers", (req, res) => {
  const { name, pin } = req.body;
  if (!name) return res.status(400).json({ error: "name is required." });
  if (!pin || String(pin).length < 4) return res.status(400).json({ error: "PIN must be at least 4 digits." });
  const id = `w${Date.now()}`;
  const worker = { id, name, pin: String(pin) };
  db.workers.push(worker);
  saveDb();
  return res.status(201).json({ id: worker.id, name: worker.name });
});

app.patch("/api/workers/:id/pin", (req, res) => {
  const worker = db.workers.find((w) => w.id === req.params.id);
  if (!worker) return res.status(404).json({ error: "Worker not found." });
  const { pin } = req.body;
  if (!pin || String(pin).length < 4) return res.status(400).json({ error: "PIN must be at least 4 digits." });
  worker.pin = String(pin);
  saveDb();
  return res.json({ ok: true });
});

app.delete("/api/workers/:id", (req, res) => {
  const idx = db.workers.findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Worker not found." });
  db.workers.splice(idx, 1);
  saveDb();
  return res.json({ ok: true });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get("/api/stats", (_, res) => {
  res.json({
    roomsTotal: db.rooms.length,
    available: db.rooms.filter((r) => r.status === "available").length,
    occupied: db.rooms.filter((r) => r.status === "occupied").length,
    maintenance: db.rooms.filter((r) => r.status === "maintenance").length,
    pendingTasks: db.tasks.filter((t) => t.status === "pending").length,
    unassignedTasks: db.tasks.filter((t) => t.status === "unassigned").length,
    completedTasks: db.tasks.filter((t) => t.status === "completed").length,
    issuesOpen: db.issues.filter((i) => i.status === "open").length,
  });
});

// ── Rooms ─────────────────────────────────────────────────────────────────────
app.get("/api/rooms", (_, res) => res.json(db.rooms));

app.post("/api/rooms/bulk", (req, res) => {
  const { prefix, floor, from, to, status = "available" } = req.body;
  if (!prefix || !floor || from == null || to == null)
    return res.status(400).json({ error: "prefix, floor, from, and to are required." });
  if (!statusAllowed.has(status)) return res.status(400).json({ error: "Invalid status." });
  const start = Number(from);
  const end = Number(to);
  if (isNaN(start) || isNaN(end) || start > end || end - start > 199)
    return res.status(400).json({ error: "Invalid range. Max 200 rooms at once." });

  const existingCodes = new Set(db.rooms.map((r) => r.code.toLowerCase()));
  const floorNum = Number(floor);
  const created = [];
  const skipped = [];

  for (let n = start; n <= end; n++) {
    const code = `${prefix}${n}`;
    if (existingCodes.has(code.toLowerCase())) { skipped.push(code); continue; }
    const room = { id: roomIdSeq++, code, floor: floorNum, status };
    db.rooms.push(room);
    existingCodes.add(code.toLowerCase());
    created.push(room);
    if (!roomDndStatuses[code]) roomDndStatuses[code] = { status, dndUntil: null };
  }

  if (created.length) saveDb();
  return res.status(201).json({ created: created.length, skipped: skipped.length, skippedCodes: skipped });
});

app.post("/api/rooms", (req, res) => {
  const { code, floor, status = "available" } = req.body;
  if (!code || !floor) return res.status(400).json({ error: "code and floor are required." });
  if (db.rooms.find((r) => r.code.toLowerCase() === code.toLowerCase()))
    return res.status(409).json({ error: "Room code already exists." });
  if (!statusAllowed.has(status)) return res.status(400).json({ error: "Invalid status." });
  const room = { id: roomIdSeq++, code, floor: Number(floor), status };
  db.rooms.push(room);
  if (!roomDndStatuses[code]) roomDndStatuses[code] = { status, dndUntil: null };
  saveDb();
  return res.status(201).json(room);
});

app.patch("/api/rooms/:id/status", (req, res) => {
  const room = db.rooms.find((r) => r.id === Number(req.params.id));
  if (!room) return res.status(404).json({ error: "Room not found." });
  const { status } = req.body;
  if (!statusAllowed.has(status)) return res.status(400).json({ error: "Invalid room status." });
  room.status = status;
  if (roomDndStatuses[room.code]) roomDndStatuses[room.code].status = status;
  saveDb();
  return res.json(room);
});

// ── Tasks ─────────────────────────────────────────────────────────────────────
app.get("/api/tasks", (req, res) => {
  const { workerId, status } = req.query;
  let tasks = db.tasks;
  if (workerId) tasks = tasks.filter((t) => t.workerId === workerId);
  if (status) tasks = tasks.filter((t) => t.status === status);
  res.json(tasks.sort((a, b) => b.id - a.id));
});

app.patch("/api/tasks/:id/assign", (req, res) => {
  const task = db.tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found." });
  const { workerId } = req.body;
  const worker = db.workers.find((w) => w.id === workerId);
  if (!worker) return res.status(400).json({ error: "Worker not found." });
  task.workerId = workerId;
  task.status = "pending";
  task.assignedAt = new Date().toISOString();
  saveDb();
  return res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { roomCode, title, notes = "", workerId } = req.body;
  if (!roomCode || !title) return res.status(400).json({ error: "roomCode and title are required." });

  const room = db.rooms.find((r) => r.code.toLowerCase() === roomCode.toLowerCase());
  if (!room) return res.status(400).json({ error: `Room "${roomCode}" does not exist.` });

  if (workerId) {
    const worker = db.workers.find((w) => w.id === workerId);
    if (!worker) return res.status(400).json({ error: "Worker not found." });
  }

  const task = {
    id: taskIdSeq++,
    roomCode: room.code,
    title,
    notes,
    status: workerId ? "pending" : "unassigned",
    workerId: workerId || null,
    createdAt: new Date().toISOString(),
    assignedAt: workerId ? new Date().toISOString() : null,
    completedAt: null,
    proofImageUrl: null,
    proofImageHash: null,
    issueId: null,
  };
  db.tasks.push(task);
  saveDb();
  return res.status(201).json(task);
});

app.post("/api/tasks/:id/complete", upload.single("image"), multerError, (req, res) => {
  const task = db.tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found." });
  if (task.status === "completed") return res.status(400).json({ error: "Task already completed." });
  if (!req.file) return res.status(400).json({ error: "Image proof is required." });

  const hash = sha256(req.file.buffer);
  if (usedImageHashes.has(hash)) {
    const existingTaskId = hashToTaskId.get(hash);
    if (existingTaskId !== task.id) return res.status(409).json({ error: "Duplicate image detected. Please take a new photo." });
  }

  task.proofImageUrl = saveBufferToUploads(req.file);
  task.status = "completed";
  task.completedAt = new Date().toISOString();
  task.proofImageHash = hash;

  usedImageHashes.add(hash);
  hashToTaskId.set(hash, task.id);

  if (task.issueId) {
    const issue = db.issues.find((i) => i.id === task.issueId);
    if (issue && issue.status === "open") issue.status = "resolved";
  }

  saveDb();
  return res.json(task);
});

// ── Issues ────────────────────────────────────────────────────────────────────
app.get("/api/issues", (_, res) => res.json(db.issues.sort((a, b) => b.id - a.id)));

app.patch("/api/issues/:id/resolve", (req, res) => {
  const issue = db.issues.find((i) => i.id === Number(req.params.id));
  if (!issue) return res.status(404).json({ error: "Issue not found." });
  issue.status = "resolved";
  saveDb();
  return res.json(issue);
});

app.post("/api/issues", upload.single("image"), multerError, (req, res) => {
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

  const task = {
    id: taskIdSeq++,
    roomCode: location,
    title: `Fix complaint: ${description ? description.slice(0, 60) : "Guest complaint"}`,
    notes: description,
    status: "unassigned",
    workerId: null,
    createdAt: new Date().toISOString(),
    assignedAt: null,
    completedAt: null,
    proofImageUrl: null,
    proofImageHash: null,
    issueId: issue.id,
  };
  db.tasks.push(task);

  saveDb();
  return res.status(201).json(issue);
});

// ── Reviews ───────────────────────────────────────────────────────────────────
app.get("/api/reviews", (_, res) => res.json(db.reviews.sort((a, b) => b.id - a.id)));

app.post("/api/reviews", (req, res) => {
  const { guestName = "Anonymous", roomCode, rating, comment } = req.body;
  if (!roomCode || !rating || !comment) return res.status(400).json({ error: "roomCode, rating, and comment are required." });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be between 1 and 5." });
  const review = { id: reviewIdSeq++, guestName, roomCode, rating: Number(rating), comment, createdAt: new Date().toISOString() };
  db.reviews.push(review);
  saveDb();
  return res.status(201).json(review);
});

// ── Tickets ───────────────────────────────────────────────────────────────────
app.get("/api/tickets", (req, res) => {
  res.json(db.tickets);
});

app.get("/api/tickets/:id", (req, res) => {
  const ticket = db.tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket);
});

app.post("/api/tickets", (req, res) => {
  const { room, title, category, priority, description, photo, submittedBy } = req.body;

  const newTicket = {
    id: `TK-${String(db.tickets.length + 1).padStart(3, "0")}`,
    room,
    title,
    category,
    priority: priority || "normal",
    status: "open",
    submittedAt: new Date(),
    submittedBy: submittedBy || "guest",
    description,
    photo,
    assignedTo: null,
    resolvedAt: null,
  };

  db.tickets.push(newTicket);

  if (priority === "urgent") {
    console.log(`URGENT ALERT: ${title} in Room ${room}`);
  }

  saveDb();
  res.status(201).json(newTicket);
});

app.patch("/api/tickets/:id", (req, res) => {
  const ticketIndex = db.tickets.findIndex((t) => t.id === req.params.id);
  if (ticketIndex === -1) return res.status(404).json({ error: "Ticket not found" });

  const updates = req.body;
  db.tickets[ticketIndex] = { ...db.tickets[ticketIndex], ...updates };

  if (updates.status === "resolved" && !db.tickets[ticketIndex].resolvedAt) {
    db.tickets[ticketIndex].resolvedAt = new Date();
  }

  saveDb();
  res.json(db.tickets[ticketIndex]);
});

app.delete("/api/tickets/:id", (req, res) => {
  const ticketIndex = db.tickets.findIndex((t) => t.id === req.params.id);
  if (ticketIndex === -1) return res.status(404).json({ error: "Ticket not found" });
  db.tickets.splice(ticketIndex, 1);
  saveDb();
  res.json({ message: "Ticket deleted" });
});

// ── Room DND Statuses ─────────────────────────────────────────────────────────
app.get("/api/room-statuses", (req, res) => {
  const now = new Date();
  Object.keys(roomDndStatuses).forEach((room) => {
    if (
      roomDndStatuses[room].status === "dnd" &&
      roomDndStatuses[room].dndUntil &&
      new Date(roomDndStatuses[room].dndUntil) < now
    ) {
      roomDndStatuses[room].status = "available";
      roomDndStatuses[room].dndUntil = null;
    }
  });
  res.json(roomDndStatuses);
});

app.patch("/api/rooms/:room/dnd", (req, res) => {
  const { room } = req.params;
  const { status, dndHours } = req.body;

  if (!roomDndStatuses[room]) {
    roomDndStatuses[room] = { status: "available", dndUntil: null };
  }

  roomDndStatuses[room].status = status;

  if (status === "dnd" && dndHours) {
    roomDndStatuses[room].dndUntil = new Date(Date.now() + dndHours * 3600000);
  } else {
    roomDndStatuses[room].dndUntil = null;
  }

  res.json(roomDndStatuses[room]);
});

// ── Dashboard Stats ───────────────────────────────────────────────────────────
app.get("/api/dashboard/stats", (req, res) => {
  const now = new Date();
  const stats = {
    openTickets: db.tickets.filter((t) => t.status === "open").length,
    dndRooms: Object.values(roomDndStatuses).filter((r) => r.status === "dnd").length,
    resolvedToday: db.tickets.filter((t) => {
      if (!t.resolvedAt) return false;
      return new Date(t.resolvedAt).toDateString() === now.toDateString();
    }).length,
    avgResolutionTime: calculateAvgResolution(db.tickets),
  };
  res.json(stats);
});

function calculateAvgResolution(tickets) {
  const resolved = tickets.filter((t) => t.resolvedAt && t.submittedAt);
  if (resolved.length === 0) return "0m";
  const totalMinutes = resolved.reduce((sum, t) => {
    return sum + (new Date(t.resolvedAt) - new Date(t.submittedAt)) / 60000;
  }, 0);
  const avg = Math.round(totalMinutes / resolved.length);
  return avg < 60 ? `${avg}m` : `${Math.floor(avg / 60)}h ${avg % 60}m`;
}

app.listen(PORT, () => console.log(`Hotel Ops API running on http://localhost:${PORT}`));