require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { USE_POSTGRES, pgOps, loadJsonDb, saveJsonDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 8000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

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

// Serve Frontend static files in production
if (IS_PRODUCTION) {
  const frontendPath = path.join(__dirname, "../Frontend/dist");
  app.use(express.static(frontendPath));
  console.log(`✓ Serving frontend from ${frontendPath}`);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_, file, cb) {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed."));
    cb(null, true);
  },
});

let db = USE_POSTGRES ? null : loadJsonDb();
let roomIdSeq, taskIdSeq, issueIdSeq, reviewIdSeq, ticketSeq;
const usedImageHashes = new Set();
const hashToTaskId = new Map();

if (!USE_POSTGRES) {
  if (!db.manager) db.manager = { password: "admin1234" };
  if (!db.settings) db.settings = { hotelName: "", contactEmail: "" };
  if (!db.reviews) db.reviews = [];
  db.issues.forEach((issue, idx) => {
    if (!issue.ticketNo) {
      issue.ticketNo = `TKT-${String(idx + 1).padStart(4, "0")}`;
      issue.ticketSeq = idx + 1;
    }
    if (!issue.resolvedAt) issue.resolvedAt = null;
  });
  const seen = new Set();
  db.rooms = db.rooms.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
  db.tasks.filter((t) => t.proofImageHash).forEach((t) => {
    usedImageHashes.add(t.proofImageHash);
    hashToTaskId.set(t.proofImageHash, t.id);
  });
  roomIdSeq = db.rooms.length ? Math.max(...db.rooms.map((r) => r.id)) + 1 : 1;
  taskIdSeq = db.tasks.length ? Math.max(...db.tasks.map((t) => t.id)) + 1 : 1;
  issueIdSeq = db.issues.length ? Math.max(...db.issues.map((i) => i.id)) + 1 : 1;
  reviewIdSeq = db.reviews.length ? Math.max(...db.reviews.map((r) => r.id)) + 1 : 1;
  ticketSeq = db.issues.length ? Math.max(...db.issues.map((i) => i.ticketSeq || 0), 0) + 1 : 1;
}

console.log(`✓ Using ${USE_POSTGRES ? "PostgreSQL" : "JSON"} database`);

const statusAllowed = new Set(["available", "occupied", "maintenance"]);
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

// Auth
app.post("/api/auth/manager/login", async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required." });
  const manager = USE_POSTGRES ? await pgOps.getManager() : db.manager;
  if (password !== manager.password) return res.status(401).json({ error: "Incorrect password." });
  return res.json({ ok: true });
});

app.post("/api/auth/manager/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both passwords required." });
  const manager = USE_POSTGRES ? await pgOps.getManager() : db.manager;
  if (currentPassword !== manager.password) return res.status(401).json({ error: "Incorrect current password." });
  if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });
  if (USE_POSTGRES) {
    await pgOps.updateManager(newPassword);
  } else {
    db.manager.password = newPassword;
    saveJsonDb(db);
  }
  return res.json({ ok: true });
});

app.post("/api/auth/worker/login", async (req, res) => {
  const { workerId, pin } = req.body;
  const workers = USE_POSTGRES ? await pgOps.getWorkers() : db.workers;
  const worker = workers.find((w) => w.id === workerId);
  if (!worker) return res.status(404).json({ error: "Worker not found." });
  if (worker.pin !== String(pin)) return res.status(401).json({ error: "Incorrect PIN." });
  return res.json({ ok: true, worker: { id: worker.id, name: worker.name } });
});

// Settings
app.get("/api/settings", async (_, res) => {
  const settings = USE_POSTGRES ? await pgOps.getSettings() : db.settings;
  res.json(settings);
});

app.patch("/api/settings", async (req, res) => {
  const { hotelName, contactEmail } = req.body;
  if (USE_POSTGRES) {
    const updates = {};
    if (hotelName !== undefined) updates.hotel_name = hotelName;
    if (contactEmail !== undefined) updates.contact_email = contactEmail;
    await pgOps.updateSettings(updates);
    const settings = await pgOps.getSettings();
    return res.json(settings);
  } else {
    if (hotelName !== undefined) db.settings.hotelName = hotelName;
    if (contactEmail !== undefined) db.settings.contactEmail = contactEmail;
    saveJsonDb(db);
    return res.json(db.settings);
  }
});

app.get("/api/health", (_, res) => res.json({ ok: true }));

// Workers
app.get("/api/workers", async (_, res) => {
  const workers = USE_POSTGRES ? await pgOps.getWorkers() : db.workers;
  res.json(workers.map((w) => ({ id: w.id, name: w.name })));
});

app.post("/api/workers", async (req, res) => {
  const { name, pin } = req.body;
  if (!name) return res.status(400).json({ error: "name is required." });
  if (!pin || String(pin).length < 4) return res.status(400).json({ error: "PIN must be at least 4 digits." });
  const id = `w${Date.now()}`;
  const worker = { id, name, pin: String(pin) };
  if (USE_POSTGRES) {
    await pgOps.createWorker(worker);
  } else {
    db.workers.push(worker);
    saveJsonDb(db);
  }
  return res.status(201).json({ id: worker.id, name: worker.name });
});

app.patch("/api/workers/:id/pin", async (req, res) => {
  const { pin } = req.body;
  if (!pin || String(pin).length < 4) return res.status(400).json({ error: "PIN must be at least 4 digits." });
  if (USE_POSTGRES) {
    const worker = await pgOps.updateWorker(req.params.id, { pin: String(pin) });
    if (!worker) return res.status(404).json({ error: "Worker not found." });
  } else {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found." });
    worker.pin = String(pin);
    saveJsonDb(db);
  }
  return res.json({ ok: true });
});

app.delete("/api/workers/:id", async (req, res) => {
  if (USE_POSTGRES) {
    await pgOps.deleteWorker(req.params.id);
  } else {
    const idx = db.workers.findIndex((w) => w.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Worker not found." });
    db.workers.splice(idx, 1);
    saveJsonDb(db);
  }
  return res.json({ ok: true });
});

// Stats
app.get("/api/stats", async (_, res) => {
  const rooms = USE_POSTGRES ? await pgOps.getRooms() : db.rooms;
  const tasks = USE_POSTGRES ? await pgOps.getTasks() : db.tasks;
  const issues = USE_POSTGRES ? await pgOps.getIssues() : db.issues;
  res.json({
    roomsTotal: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
    pendingTasks: tasks.filter((t) => t.status === "pending").length,
    unassignedTasks: tasks.filter((t) => t.status === "unassigned").length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
    issuesOpen: issues.filter((i) => i.status === "open").length,
  });
});

// Rooms
app.get("/api/rooms", async (_, res) => {
  const rooms = USE_POSTGRES ? await pgOps.getRooms() : db.rooms;
  res.json(rooms);
});

app.post("/api/rooms/bulk", async (req, res) => {
  const { prefix, floor, from, to, status = "available" } = req.body;
  if (!prefix || !floor || from == null || to == null)
    return res.status(400).json({ error: "prefix, floor, from, and to are required." });
  if (!statusAllowed.has(status)) return res.status(400).json({ error: "Invalid status." });
  const start = Number(from);
  const end = Number(to);
  if (isNaN(start) || isNaN(end) || start > end || end - start > 199)
    return res.status(400).json({ error: "Invalid range. Max 200 rooms at once." });

  const rooms = USE_POSTGRES ? await pgOps.getRooms() : db.rooms;
  const existingCodes = new Set(rooms.map((r) => r.code.toLowerCase()));
  const floorNum = Number(floor);
  const created = [];
  const skipped = [];

  for (let n = start; n <= end; n++) {
    const code = `${prefix}${n}`;
    if (existingCodes.has(code.toLowerCase())) { skipped.push(code); continue; }
    const room = { code, floor: floorNum, status };
    if (USE_POSTGRES) {
      await pgOps.createRoom(room);
    } else {
      room.id = roomIdSeq++;
      db.rooms.push(room);
    }
    existingCodes.add(code.toLowerCase());
    created.push(room);
  }

  if (!USE_POSTGRES && created.length) saveJsonDb(db);
  return res.status(201).json({ created: created.length, skipped: skipped.length, skippedCodes: skipped });
});

app.post("/api/rooms", async (req, res) => {
  const { code, floor, status = "available" } = req.body;
  if (!code || !floor) return res.status(400).json({ error: "code and floor are required." });
  const rooms = USE_POSTGRES ? await pgOps.getRooms() : db.rooms;
  if (rooms.find((r) => r.code.toLowerCase() === code.toLowerCase()))
    return res.status(409).json({ error: "Room code already exists." });
  if (!statusAllowed.has(status)) return res.status(400).json({ error: "Invalid status." });
  const room = { code, floor: Number(floor), status };
  if (USE_POSTGRES) {
    const created = await pgOps.createRoom(room);
    return res.status(201).json(created);
  } else {
    room.id = roomIdSeq++;
    db.rooms.push(room);
    saveJsonDb(db);
    return res.status(201).json(room);
  }
});

app.patch("/api/rooms/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!statusAllowed.has(status)) return res.status(400).json({ error: "Invalid room status." });
  if (USE_POSTGRES) {
    const room = await pgOps.updateRoom(Number(req.params.id), { status });
    if (!room) return res.status(404).json({ error: "Room not found." });
    return res.json(room);
  } else {
    const room = db.rooms.find((r) => r.id === Number(req.params.id));
    if (!room) return res.status(404).json({ error: "Room not found." });
    room.status = status;
    saveJsonDb(db);
    return res.json(room);
  }
});

// Tasks
app.get("/api/tasks", async (req, res) => {
  const { workerId, status } = req.query;
  let tasks = USE_POSTGRES ? await pgOps.getTasks({ workerId, status }) : db.tasks;
  if (!USE_POSTGRES) {
    if (workerId) tasks = tasks.filter((t) => t.workerId === workerId);
    if (status) tasks = tasks.filter((t) => t.status === status);
    tasks = tasks.sort((a, b) => b.id - a.id);
  }
  res.json(tasks);
});

app.patch("/api/tasks/:id/assign", async (req, res) => {
  const { workerId } = req.body;
  const workers = USE_POSTGRES ? await pgOps.getWorkers() : db.workers;
  const worker = workers.find((w) => w.id === workerId);
  if (!worker) return res.status(400).json({ error: "Worker not found." });
  
  if (USE_POSTGRES) {
    const task = await pgOps.updateTask(Number(req.params.id), {
      worker_id: workerId,
      status: "pending",
      assigned_at: new Date().toISOString(),
    });
    if (!task) return res.status(404).json({ error: "Task not found." });
    return res.json(task);
  } else {
    const task = db.tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found." });
    task.workerId = workerId;
    task.status = "pending";
    task.assignedAt = new Date().toISOString();
    saveJsonDb(db);
    return res.json(task);
  }
});

app.post("/api/tasks", async (req, res) => {
  const { roomCode, title, notes = "", workerId } = req.body;
  if (!roomCode || !title) return res.status(400).json({ error: "roomCode and title are required." });

  const rooms = USE_POSTGRES ? await pgOps.getRooms() : db.rooms;
  const room = rooms.find((r) => r.code.toLowerCase() === roomCode.toLowerCase());
  if (!room) return res.status(400).json({ error: `Room "${roomCode}" does not exist.` });

  if (workerId) {
    const workers = USE_POSTGRES ? await pgOps.getWorkers() : db.workers;
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return res.status(400).json({ error: "Worker not found." });
  }

  const task = {
    room_code: room.code,
    title,
    notes,
    status: workerId ? "pending" : "unassigned",
    worker_id: workerId || null,
    created_at: new Date().toISOString(),
    assigned_at: workerId ? new Date().toISOString() : null,
    completed_at: null,
    proof_image_url: null,
    proof_image_hash: null,
    issue_id: null,
  };

  if (USE_POSTGRES) {
    const created = await pgOps.createTask(task);
    return res.status(201).json(created);
  } else {
    task.id = taskIdSeq++;
    task.roomCode = task.room_code;
    task.workerId = task.worker_id;
    task.createdAt = task.created_at;
    task.assignedAt = task.assigned_at;
    task.completedAt = task.completed_at;
    task.proofImageUrl = task.proof_image_url;
    task.proofImageHash = task.proof_image_hash;
    task.issueId = task.issue_id;
    db.tasks.push(task);
    saveJsonDb(db);
    return res.status(201).json(task);
  }
});

app.post("/api/tasks/:id/complete", upload.single("image"), multerError, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image proof is required." });

  const hash = sha256(req.file.buffer);
  if (usedImageHashes.has(hash)) {
    const existingTaskId = hashToTaskId.get(hash);
    if (existingTaskId !== Number(req.params.id)) 
      return res.status(409).json({ error: "Duplicate image detected. Please take a new photo." });
  }

  const imageUrl = saveBufferToUploads(req.file);
  
  if (USE_POSTGRES) {
    const tasks = await pgOps.getTasks();
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found." });
    if (task.status === "completed") return res.status(400).json({ error: "Task already completed." });

    const updated = await pgOps.updateTask(task.id, {
      proof_image_url: imageUrl,
      status: "completed",
      completed_at: new Date().toISOString(),
      proof_image_hash: hash,
    });

    if (task.issue_id) {
      const issues = await pgOps.getIssues();
      const issue = issues.find((i) => i.id === task.issue_id);
      if (issue && issue.status === "open") {
        await pgOps.updateIssue(issue.id, { status: "resolved" });
      }
    }

    usedImageHashes.add(hash);
    hashToTaskId.set(hash, task.id);
    return res.json(updated);
  } else {
    const task = db.tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found." });
    if (task.status === "completed") return res.status(400).json({ error: "Task already completed." });

    task.proofImageUrl = imageUrl;
    task.status = "completed";
    task.completedAt = new Date().toISOString();
    task.proofImageHash = hash;

    usedImageHashes.add(hash);
    hashToTaskId.set(hash, task.id);

    if (task.issueId) {
      const issue = db.issues.find((i) => i.id === task.issueId);
      if (issue && issue.status === "open") {
        issue.status = "resolved";
        issue.resolvedAt = new Date().toISOString();
        
        // Remove room from maintenance when issue is resolved
        const room = db.rooms.find((r) => r.code.toLowerCase() === issue.location.toLowerCase());
        if (room && room.status === "maintenance") {
          room.status = "available";
        }
      }
    }

    saveJsonDb(db);
    return res.json(task);
  }
});

// Issues
app.get("/api/issues/ticket/:ticketNo", async (req, res) => {
  const issue = USE_POSTGRES 
    ? await pgOps.getIssueByTicket(req.params.ticketNo.toUpperCase())
    : db.issues.find((i) => i.ticketNo === req.params.ticketNo.toUpperCase());
  if (!issue) return res.status(404).json({ error: "Ticket not found." });
  return res.json({
    ticketNo: issue.ticketNo || issue.ticket_no,
    location: issue.location,
    description: issue.description,
    status: issue.status,
    createdAt: issue.createdAt || issue.created_at,
    resolvedAt: issue.resolvedAt || issue.resolved_at || null,
  });
});

app.get("/api/issues", async (_, res) => {
  const issues = USE_POSTGRES ? await pgOps.getIssues() : db.issues.sort((a, b) => b.id - a.id);
  res.json(issues);
});

app.patch("/api/issues/:id/resolve", async (req, res) => {
  if (USE_POSTGRES) {
    const issues = await pgOps.getIssues();
    const issue = issues.find((i) => i.id === Number(req.params.id));
    if (!issue) return res.status(404).json({ error: "Issue not found." });
    
    await pgOps.updateIssue(Number(req.params.id), {
      status: "resolved",
      resolved_at: new Date().toISOString(),
    });
    
    // Remove room from maintenance
    const rooms = await pgOps.getRooms();
    const room = rooms.find((r) => r.code.toLowerCase() === issue.location.toLowerCase());
    if (room && room.status === "maintenance") {
      await pgOps.updateRoom(room.id, { status: "available" });
    }
    
    return res.json(issue);
  } else {
    const issue = db.issues.find((i) => i.id === Number(req.params.id));
    if (!issue) return res.status(404).json({ error: "Issue not found." });
    issue.status = "resolved";
    issue.resolvedAt = new Date().toISOString();
    
    // Remove room from maintenance
    const room = db.rooms.find((r) => r.code.toLowerCase() === issue.location.toLowerCase());
    if (room && room.status === "maintenance") {
      room.status = "available";
    }
    
    saveJsonDb(db);
    return res.json(issue);
  }
});

app.post("/api/issues", upload.single("image"), multerError, async (req, res) => {
  const { location, description = "" } = req.body;
  if (!location) return res.status(400).json({ error: "location is required." });
  if (!description && !req.file) return res.status(400).json({ error: "Provide a description or an image." });

  const imageUrl = req.file ? saveBufferToUploads(req.file) : null;
  
  if (USE_POSTGRES) {
    const issues = await pgOps.getIssues();
    const maxSeq = issues.length ? Math.max(...issues.map((i) => i.ticket_seq || 0)) : 0;
    const ticketNo = `TKT-${String(maxSeq + 1).padStart(4, "0")}`;
    
    const issue = await pgOps.createIssue({
      ticket_no: ticketNo,
      ticket_seq: maxSeq + 1,
      location,
      description,
      image_url: imageUrl,
      status: "open",
      created_at: new Date().toISOString(),
      resolved_at: null,
    });

    const rooms = await pgOps.getRooms();
    const room = rooms.find((r) => r.code.toLowerCase() === location.toLowerCase());
    if (room && room.status !== "maintenance") {
      await pgOps.updateRoom(room.id, { status: "maintenance" });
    }

    const task = await pgOps.createTask({
      room_code: location,
      title: `Fix complaint: ${description ? description.slice(0, 60) : "Guest complaint"}`,
      notes: description,
      status: "unassigned",
      worker_id: null,
      created_at: new Date().toISOString(),
      assigned_at: null,
      completed_at: null,
      proof_image_url: null,
      proof_image_hash: null,
      issue_id: issue.id,
    });

    return res.status(201).json(issue);
  } else {
    const ticketNo = `TKT-${String(ticketSeq++).padStart(4, "0")}`;
    const issue = {
      id: issueIdSeq++,
      ticketNo,
      ticketSeq: ticketSeq - 1,
      location,
      description,
      imageUrl,
      status: "open",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
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

    saveJsonDb(db);
    return res.status(201).json(issue);
  }
});

// Reviews
app.get("/api/reviews", async (_, res) => {
  const reviews = USE_POSTGRES ? await pgOps.getReviews() : db.reviews.sort((a, b) => b.id - a.id);
  res.json(reviews);
});

app.post("/api/reviews", async (req, res) => {
  const { guestName = "Anonymous", roomCode, rating, comment } = req.body;
  if (!roomCode || !rating || !comment) return res.status(400).json({ error: "roomCode, rating, and comment are required." });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be between 1 and 5." });
  
  const review = {
    guest_name: guestName,
    room_code: roomCode,
    rating: Number(rating),
    comment,
    created_at: new Date().toISOString(),
  };

  if (USE_POSTGRES) {
    const created = await pgOps.createReview(review);
    return res.status(201).json(created);
  } else {
    review.id = reviewIdSeq++;
    review.guestName = guestName;
    review.roomCode = roomCode;
    review.createdAt = review.created_at;
    db.reviews.push(review);
    saveJsonDb(db);
    return res.status(201).json(review);
  }
});

// Serve Frontend for all non-API routes (SPA fallback)
if (IS_PRODUCTION) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1' && !module.parent) {
  const server = app.listen(PORT, () => {
    console.log(`Hotel Ops API running on http://localhost:${PORT}`);
    console.log("✓ Server is ready and listening for requests");
    console.log("Press Ctrl+C to stop the server");
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
      const altServer = app.listen(PORT + 1, () => {
        console.log(`Hotel Ops API running on http://localhost:${PORT + 1}`);
        console.log("✓ Server is ready and listening for requests");
        console.log("Press Ctrl+C to stop the server");
      });
      altServer.on('error', (altErr) => {
        console.error('Failed to start server:', altErr.message);
        process.exit(1);
      });
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    if (server && server.close) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });

  process.on('SIGINT', () => {
    console.log('\nSIGINT received, closing server gracefully...');
    if (server && server.close) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });
}

// Export app for Vercel serverless
module.exports = app;
