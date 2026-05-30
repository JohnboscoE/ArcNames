import express from "express"
import cors    from "cors"
import "dotenv/config"


const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({
  origin:  "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}))
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok", chain: "ARC-TESTNET", app: "ArcNames" })
})

async function start() {
  try {
    const { namesRouter }          = await import("./routes/names.js")
    const { watchRegistrations, syncPastRegistrations } = await import("./services/arc.js")

    app.use("/api/names", namesRouter)

    // First sync all past events from chain
    await syncPastRegistrations()

    // Then watch for new ones
    watchRegistrations()

    console.log("✅ Routes loaded and event watcher started")
  } catch (err) {
    console.error("❌ Startup error:", err)
  }
}

start()

app.listen(PORT, () => {
  console.log(`🚀 ArcNames backend running on http://localhost:${PORT}`)
})