const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

const USE_POSTGRES = !!process.env.DATABASE_URL;
const sql = USE_POSTGRES ? neon(process.env.DATABASE_URL) : null;

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
    try {
      const result = await sql`SELECT * FROM manager WHERE id = 1`;
      return result[0] || { password: "admin1234" };
    } catch (error) {
      console.error("getManager error:", error);
      return { password: "admin1234" };
    }
  },
  async updateManager(password) {
    try {
      await sql`INSERT INTO manager (id, password) VALUES (1, ${password}) ON CONFLICT (id) DO UPDATE SET password = ${password}`;
    } catch (error) {
      console.error("updateManager error:", error);
    }
  },
  async getSettings() {
    try {
      const result = await sql`SELECT * FROM settings WHERE id = 1`;
      const data = result[0];
      return data ? { hotelName: data.hotel_name || "", contactEmail: data.contact_email || "" } : { hotelName: "", contactEmail: "" };
    } catch (error) {
      console.error("getSettings error:", error);
      return { hotelName: "", contactEmail: "" };
    }
  },
  async updateSettings(settings) {
    try {
      await sql`INSERT INTO settings (id, hotel_name, contact_email) VALUES (1, ${settings.hotel_name || ""}, ${settings.contact_email || ""}) ON CONFLICT (id) DO UPDATE SET hotel_name = ${settings.hotel_name}, contact_email = ${settings.contact_email}`;
    } catch (error) {
      console.error("updateSettings error:", error);
    }
  },
  async getRooms() {
    try {
      const result = await sql`SELECT * FROM rooms ORDER BY id`;
      return result || [];
    } catch (error) {
      console.error("getRooms error:", error);
      return [];
    }
  },
  async createRoom(room) {
    try {
      const result = await sql`INSERT INTO rooms (code, floor, status) VALUES (${room.code}, ${room.floor}, ${room.status}) RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("createRoom error:", error);
      return null;
    }
  },
  async updateRoom(id, updates) {
    try {
      const result = await sql`UPDATE rooms SET status = ${updates.status} WHERE id = ${id} RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("updateRoom error:", error);
      return null;
    }
  },
  async getWorkers() {
    try {
      const result = await sql`SELECT * FROM workers`;
      return result || [];
    } catch (error) {
      console.error("getWorkers error:", error);
      return [];
    }
  },
  async createWorker(worker) {
    try {
      const result = await sql`INSERT INTO workers (id, name, pin) VALUES (${worker.id}, ${worker.name}, ${worker.pin}) RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("createWorker error:", error);
      return null;
    }
  },
  async updateWorker(id, updates) {
    try {
      const result = await sql`UPDATE workers SET pin = ${updates.pin} WHERE id = ${id} RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("updateWorker error:", error);
      return null;
    }
  },
  async deleteWorker(id) {
    try {
      await sql`DELETE FROM workers WHERE id = ${id}`;
    } catch (error) {
      console.error("deleteWorker error:", error);
    }
  },
  async getTasks(filters = {}) {
    try {
      let query = sql`SELECT * FROM tasks WHERE 1=1`;
      if (filters.workerId) {
        query = sql`SELECT * FROM tasks WHERE worker_id = ${filters.workerId}`;
      }
      if (filters.status) {
        query = filters.workerId 
          ? sql`SELECT * FROM tasks WHERE worker_id = ${filters.workerId} AND status = ${filters.status}`
          : sql`SELECT * FROM tasks WHERE status = ${filters.status}`;
      }
      const result = await query;
      return (result || []).sort((a, b) => b.id - a.id);
    } catch (error) {
      console.error("getTasks error:", error);
      return [];
    }
  },
  async createTask(task) {
    try {
      const result = await sql`INSERT INTO tasks (room_code, title, notes, status, worker_id, created_at, assigned_at, completed_at, proof_image_url, proof_image_hash, issue_id) VALUES (${task.room_code}, ${task.title}, ${task.notes}, ${task.status}, ${task.worker_id}, ${task.created_at}, ${task.assigned_at}, ${task.completed_at}, ${task.proof_image_url}, ${task.proof_image_hash}, ${task.issue_id}) RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("createTask error:", error);
      return null;
    }
  },
  async updateTask(id, updates) {
    try {
      const fields = [];
      const values = [];
      Object.entries(updates).forEach(([key, value]) => {
        fields.push(`${key} = $${values.length + 1}`);
        values.push(value);
      });
      const result = await sql`UPDATE tasks SET worker_id = ${updates.worker_id || null}, status = ${updates.status || null}, assigned_at = ${updates.assigned_at || null}, completed_at = ${updates.completed_at || null}, proof_image_url = ${updates.proof_image_url || null}, proof_image_hash = ${updates.proof_image_hash || null} WHERE id = ${id} RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("updateTask error:", error);
      return null;
    }
  },
  async getIssues() {
    try {
      const result = await sql`SELECT * FROM issues ORDER BY id DESC`;
      return result || [];
    } catch (error) {
      console.error("getIssues error:", error);
      return [];
    }
  },
  async getIssueByTicket(ticketNo) {
    try {
      const result = await sql`SELECT * FROM issues WHERE ticket_no = ${ticketNo}`;
      return result[0];
    } catch (error) {
      console.error("getIssueByTicket error:", error);
      return null;
    }
  },
  async createIssue(issue) {
    try {
      const result = await sql`INSERT INTO issues (ticket_no, ticket_seq, location, description, image_url, status, created_at, resolved_at) VALUES (${issue.ticket_no}, ${issue.ticket_seq}, ${issue.location}, ${issue.description}, ${issue.image_url}, ${issue.status}, ${issue.created_at}, ${issue.resolved_at}) RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("createIssue error:", error);
      return null;
    }
  },
  async updateIssue(id, updates) {
    try {
      const result = await sql`UPDATE issues SET status = ${updates.status}, resolved_at = ${updates.resolved_at} WHERE id = ${id} RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("updateIssue error:", error);
      return null;
    }
  },
  async getReviews() {
    try {
      const result = await sql`SELECT * FROM reviews ORDER BY id DESC`;
      return result || [];
    } catch (error) {
      console.error("getReviews error:", error);
      return [];
    }
  },
  async createReview(review) {
    try {
      const result = await sql`INSERT INTO reviews (guest_name, room_code, rating, comment, created_at) VALUES (${review.guest_name}, ${review.room_code}, ${review.rating}, ${review.comment}, ${review.created_at}) RETURNING *`;
      return result[0];
    } catch (error) {
      console.error("createReview error:", error);
      return null;
    }
  },
};

module.exports = { USE_POSTGRES, sql, pgOps, loadJsonDb, saveJsonDb };
