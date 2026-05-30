import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkName } from "../lib/api.ts";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Clean name — lowercase, remove spaces
  function cleanName(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9-]/g, "");
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = cleanName(e.target.value);
    setQuery(val);
    setAvailable(null);

    if (val.length >= 3) {
      setChecking(true);
      try {
        const result = await checkName(val);
        setAvailable(result.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }
  }

  function handleSearch() {
    if (query.length >= 3) {
      navigate(`/name/${query}`);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for a name..."
          className="input-field"
          style={{
            fontSize: 18,
            padding: "18px 140px 18px 20px",
            borderRadius: 14,
            border:
              available === true ? "1px solid #0EA5E9"
              : available === false ? "1px solid #EF4444"
              : "1px solid #1A1A2E",
          }}
        />

        {/* .arc suffix */}
        <span
          style={{
            position: "absolute",
            right: 120,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#0EA5E9",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'Syne', sans-serif",
          }}
        >
          .arc
        </span>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={query.length < 3}
          className="btn-primary"
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            padding: "8px 16px",
            fontSize: 13,
            borderRadius: 8,
          }}
        >
          Search
        </button>
      </div>

      {/* Availability indicator */}
      {query.length >= 3 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {checking ?
            <span style={{ fontSize: 13, color: "#64748B" }}>Checking...</span>
          : available === true ?
            <>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#0EA5E9",
                }}
              />
              <span style={{ fontSize: 13, color: "#0EA5E9", fontWeight: 600 }}>
                {query}.arc is available!
              </span>
              <button
                onClick={() => navigate(`/register?name=${query}`)}
                style={{
                  marginLeft: "auto",
                  background: "rgba(14,165,233,0.1)",
                  border: "1px solid rgba(14,165,233,0.2)",
                  borderRadius: 8,
                  padding: "4px 12px",
                  color: "#0EA5E9",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Register →
              </button>
            </>
          : available === false ?
            <>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#EF4444",
                }}
              />
              <span style={{ fontSize: 13, color: "#EF4444", fontWeight: 600 }}>
                {query}.arc is taken
              </span>
              <button
                onClick={() => navigate(`/name/${query}`)}
                style={{
                  marginLeft: "auto",
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  padding: "4px 12px",
                  color: "#EF4444",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                View profile →
              </button>
            </>
          : null}
        </div>
      )}

      {/* Validation hint */}
      {query.length > 0 && query.length < 3 && (
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>
          Minimum 3 characters
        </p>
      )}
    </div>
  );
}
