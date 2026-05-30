import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH   = join(__dirname, "../db.json")

interface NameRecord {
  name:      string
  owner:     string
  expiry:    number
  tokenId:   number
  txHash:    string
  createdAt: string
}

interface DB {
  names: Record<string, NameRecord>
}

function load(): DB {
  if (!existsSync(DB_PATH)) return { names: {} }
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf8")) as DB
  } catch {
    return { names: {} }
  }
}

function save(data: DB): void {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error("Failed to save db:", err)
  }
}

export const db = {
  getAll(): NameRecord[] {
    return Object.values(load().names)
  },

  getByName(name: string): NameRecord | undefined {
    return load().names[name]
  },

  getByOwner(owner: string): NameRecord[] {
    return Object.values(load().names).filter(
      n => n.owner.toLowerCase() === owner.toLowerCase()
    )
  },

  save(record: NameRecord): void {
    const data = load()
    data.names[record.name] = record
    save(data)
  },

  updateOwner(name: string, newOwner: string): void {
    const data = load()
    if (data.names[name]) {
      data.names[name].owner = newOwner
      save(data)
    }
  },
}