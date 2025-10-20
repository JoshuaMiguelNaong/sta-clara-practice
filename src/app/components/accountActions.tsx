"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AccountActionsProps {
  userId: string; // Supabase UID
  onLogout: () => Promise<void>;
}

export default function AccountActions({
  userId,
  onLogout,
}: AccountActionsProps) {
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (!userId) {
      alert("Cannot delete account: missing user ID.");
      return;
    }

    if (!confirm("Are you sure you want to delete your account?")) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Account deleted successfully.");
        await onLogout(); // log out after deletion
        router.push("/");
      } else {
        alert("Error deleting account: " + data.error);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Unexpected error: " + message);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      setLoggingOut(true);
      await onLogout();
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleLogoutClick}
        disabled={loggingOut}
        className={`py-2 px-4 rounded text-white ${
          loggingOut ? "bg-gray-300" : "bg-gray-400 hover:bg-gray-500"
        } transition`}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>

      <button
        onClick={handleDeleteAccount}
        disabled={deleting}
        className={`py-2 px-4 rounded text-white ${
          deleting ? "bg-red-300" : "bg-red-500 hover:bg-red-600"
        } transition`}
      >
        {deleting ? "Deleting..." : "Delete Account"}
      </button>
    </div>
  );
}
