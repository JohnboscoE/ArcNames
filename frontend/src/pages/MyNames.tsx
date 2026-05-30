import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOwnerNames } from "../lib/api.ts";
import { NameCard } from "../components/NameCard.tsx";
import { useWallet } from "../lib/WalletContext.tsx";

export function MyNames() {
  const { walletAddress, connect } = useWallet();
  const [names, setNames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    getOwnerNames(walletAddress)
      .then((res) => setNames(Array.isArray(res.names) ? res.names : []))
      .catch(() => setNames([]))
      .finally(() => {
        setLoading(false);
        setLoaded(true);
      });
  }, [walletAddress]);

  return (
    <div style={{ minHeight: "100vh", background: "#000000" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 32px" }}>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 32,
            fontWeight: 800,
            color: "white",
            marginBottom: 8,
          }}
        >
          My Names
        </h1>
        <p style={{ color: "#64748B", fontSize: 15, marginBottom: 40 }}>
          All .arc names registered to your wallet
        </p>

        {!walletAddress ?
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
              Connect your wallet
            </p>
            <p style={{ color: "#64748B", marginBottom: 24 }}>
              See all the .arc names you own
            </p>
            <button onClick={connect} className="btn-primary">
              Connect MetaMask
            </button>
          </div>
        : loading ?
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#4A5568" }}
          >
            Loading your names...
          </div>
        : loaded && names.length === 0 ?
          <div
            style={{
              textAlign: "center",
              padding: "60px 32px",
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
              No names found
            </p>
            <p style={{ color: "#64748B", marginBottom: 24 }}>
              This wallet hasn't registered any .arc names yet
            </p>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button className="btn-primary">
                Register Your First Name →
              </button>
            </Link>
          </div>
        : names.length > 0 ?
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <p style={{ color: "#64748B", fontSize: 14 }}>
                {names.length} name{names.length !== 1 ? "s" : ""} found
              </p>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="btn-ghost" style={{ fontSize: 13 }}>
                  + Register another
                </button>
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {names.map((n) => (
                <NameCard
                  key={n.name}
                  name={n.name}
                  owner={n.owner}
                  expiry={n.expiry}
                  tokenId={n.tokenId}
                />
              ))}
            </div>
          </>
        : null}
      </div>
    </div>
  );
}
