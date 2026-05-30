import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getNameInfo } from "../lib/api.ts";
import { useWallet } from "../lib/WalletContext.tsx";

export function Profile() {
  const { name } = useParams<{ name: string }>();
  const { walletAddress } = useWallet();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!name) return;
    getNameInfo(name)
      .then(setInfo)
      .catch((e) => console.error("Failed to fetch name info:", e.message))
      .finally(() => setLoading(false));
  }, [name]);

  function copyAddress() {
    if (info?.owner) {
      navigator.clipboard.writeText(info.owner);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#4A5568" }}>
        Loading...
      </div>
    );

  // Name is available — only show register if it's NOT the current user
  if (!info || info.available)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 32px",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        <p style={{ fontSize: 40, marginBottom: 16 }}>◈</p>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 32,
            fontWeight: 800,
            color: "white",
            marginBottom: 8,
          }}
        >
          {name}
          <span style={{ color: "#0EA5E9" }}>.arc</span>
        </h1>
        <p style={{ color: "#0EA5E9", fontSize: 15, marginBottom: 24 }}>
          This name is available
        </p>
        <Link to={`/register?name=${name}`} style={{ textDecoration: "none" }}>
          <button className="btn-primary">Register {name}.arc →</button>
        </Link>
      </div>
    );

  const nowSecs = Math.floor(Date.now() / 1000);
  const isExpired = nowSecs > Number(info.expiry);
  const daysLeft = Math.max(
    0,
    Math.floor((Number(info.expiry) - nowSecs) / 86400),
  );
  const expiryDate =
    Number(info.expiry) > 0 ?
      new Date(Number(info.expiry) * 1000).toLocaleDateString()
    : "—";
  const registeredDate =
    info.createdAt ? new Date(info.createdAt).toLocaleDateString() : "—";
  const isOwner = walletAddress?.toLowerCase() === info.owner?.toLowerCase();

  return (
    <div style={{ minHeight: "100vh", background: "#000000" }}>
      {/* Hero */}
      <div
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.06) 0%, transparent 60%)",
          borderBottom: "1px solid #1A1A2E",
          padding: "60px 24px 40px",
          textAlign: "center",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "rgba(14,165,233,0.1)",
            border: "1px solid rgba(14,165,233,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            margin: "0 auto 20px",
            color: "#0EA5E9",
            fontWeight: 800,
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {name?.slice(0, 1).toUpperCase()}
        </div>

        {/* Name */}
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(24px, 4vw, 44px)",
            fontWeight: 800,
            color: "white",
            marginBottom: 10,
            letterSpacing: "-1px",
          }}
        >
          {name}
          <span style={{ color: "#0EA5E9" }}>.arc</span>
        </h1>

        {/* Owner badge — yours or theirs */}
        {isOwner && (
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 12px",
              borderRadius: 999,
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.2)",
              color: "#0EA5E9",
              marginBottom: 10,
            }}
          >
            Your name
          </span>
        )}

        {/* Status */}
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 14px",
              borderRadius: 999,
              background:
                isExpired ? "rgba(245,158,11,0.1)" : "rgba(14,165,233,0.1)",
              color: isExpired ? "#F59E0B" : "#0EA5E9",
              border: `1px solid ${
                isExpired ? "rgba(245,158,11,0.2)" : "rgba(14,165,233,0.2)"
              }`,
            }}
          >
            {isExpired ? "Expired" : `Active · ${daysLeft} days left`}
          </span>
        </div>

        {/* Owner address — compact, copyable */}
        <div
          onClick={copyAddress}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 10,
            background: "#0A0A0A",
            border: "1px solid #1A1A2E",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              color: "#94A3B8",
            }}
          >
            {info.owner.slice(0, 6)}...{info.owner.slice(-4)}
          </span>
          <span style={{ fontSize: 12, color: copied ? "#0EA5E9" : "#4A5568" }}>
            {copied ? "✓" : "⎘"}
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
        {/* Info rows */}
        <div
          style={{
            background: "#0A0A0A",
            border: "1px solid #1A1A2E",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {[
            { label: "Name", value: `${name}.arc` },
            { label: "Status", value: isExpired ? "Expired" : "Active" },
            {
              label: "Days Remaining",
              value: isExpired ? "0" : `${daysLeft} days`,
            },
            { label: "Expiry Date", value: expiryDate },
            { label: "Registered", value: registeredDate },
            { label: "Token ID", value: `#${info.tokenId}`, mono: true },
            { label: "Price Paid", value: "5.00 USDC / year" },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: i < arr.length - 1 ? "1px solid #1A1A2E" : "none",
              }}
            >
              <span style={{ fontSize: 13, color: "#64748B" }}>
                {row.label}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "white",
                  fontFamily:
                    (row as any).mono ?
                      "'JetBrains Mono', monospace"
                    : "inherit",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Full owner address */}
        <div
          style={{
            background: "#0A0A0A",
            border: "1px solid #1A1A2E",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "#334155",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            OWNER ADDRESS
          </p>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "#94A3B8",
              wordBreak: "break-all",
              lineHeight: 1.6,
            }}
          >
            {info.owner}
          </p>
        </div>

        {/* Renew button if owner and not expired */}
        {isOwner && !isExpired && (
          <Link
            to={`/register?name=${name}&renew=true`}
            style={{
              textDecoration: "none",
              display: "block",
              marginBottom: 12,
            }}
          >
            <button
              className="btn-ghost"
              style={{ width: "100%", fontSize: 14 }}
            >
              Renew {name}.arc
            </button>
          </Link>
        )}

        {/* ArcScan */}
        <a
          href={`https://testnet.arcscan.app/address/${info.owner}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            color: "#334155",
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          View on ArcScan →
        </a>
      </div>
    </div>
  );
}
