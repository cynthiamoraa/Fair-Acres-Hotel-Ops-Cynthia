const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const USE_POSTGRES = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
const supabase = USE_POSTGRES ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY) : null;

const DB_PATH = path.join(__dirname, "db.json");
const DEFAULT_DB = {
  manager: { password: "admin1234" },
  settings: { hotelName: "", contactEmail: "" },
  rooms: [],
  workers: [],
  tasks: [],
  issues: [],
  reviews: [],
};

// JSON file operations
function loadJsonDb() {
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

function saveJsonDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db));
}

// PostgreSQL operations
const pgOps = {
  async getManager() {
    const { data } = await supabase.from("manager").select("*").single();
    return data || { password: "admin1234" };
  },
  async updateManager(password) {
    await supabase.from("manager").upsert({ id: 1, password });
  },
  async getSettings() {
    const { data } = await supabase.from("settings").select("*").single();
    return data || { hotelName: "", contactEmail: "" };
  },
  async updateSettings(settings) {
    await supabase.from("settings").upsert({ id: 1, ...settings });
  },
  async getRooms() {
    const { data } = await supabase.from("rooms").select("*").order("id");
    return data || [];
  },
  async createRoom(room) {
    const { data } = await supabase.from("rooms").insert(room).select().single();
    return data;
  },
  async updateRoom(id, updates) {
    const { data } = await supabase.from("rooms").update(updates).eq("id", id).select().single();
    return data;
  },
  async getWorkers() {
    const { data } = await supabase.from("workers").select("*");
    return data || [];
  },
  async createWorker(worker) {
    const { data } = await supabase.from("workers").insert(worker).select().single();
    return data;
  },
  async updateWorker(id, updates) {
    const { data } = await supabase.from("workers").update(updates).eq("id", id).select().single();
    return data;
  },
  async deleteWorker(id) {
    await supabase.from("workers").delete().eq("id", id);
  },
  async getTasks(filters = {}) {
    let query = supabase.from("tasks").select("*");
    if (filters.workerId) query = query.eq("workerId", filters.workerId);
    if (filters.status) query = query.eq("status", filters.status);
    const { data } = await query.order("id", { ascending: false });
    return data || [];
  },
  async createTask(task) {
    const { data } = await supabase.from("tasks").insert(task).select().single();
    return data;
  },
  async updateTask(id, updates) {
    const { data } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
    return data;
  },
  async getIssues() {
    const { data } = await supabase.from("issues").select("*").order("id", { ascending: false });
    return data || [];
  },
  async getIssueByTicket(ticketNo) {
    const { data } = await supabase.from("issues").select("*").eq("ticketNo", ticketNo).single();
    return data;
  },
  async createIssue(issue) {
    const { data } = await supabase.from("issues").insert(issue).select().single();
    return data;
  },
  async updateIssue(id, updates) {
    const { data } = await supabase.from("issues").update(updates).eq("id", id).select().single();
    return data;
  },
  async getReviews() {
    const { data } = await supabase.from("reviews").select("*").order("id", { ascending: false });
    return data || [];
  },
  async createReview(review) {
    const { data } = await supabase.from("reviews").insert(review).select().single();
    return data;
  },
};

module.exports = { USE_POSTGRES, supabase, pgOps, loadJsonDb, saveJsonDb };
