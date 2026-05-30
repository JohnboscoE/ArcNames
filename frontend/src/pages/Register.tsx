import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkName } from "../lib/api.ts";
import { arcTestnet } from "../lib/arc.ts";
import { createWalletClient, custom, parseUnits } from "viem";
import { useWallet } from "../lib/WalletContext.tsx";
import { getOwnerNames } from "../lib/api.ts";

// ABI for the register function
const REGISTER_ABI = [
  {
    name: "register",
    type: "function",
    inputs: [
      { name: "name", type: "string" },
      { name: "numYears", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { walletAddress, connect: connectWallet } = useWallet();
  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [numYears, setNumYears] = useState(1);
  const [available, setAvail] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalCost = (5 * numYears).toFixed(2);

  // Check availability when name changes
  useEffect(() => {
    if (name.length < 3) {
      setAvail(null);
      return;
    }
    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await checkName(name);
        setAvail(res.available);
      } catch {
        setAvail(null);
      } finally {
        setChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [name]);

  async function handleRegister() {
    if (!walletAddress) {
      await connectWallet();
      return;
    }
    if (!available) {
      setError("Name is not available");
      return;
    }
    if (name.length < 3) {
      setError("Name too short");
      return;
    }

    // Check if wallet already owns a name
    try {
      const res = await getOwnerNames(walletAddress);
      if (res.names && res.names.length > 0) {
        const owned = res.names.map((n: any) => n.name).join(", ");
        setError(
          `You already own: ${owned}.arc — each wallet can only hold one name`,
        );
        return;
      }
    } catch {
      // proceed if check fails
    }

    setLoading(true);
    setError(null);

    try {
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });

      const [from] = await walletClient.requestAddresses();
      const CONTRACT = import.meta.env.VITE_ARC_NAMES_ADDRESS as `0x${string}`;
      const USDC = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;
      const amountInUnits = parseUnits(totalCost, 6);

      // Step 1: Approve USDC
      await walletClient.writeContract({
        address: USDC,
        abi: APPROVE_ABI,
        functionName: "approve",
        args: [CONTRACT, amountInUnits],
        account: from,
      });

      // Step 2: Register name
      const hash = await walletClient.writeContract({
        address: CONTRACT,
        abi: REGISTER_ABI,
        functionName: "register",
        args: [name, BigInt(numYears)],
        account: from,
      });

      setTxHash(hash);
      setAvail(false);

      // Wait 3s then go to name profile
      setTimeout(() => navigate(`/name/${name}`), 3000);
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 500 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#0EA5E9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              color: "white",
              margin: "0 auto 16px",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
            }}
          >
            ◈
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              marginBottom: 8,
            }}
          >
            Register Your Name
          </h1>
          <p style={{ color: "#64748B", fontSize: 15 }}>
            Claim your <strong style={{ color: "#94A3B8" }}>.arc</strong>{" "}
            identity for 5 USDC/year
          </p>
        </div>

        <div
          style={{
            background: "#0A0A0A",
            border: "1px solid #1A1A2E",
            borderRadius: 20,
            padding: 28,
          }}
        >
          {/* Wallet */}
          {!walletAddress ?
            <button
              onClick={connectWallet}
              className="btn-primary"
              style={{ width: "100%", marginBottom: 20 }}
            >
              Connect Wallet to Register
            </button>
          : <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(14,165,233,0.08)",
                border: "1px solid rgba(14,165,233,0.15)",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#0EA5E9",
                }}
              />
              <span style={{ fontSize: 12, color: "#0EA5E9" }}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          }

          {/* Name input */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#64748B",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              NAME
            </label>
            <div style={{ position: "relative" }}>
              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                placeholder="yourname"
                className="input-field"
                style={{
                  paddingRight: 60,
                  border:
                    available === true ? "1px solid #0EA5E9"
                    : available === false ? "1px solid #EF4444"
                    : "1px solid #1A1A2E",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  color: "#0EA5E9",
                  fontWeight: 700,
                }}
              >
                .arc
              </span>
            </div>

            {/* Availability */}
            {name.length >= 3 && (
              <p
                style={{
                  fontSize: 12,
                  marginTop: 6,
                  color:
                    checking ? "#64748B"
                    : available ? "#0EA5E9"
                    : "#EF4444",
                }}
              >
                {checking ?
                  "Checking availability..."
                : available ?
                  `✓ ${name}.arc is available`
                : `✗ ${name}.arc is already taken`}
              </p>
            )}
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#64748B",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              REGISTRATION PERIOD
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => setNumYears(y)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: `1px solid ${numYears === y ? "#0EA5E9" : "#1A1A2E"}`,
                    background:
                      numYears === y ? "rgba(14,165,233,0.1)" : "#000000",
                    color: numYears === y ? "#0EA5E9" : "#64748B",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div
            style={{
              background: "#000000",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              border: "1px solid #1A1A2E",
            }}
          >
            {[
              { label: "Name", value: name ? `${name}.arc` : "—" },
              {
                label: "Duration",
                value: `${numYears} year${numYears > 1 ? "s" : ""}`,
              },
              { label: "Price per year", value: "5.00 USDC" },
              { label: "Total", value: `${totalCost} USDC` },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #1A1A2E",
                }}
              >
                <span style={{ fontSize: 13, color: "#64748B" }}>
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: row.label === "Total" ? "#0EA5E9" : "white",
                    fontWeight: row.label === "Total" ? 700 : 400,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <p style={{ color: "#EF4444", fontSize: 13 }}>❌ {error}</p>
            </div>
          )}

          {txHash ?
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "rgba(14,165,233,0.08)",
                border: "1px solid rgba(14,165,233,0.2)",
              }}
            >
              <p
                style={{
                  color: "#0EA5E9",
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                ✅ {name}.arc registered!
              </p>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>
                Redirecting to your name profile...
              </p>
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0EA5E9", fontSize: 13 }}
              >
                View on ArcScan →
              </a>
            </div>
          : <button
              onClick={handleRegister}
              disabled={loading || !available || name.length < 3}
              className="btn-primary"
              style={{ width: "100%", fontSize: 15 }}
            >
              {loading ?
                "Registering..."
              : `Register ${name || "name"}.arc for ${totalCost} USDC`}
            </button>
          }
        </div>
      </div>
    </div>
  );
}
