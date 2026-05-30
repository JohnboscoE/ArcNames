import "dotenv/config"
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseAbi,
  decodeEventLog,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { readFileSync }        from "fs"
import { join, dirname }       from "path"
import { fileURLToPath }       from "url"
import{db}from "../db.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load ABI
const artifact = JSON.parse(
  readFileSync(join(__dirname, "../abi/ArcNames.json"), "utf8")
)
export const ARC_NAMES_ABI = artifact.abi

// Arc Testnet chain
export const arcTestnet = defineChain({
  id:   5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: [process.env.ARC_RPC!] } },
})

// Public client for reading
export const publicClient = createPublicClient({
  chain:     arcTestnet,
  transport: http(process.env.ARC_RPC!),
})

// Wallet client for writing
const account = privateKeyToAccount(
  process.env.PLATFORM_PRIVATE_KEY as `0x${string}`
)

export const walletClient = createWalletClient({
  account,
  chain:     arcTestnet,
  transport: http(process.env.ARC_RPC!),
})

export const CONTRACT_ADDRESS =
  process.env.ARC_NAMES_ADDRESS as `0x${string}`

// ── Read functions ─────────────────────────────────────────────

export async function checkAvailability(name: string) {
  return publicClient.readContract({
    address:      CONTRACT_ADDRESS,
    abi:          ARC_NAMES_ABI,
    functionName: "isAvailable",
    args:         [name],
  })
}

export async function getNameInfo(name: string) {
  return publicClient.readContract({
    address:      CONTRACT_ADDRESS,
    abi:          ARC_NAMES_ABI,
    functionName: "nameInfo",
    args:         [name],
  })
}

export async function resolveName(name: string) {
  return publicClient.readContract({
    address:      CONTRACT_ADDRESS,
    abi:          ARC_NAMES_ABI,
    functionName: "resolve",
    args:         [name],
  })
}

export async function reverseLookup(address: string) {
  return publicClient.readContract({
    address:      CONTRACT_ADDRESS,
    abi:          ARC_NAMES_ABI,
    functionName: "reverseLookup",
    args:         [address as `0x${string}`],
  })
}

export async function getTotalNames() {
  return publicClient.readContract({
    address:      CONTRACT_ADDRESS,
    abi:          ARC_NAMES_ABI,
    functionName: "totalNames",
  })
}
// Fetch all past NameRegistered events and save to DB
export async function syncPastRegistrations() {
  console.log("🔄 Syncing past registrations from chain...")

  try {
    const latestBlock  = await publicClient.getBlockNumber()
    const deployBlock  = BigInt(process.env.ARC_NAMES_DEPLOY_BLOCK ?? "0")

    // Chunk into 9,999 block ranges to stay within Arc's limit
    const chunkSize    = BigInt(9999)
    let   fromBlock    = deployBlock
    let   totalFound   = 0

    while (fromBlock <= latestBlock) {
      const toBlock = fromBlock + chunkSize > latestBlock
        ? latestBlock
        : fromBlock + chunkSize

      console.log(`📋 Scanning blocks ${fromBlock} → ${toBlock}...`)

      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          name:   "NameRegistered",
          type:   "event",
          inputs: [
            { name: "name",    type: "string",  indexed: true  },
            { name: "owner",   type: "address", indexed: true  },
            { name: "expiry",  type: "uint256", indexed: false },
            { name: "tokenId", type: "uint256", indexed: false },
          ],
        },
        fromBlock,
        toBlock,
      })

      totalFound += logs.length

      for (const log of logs) {
        try {
          const { owner, expiry, tokenId } = log.args as any

          const tx         = await publicClient.getTransaction({
            hash: log.transactionHash as `0x${string}`,
          })

          const inputData  = tx.input
          const hex        = inputData.slice(10)
          const offset     = parseInt(hex.slice(0, 64), 16) * 2
          const length     = parseInt(hex.slice(offset, offset + 64), 16)
          const nameHex    = hex.slice(offset + 64, offset + 64 + length * 2)
          const actualName = Buffer.from(nameHex, "hex").toString("utf8")

          if (db.getByName(actualName)) {
            console.log(`⏭ Already saved: ${actualName}.arc`)
            continue
          }

          console.log(`💾 Syncing: ${actualName}.arc by ${owner}`)

          db.save({
            name:      actualName,
            owner:     owner as string,
            expiry:    Number(expiry),
            tokenId:   Number(tokenId),
            txHash:    log.transactionHash ?? "",
            createdAt: new Date().toISOString(),
          })
        } catch (err) {
          console.error("Error processing log:", err)
        }
      }

      fromBlock = toBlock + BigInt(1)
    }

    console.log(`✅ Sync complete — found ${totalFound} registration(s)`)
  } catch (err) {
    console.error("❌ Failed to sync:", err)
  }
}
export function watchRegistrations() {
  console.log("👀 Watching for NameRegistered events...")

  publicClient.watchEvent({
    address: CONTRACT_ADDRESS,
    event: {
      name:   "NameRegistered",
      type:   "event",
      inputs: [
        { name: "name",    type: "string",  indexed: true  },
        { name: "owner",   type: "address", indexed: true  },
        { name: "expiry",  type: "uint256", indexed: false },
        { name: "tokenId", type: "uint256", indexed: false },
      ],
    },
    onLogs: async (logs) => {
      for (const log of logs) {
        try {
          const { owner, expiry, tokenId } = log.args as any

          // Get the actual name from transaction input data
          const tx   = await publicClient.getTransaction({
            hash: log.transactionHash as `0x${string}`,
          })

          // Decode the register(string name, uint256 numYears) call
          const inputData = tx.input
          // Skip the 4-byte function selector
          // The first param (string) is ABI encoded:
          // offset (32 bytes) + length (32 bytes) + data
          const hex    = inputData.slice(10) // remove 0x + 4 byte selector
          const offset = parseInt(hex.slice(0, 64), 16) * 2
          const length = parseInt(hex.slice(offset, offset + 64), 16)
          const nameHex = hex.slice(offset + 64, offset + 64 + length * 2)
          const actualName = Buffer.from(nameHex, "hex").toString("utf8")

          console.log(`✅ New name registered: ${actualName}.arc by ${owner}`)

          db.save({
            name:      actualName,
            owner:     owner as string,
            expiry:    Number(expiry),
            tokenId:   Number(tokenId),
            txHash:    log.transactionHash ?? "",
            createdAt: new Date().toISOString(),
          })
        } catch (err) {
          console.error("Error saving name event:", err)
        }
      }
    },
  })
}