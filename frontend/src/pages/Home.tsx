import { useEffect, useState } from "react";
import { SearchBar } from "../components/SearchBar.tsx";
import { NameCard } from "../components/NameCard.tsx";
import { getAllNames, getStats } from "../lib/api.ts";

export function Home() {
  const [names, setNames] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load names and stats independently
    getAllNames()
      .then((nameData) => {
        console.log("nameData:", nameData);
        const namesList =
          Array.isArray(nameData) ? nameData
          : Array.isArray(nameData.names) ? nameData.names
          : [];
        setNames(namesList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    getStats()
      .then(setStats)
      .catch(() => {
        // Stats failed — set fallback
        setStats({ totalRegistered: 0, activeNames: 0, yearlyFee: "5.00" });
      });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000000" }}>
      {/* Hero */}
      <div
        style={{
          padding: "80px 32px",
          textAlign: "center",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.08) 0%, transparent 60%)",
          borderBottom: "1px solid #1A1A2E",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(14,165,233,0.08)",
            border: "1px solid rgba(14,165,233,0.15)",
            marginBottom: 28,
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
          <span style={{ fontSize: 12, color: "#0EA5E9", fontWeight: 600 }}>
            Decentralized Names on Arc Testnet
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.05,
            marginBottom: 20,
            letterSpacing: "-2px",
          }}
        >
          Your name.
          <br />
          <span style={{ color: "#0EA5E9" }}>On-chain.</span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "#64748B",
            maxWidth: 460,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Register your <strong style={{ color: "#94A3B8" }}>.arc</strong> name,
          link it to your wallet, and let anyone send you USDC using just your
          name instead of a hex address.
        </p>

        {/* Search */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SearchBar />
        </div>

        {/* Stats */}
        {stats && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 48,
              marginTop: 56,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Names Registered", value: stats.totalRegistered ?? 0 },
              { label: "Active Names", value: stats.activeNames ?? 0 },
              { label: "Yearly Fee", value: `$${stats.yearlyFee}` },
            ].map((s) => (
              <div key={s.label}>
                <p
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 32,
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {s.value}
                </p>
                <p style={{ fontSize: 13, color: "#4A5568" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Names grid */}
      {/* Names grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "white",
            }}
          >
            Recently Registered
          </h2>
          <span style={{ fontSize: 13, color: "#4A5568" }}>
            {names.length} names
          </span>
        </div>

        {loading ?
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#4A5568" }}
          >
            Loading names...
          </div>
        : names.length === 0 ?
          <div
            style={{
              textAlign: "center",
              padding: "80px 32px",
              border: "1px dashed #1A1A2E",
              borderRadius: 20,
            }}
          >
            <p style={{ fontSize: 40, marginBottom: 16 }}>◈</p>
            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                color: "white",
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 8,
              }}
            >
              No names registered yet
            </p>
            <p style={{ color: "#4A5568", marginBottom: 24 }}>
              Be the first to claim your .arc name
            </p>
          </div>
        : <div
            style={{
              background: "#0A0A0A",
              border: "1px solid #1A1A2E",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr",
                padding: "12px 20px",
                borderBottom: "1px solid #1A1A2E",
                background: "#000000",
              }}
            >
              {["Name", "Owner", "Registered", "Tx"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 11,
                    color: "#334155",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {[...names]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((n, i) => (
                <div
                  key={n.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr 1fr",
                    padding: "14px 20px",
                    borderBottom:
                      i < names.length - 1 ? "1px solid #1A1A2E" : "none",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#0D0D0D")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Name */}
                  <a
                    href={`/name/${n.name}`}
                    style={{ textDecoration: "none" }}
                  >
                    <span
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {n.name}
                      <span style={{ color: "#0EA5E9" }}>.arc</span>
                    </span>
                  </a>

                  {/* Owner */}
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: "#64748B",
                    }}
                  >
                    {n.owner?.slice(0, 6)}...{n.owner?.slice(-4)}
                  </span>

                  {/* Timestamp */}
                  <span style={{ fontSize: 12, color: "#4A5568" }}>
                    {n.createdAt ?
                      new Date(n.createdAt).toLocaleDateString()
                    : "—"}
                  </span>

                  {/* Tx link */}
                  <div>
                    {n.txHash ?
                      <a
                        href={`https://testnet.arcscan.app/tx/${n.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          color: "#0EA5E9",
                          textDecoration: "none",
                        }}
                      >
                        {n.txHash.slice(0, 6)}...↗
                      </a>
                    : <span style={{ fontSize: 11, color: "#334155" }}>—</span>}
                  </div>
                </div>
              ))}
          </div>
        }
      </div>
    </div>
  );
}
