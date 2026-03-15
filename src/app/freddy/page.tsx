"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface OutreachEmail {
  id: string;
  oem_name: string;
  contact_name: string | null;
  email_to: string;
  email_subject: string;
  project_summary: {
    mvaSize: number;
    productDescription: string;
    location: string;
    deliveryDate: string;
    customerName: string;
  };
  status: string;
  created_at: string;
}

interface BatchData {
  batchId: string;
  total: number;
  pending: number;
  alreadySent: number;
  emails: OutreachEmail[];
  projectSummary: OutreachEmail["project_summary"] | null;
}

export default function FreddyApprovalPage() {
  return (
    <Suspense
      fallback={
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.logo}>⚡ Freddy</h1>
            <p style={styles.muted}>Loading...</p>
          </div>
        </div>
      }
    >
      <FreddyApprovalContent />
    </Suspense>
  );
}

function FreddyApprovalContent() {
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batch");

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [batch, setBatch] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Load batch data after auth
  useEffect(() => {
    if (!authed || !batchId) return;
    setLoading(true);
    fetch(`/api/freddy/approve?batchId=${batchId}`)
      .then((r) => r.json())
      .then((d) => setBatch(d))
      .catch(() => setActionResult("Failed to load batch"))
      .finally(() => setLoading(false));
  }, [authed, batchId]);

  const handleAction = async (action: "approve" | "reject") => {
    if (!batchId) return;
    const confirmMsg =
      action === "approve"
        ? `Send ${batch?.pending || 0} emails from Freddy?`
        : "Reject and discard this batch?";
    if (!confirm(confirmMsg)) return;

    setSending(true);
    try {
      const res = await fetch("/api/freddy/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, action, password }),
      });
      const data = await res.json();
      if (data.error) {
        setActionResult(`Error: ${data.error}`);
      } else if (action === "approve") {
        setActionResult(
          `Approved! ${data.summary.sent} sent, ${data.summary.failed} failed.`
        );
      } else {
        setActionResult("Batch rejected and discarded.");
      }
      // Refresh batch data
      const refresh = await fetch(`/api/freddy/approve?batchId=${batchId}`);
      setBatch(await refresh.json());
    } catch {
      setActionResult("Network error");
    } finally {
      setSending(false);
    }
  };

  // No batch ID
  if (!batchId) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>⚡ Freddy</h1>
          <p style={styles.muted}>
            No batch specified. Use a link from your notification.
          </p>
        </div>
      </div>
    );
  }

  // Password gate
  if (!authed) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>⚡ Freddy</h1>
          <p style={styles.subtitle}>Outreach Approval</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAuthed(true);
            }}
          >
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoFocus
            />
            <button type="submit" style={styles.btnPrimary}>
              View Batch
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>⚡ Freddy</h1>
          <p style={styles.muted}>Loading batch...</p>
        </div>
      </div>
    );
  }

  // Batch loaded
  const spec = batch?.projectSummary;
  const pendingEmails = batch?.emails.filter((e) => e.status === "pending") || [];
  const sentEmails = batch?.emails.filter((e) => e.status === "sent") || [];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>⚡ Freddy</h1>
        <p style={styles.subtitle}>Outreach Approval</p>

        {/* Project summary */}
        {spec && (
          <div style={styles.specBox}>
            <div style={styles.specTitle}>
              {spec.productDescription || `${spec.mvaSize} MVA Transformer`}
            </div>
            <div style={styles.specDetail}>
              📍 {spec.location} &nbsp;·&nbsp; 📅 {spec.deliveryDate || "Flexible"}
            </div>
            <div style={styles.specDetail}>
              🏢 {spec.customerName}
            </div>
          </div>
        )}

        {/* Status banner */}
        {actionResult && (
          <div
            style={{
              ...styles.banner,
              background: actionResult.includes("Error")
                ? "#fee2e2"
                : "#d1fae5",
              color: actionResult.includes("Error") ? "#991b1b" : "#065f46",
            }}
          >
            {actionResult}
          </div>
        )}

        {/* Pending emails */}
        {pendingEmails.length > 0 && (
          <>
            <div style={styles.sectionHeader}>
              Pending Approval ({pendingEmails.length})
            </div>
            <div style={styles.emailList}>
              {pendingEmails.map((e) => (
                <div key={e.id} style={styles.emailRow}>
                  <div style={styles.oemName}>{e.oem_name}</div>
                  <div style={styles.emailAddr}>
                    {e.contact_name ? `${e.contact_name} · ` : ""}
                    {e.email_to}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={styles.actions}>
              <button
                onClick={() => handleAction("approve")}
                disabled={sending}
                style={{
                  ...styles.btnPrimary,
                  opacity: sending ? 0.6 : 1,
                  background: "#22c55e",
                }}
              >
                {sending ? "Sending..." : `✓ Approve & Send (${pendingEmails.length})`}
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={sending}
                style={{
                  ...styles.btnSecondary,
                  opacity: sending ? 0.6 : 1,
                }}
              >
                ✕ Reject
              </button>
            </div>
          </>
        )}

        {/* Already sent */}
        {sentEmails.length > 0 && (
          <>
            <div style={styles.sectionHeader}>
              Sent ({sentEmails.length})
            </div>
            <div style={styles.emailList}>
              {sentEmails.map((e) => (
                <div key={e.id} style={{ ...styles.emailRow, opacity: 0.6 }}>
                  <div style={styles.oemName}>
                    ✓ {e.oem_name}
                  </div>
                  <div style={styles.emailAddr}>{e.email_to}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {pendingEmails.length === 0 && sentEmails.length === 0 && (
          <p style={styles.muted}>No emails in this batch.</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#141414",
    borderRadius: 16,
    padding: "24px 20px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center" as const,
    margin: "4px 0 20px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    marginBottom: 12,
    boxSizing: "border-box" as const,
    WebkitAppearance: "none" as any,
  },
  btnPrimary: {
    width: "100%",
    padding: "14px 20px",
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 10,
    border: "none",
    background: "#2d8cff",
    color: "#fff",
    cursor: "pointer",
    marginBottom: 8,
  },
  btnSecondary: {
    width: "100%",
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
  },
  specBox: {
    background: "rgba(45,140,255,0.08)",
    border: "1px solid rgba(45,140,255,0.2)",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 20,
  },
  specTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    marginBottom: 6,
  },
  specDetail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 8,
    marginTop: 4,
  },
  emailList: {
    marginBottom: 16,
  },
  emailRow: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    marginBottom: 6,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  oemName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
  emailAddr: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginTop: 2,
  },
  actions: {
    marginTop: 16,
    marginBottom: 12,
  },
  banner: {
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 16,
    textAlign: "center" as const,
  },
  muted: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center" as const,
  },
};
