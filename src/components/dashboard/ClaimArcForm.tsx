// src/components/dashboard/ClaimArcForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClaimArcFormProps {
  userId: string;
}

export default function ClaimArcForm({ userId }: ClaimArcFormProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Extract the NanoID from the share URL.
    // The URL format is arcforge.me/arc/[nanoid]
    // We support both full URLs and just the ID.
    const trimmed = shareUrl.trim();
    let arcId = trimmed;

    // If they pasted a full URL, extract just the ID
    if (trimmed.includes("/arc/")) {
      const parts = trimmed.split("/arc/");
      arcId = parts[parts.length - 1]
        .split("?")[0] // remove query params
        .split("#")[0]; // remove hash
    }

    if (!arcId || arcId.length < 4) {
      setError(
        "That doesn't look like a valid arc link. Paste the full URL from your browser.",
      );
      setLoading(false);
      return;
    }

    const res = await fetch("/api/arc/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arcId, userId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Try again.");
    } else {
      setSuccess(`${data.characterName} has been added to your arc.`);
      setShareUrl("");
      // Refresh the page to show the newly claimed arc
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div
      className="rounded-xl p-6 border"
      style={{
        background: "rgba(83, 74, 183, 0.06)",
        borderColor: "rgba(83, 74, 183, 0.15)",
      }}>
      <h3 className="text-base font-bold font-heading text-[#EEEDFE] mb-1">
        Have a previous arc?
      </h3>
      <p className="text-sm text-[#AFA9EC] mb-4">
        Paste your arc&apos;s share link to connect it to your
        account.
      </p>

      <form onSubmit={handleClaim} className="flex flex-col gap-3">
        <input
          type="text"
          value={shareUrl}
          onChange={(e) => setShareUrl(e.target.value)}
          placeholder="arcforge.me/arc/XXXXXXXX"
          className="w-full px-4 py-3 rounded-xl text-sm text-[#EEEDFE] placeholder:text-purple-400/40 focus:outline-none"
          style={{
            background: "rgba(83, 74, 183, 0.08)",
            border: "1px solid rgba(83, 74, 183, 0.2)",
          }}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-green-400">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading || !shareUrl.trim()}
          className="w-full py-3 rounded-xl text-sm font-medium text-[#EEEDFE] bg-linear-to-r from-[#534AB7] to-[#6B5FD8] hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? "Claiming..." : "Claim this arc"}
        </button>
      </form>
    </div>
  );
}
