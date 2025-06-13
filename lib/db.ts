// @ts-ignore
import Database from "better-sqlite3"
import path from "path"

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "database.sqlite")
const db = new Database(dbPath)

// Habilitar foreign keys
db.pragma("foreign_keys = ON")

export default db
