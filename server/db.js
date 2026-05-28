const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'registrations.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    national_code TEXT NOT NULL UNIQUE,
    previous_school TEXT,
    first_term_grade REAL NOT NULL,
    home_phone TEXT NOT NULL,
    father_mobile TEXT NOT NULL,
    mother_mobile TEXT NOT NULL,
    home_address TEXT NOT NULL,
    living_with TEXT NOT NULL,
    other_living_details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

function createRegistration(data) {
  const stmt = db.prepare(`
    INSERT INTO registrations (
      full_name, father_name, birth_date, national_code, previous_school,
      first_term_grade, home_phone, father_mobile, mother_mobile,
      home_address, living_with, other_living_details
    ) VALUES (
      @full_name, @father_name, @birth_date, @national_code, @previous_school,
      @first_term_grade, @home_phone, @father_mobile, @mother_mobile,
      @home_address, @living_with, @other_living_details
    )
  `);
  const result = stmt.run(data);
  return getRegistrationById(result.lastInsertRowid);
}

function getRegistrationById(id) {
  return db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);
}

function getAllRegistrations() {
  return db
    .prepare('SELECT * FROM registrations ORDER BY created_at DESC')
    .all();
}

function getRegistrationCount() {
  return db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
}

module.exports = {
  db,
  createRegistration,
  getRegistrationById,
  getAllRegistrations,
  getRegistrationCount,
};
