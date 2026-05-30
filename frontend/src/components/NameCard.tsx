import { Link } from "react-router-dom";

interface Props {
  name: string;
  owner: string;
  expiry: number;
  tokenId: number;
}

export function NameCard({ name, owner, expiry, tokenId }: Props) {
  const nowSecs = Math.floor(Date.now() / 1000);
  const isExpired = nowSecs > Number(expiry);
  const daysLeft = Math.max(0, Math.floor((Number(expiry) - nowSecs) / 86400));

  return (
    <Link to={`/name/${name}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#0A0A0A",
          border: "1px solid #1A1A2E",
          borderRadius: 14,
          padding: "16px 18px",
          cursor: "pointer",
          transition: "border-color 0.2s",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0EA5E9")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1A1A2E")}
      >
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "#0EA5E9",
              fontWeight: 800,
              fontFamily: "'Syne', sans-serif",
              flexShrink: 0,
            }}
          >
            {name.slice(0, 1).toUpperCase()}
          </div>

          {/* Name + owner */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "white",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {name}
              <span style={{ color: "#0EA5E9", fontSize: 13 }}>.arc</span>
            </p>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#4A5568",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {owner.slice(0, 6)}...{owner.slice(-4)}
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 999,
              background:
                isExpired ? "rgba(245,158,11,0.1)" : "rgba(14,165,233,0.1)",
              color: isExpired ? "#F59E0B" : "#0EA5E9",
              border: `1px solid ${
                isExpired ? "rgba(245,158,11,0.2)" : "rgba(14,165,233,0.2)"
              }`,
            }}
          >
            {isExpired ? "Expired" : `${daysLeft}d left`}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "#334155",
            }}
          >
            #{tokenId}
          </span>
        </div>
      </div>
    </Link>
  );
}
