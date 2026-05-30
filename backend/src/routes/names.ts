import { Router }                 from "express"
import type { Request, Response } from "express"
import {
  checkAvailability,
  getNameInfo,
  resolveName,
  reverseLookup,
  getTotalNames,
  publicClient,
  walletClient,
  CONTRACT_ADDRESS,
  ARC_NAMES_ABI,
  arcTestnet,
} from "../services/arc.js"
import { db } from "../db.js"
import { parseUnits, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { defineChain } from "viem"

export const namesRouter = Router()

// GET /api/names/check/:name
// Check if a name is available
namesRouter.get("/check/:name", async (req: Request, res: Response) => {
  try {
    const { name } = req.params
    const available = await checkAvailability(name)
    res.json({ name, available })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/names/resolve/:name
// Resolve name → wallet address
namesRouter.get("/resolve/:name", async (req: Request, res: Response) => {
  try {
    const address = await resolveName(req.params.name)
    res.json({ name: req.params.name, address })
  } catch (err: any) {
    res.status(404).json({ error: "Name not found or expired" })
  }
})

// GET /api/names/reverse/:address
// Reverse lookup wallet → primary name
namesRouter.get("/reverse/:address", async (req: Request, res: Response) => {
  try {
    const name = await reverseLookup(req.params.address)
    res.json({ address: req.params.address, name })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/names/info/:name
// Get full name info
namesRouter.get("/info/:name", async (req: Request, res: Response) => {
  try {
    const info = await getNameInfo(req.params.name) as any
    res.json({
      name:      req.params.name,
      owner:     info[0],
      expiry:    Number(info[1]),
      tokenId:   Number(info[2]),
      available: info[3],
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/names/owner/:address
// Get all names owned by an address
namesRouter.get("/owner/:address", async (req: Request, res: Response) => {
  try {
    const names = db.getByOwner(req.params.address)
    res.json({ address: req.params.address, names })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/names/all
// Get all registered names
namesRouter.get("/all", async (_req: Request, res: Response) => {
  try {
    const names = db.getAll()
    const total = await getTotalNames()
    res.json({ total: Number(total), names })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/names/stats
// Get platform stats
// GET /api/names/debug/sync
namesRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const names  = db.getAll()
    const now    = Math.floor(Date.now() / 1000)
    const active = names.filter(n => n.expiry > now).length
    res.json({
      totalRegistered: names.length,
      activeNames:     active,
      yearlyFee:       "5.00",
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})