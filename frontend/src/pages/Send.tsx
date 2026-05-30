import { useState } from "react";
import { createWalletClient, custom, parseUnits, parseAbi } from "viem";
import { arcTestnet, arcClient } from "../lib/arc.ts";
import { resolveName } from "../lib/api.ts";
import { useWallet } from "../lib/WalletContext.tsx";

const TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
    icon: "💵",
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
    icon: "💶",
  },
];

const ERC20_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
]);

export function Send() {
  const { walletAddress, connect } = useWallet();

  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [recipient, setRecipient] = useState("");
  const [resolvedAddr, setResolvedAddr] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load balance when token changes or wallet connects
  async function loadBalance(token: (typeof TOKENS)[0]) {
    if (!walletAddress) return;
    try {
      const bal = await arcClient.readContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      });
      setBalance((Number(bal) / 10 ** token.decimals).toFixed(4));
    } catch {
      setBalance("0.00");
    }
  }

  async function handleTokenChange(token: (typeof TOKENS)[0]) {
    setSelectedToken(token);
    await loadBalance(token);
  }

  // Resolve recipient — handles both .arc names and 0x addresses
  async function handleRecipientChange(value: string) {
    setRecipient(value);
    setResolvedAddr(null);
    setResolveError(null);

    // If it's an .arc name — resolve it
    if (value.endsWith(".arc") && value.length > 4) {
      const name = value.replace(".arc", "").toLowerCase();
      setResolving(true);
      try {
        const result = await resolveName(name);
        if (result.address) {
          setResolvedAddr(result.address);
          setResolveError(null);
        }
      } catch {
        setResolveError(`Could not resolve ${value}`);
        setResolvedAddr(null);
      } finally {
        setResolving(false);
      }
      return;
    }

    // If it's a raw 0x address
    if (value.startsWith("0x") && value.length === 42) {
      setResolvedAddr(value);
    }
  }

  async function handleSend() {
    if (!walletAddress) {
      await connect();
      return;
    }

    const target = resolvedAddr;
    if (!target) {
      setError("Enter a valid .arc name or 0x address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter an amount");
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });

      const hash = await walletClient.writeContract({
        address: selectedToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [
          target as `0x${string}`,
          parseUnits(amount, selectedToken.decimals),
        ],
        account: walletAddress as `0x${string}`,
      });

      setTxHash(hash);
      setAmount("");
      await loadBalance(selectedToken);
    } catch (err: any) {
      setError(err.message ?? "Transaction failed");
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
      <div style={{ width: "100%", maxWidth: 460 }}>
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
              margin: "0 auto 16px",
            }}
          >
            ↗
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
            Send Tokens
          </h1>
          <p style={{ color: "#64748B", fontSize: 15 }}>
            Send to any <strong style={{ color: "#0EA5E9" }}>.arc name</strong>{" "}
            or wallet address
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
              onClick={connect}
              className="btn-primary"
              style={{ width: "100%", marginBottom: 20 }}
            >
              Connect Wallet
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
              {balance && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "#64748B",
                  }}
                >
                  {balance} {selectedToken.symbol}
                </span>
              )}
            </div>
          }

          {/* Token selector */}
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
              TOKEN
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {TOKENS.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => handleTokenChange(token)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: `1px solid ${
                      selectedToken.symbol === token.symbol ?
                        "#0EA5E9"
                      : "#1A1A2E"
                    }`,
                    background:
                      selectedToken.symbol === token.symbol ?
                        "rgba(14,165,233,0.08)"
                      : "#000000",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{token.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <p
                      style={{
                        color:
                          selectedToken.symbol === token.symbol ?
                            "white"
                          : "#64748B",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {token.symbol}
                    </p>
                    <p style={{ color: "#4A5568", fontSize: 10 }}>
                      {token.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#64748B",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              RECIPIENT
            </label>
            <input
              value={recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
              placeholder="james.arc or 0x..."
              className="input-field"
              style={{
                border:
                  resolvedAddr ? "1px solid #0EA5E9"
                  : resolveError ? "1px solid #EF4444"
                  : "1px solid #1A1A2E",
              }}
            />

            {/* Resolution feedback */}
            {resolving && (
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
                Resolving {recipient}...
              </p>
            )}
            {resolvedAddr && recipient.endsWith(".arc") && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 6,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#0EA5E9",
                  }}
                />
                <span style={{ fontSize: 12, color: "#0EA5E9" }}>
                  Resolved →{" "}
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {resolvedAddr.slice(0, 8)}...{resolvedAddr.slice(-6)}
                  </span>
                </span>
              </div>
            )}
            {resolveError && (
              <p style={{ fontSize: 12, color: "#EF4444", marginTop: 6 }}>
                ❌ {resolveError}
              </p>
            )}
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#64748B",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              AMOUNT
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field"
                style={{ paddingRight: 90 }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {balance && (
                  <span
                    onClick={() => setAmount(balance)}
                    style={{
                      fontSize: 10,
                      color: "#0EA5E9",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    MAX
                  </span>
                )}
                <span
                  style={{
                    fontSize: 12,
                    color: "#0EA5E9",
                    fontWeight: 600,
                  }}
                >
                  {selectedToken.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          {amount && resolvedAddr && (
            <div
              style={{
                background: "#000000",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                border: "1px solid #1A1A2E",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13, color: "#64748B" }}>Sending</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {amount} {selectedToken.symbol}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>To</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: "#0EA5E9",
                  }}
                >
                  {recipient.endsWith(".arc") ?
                    recipient
                  : `${resolvedAddr.slice(0, 8)}...${resolvedAddr.slice(-6)}`}
                </span>
              </div>
            </div>
          )}

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
                  marginBottom: 6,
                }}
              >
                ✅ Sent successfully!
              </p>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>
                {amount} {selectedToken.symbol} sent to{" "}
                <strong style={{ color: "white" }}>
                  {recipient.endsWith(".arc") ?
                    recipient
                  : `${resolvedAddr?.slice(0, 6)}...`}
                </strong>
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
              onClick={handleSend}
              disabled={loading || !amount || !resolvedAddr}
              className="btn-primary"
              style={{ width: "100%", fontSize: 15 }}
            >
              {loading ? "Sending..." : `Send ${selectedToken.symbol} →`}
            </button>
          }
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#1E293B",
            fontSize: 12,
            marginTop: 16,
          }}
        >
          .arc names resolve to wallet addresses on Arc Testnet
        </p>
      </div>
    </div>
  );
}
