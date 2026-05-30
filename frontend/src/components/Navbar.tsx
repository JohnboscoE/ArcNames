import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../lib/WalletContext.tsx";

export function Navbar() {
  const location = useLocation();
  const { walletAddress, connect, disconnect } = useWallet();

  const links = [
    { path: "/", label: "Explore" },
    { path: "/register", label: "Register" },
    { path: "/send", label: "Send" },
    { path: "/my-names", label: "My Names" },
  ];

  return (
    <nav
      style={{
        borderBottom: "1px solid #1A1A2E",
        padding: "0 32px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#0EA5E9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "white",
            }}
          >
            ◈
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: "white",
              letterSpacing: "-0.5px",
            }}
          >
            ArcNames
          </span>
        </div>
      </Link>

      {/* Links + wallet */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={{ textDecoration: "none" }}
          >
            <span
              style={{
                color: location.pathname === link.path ? "white" : "#64748B",
                fontSize: 14,
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: 8,
                background:
                  location.pathname === link.path ?
                    "rgba(14,165,233,0.1)"
                  : "transparent",
                display: "block",
                transition: "all 0.2s",
              }}
            >
              {link.label}
            </span>
          </Link>
        ))}

        {/* Wallet button */}
        {walletAddress ?
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 8,
            }}
          >
            {/* Connected badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px",
                borderRadius: 10,
                background: "rgba(14,165,233,0.08)",
                border: "1px solid rgba(14,165,233,0.15)",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#0EA5E9",
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#0EA5E9",
                }}
              >
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>

            {/* Disconnect button */}
            <button
              onClick={disconnect}
              style={{
                background: "transparent",
                border: "1px solid #1A1A2E",
                borderRadius: 8,
                padding: "7px 10px",
                color: "#4A5568",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#EF4444";
                e.currentTarget.style.color = "#EF4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1A1A2E";
                e.currentTarget.style.color = "#4A5568";
              }}
              title="Disconnect wallet"
            >
              ✕
            </button>
          </div>
        : <button
            onClick={connect}
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: 13, marginLeft: 8 }}
          >
            Connect Wallet
          </button>
        }
      </div>
    </nav>
  );
}
