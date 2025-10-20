"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";

export default function SecretPage2() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [message, setMessage] = useState("");
  const [existingMessage, setExistingMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  // Ensure user exists in profiles table
  useEffect(() => {
    const ensureProfile = async () => {
      if (!user) return;
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
      });
      if (error) console.error("Error upserting profile:", error.message);
    };
    ensureProfile();
  }, [user]);

  // Fetch user's existing secret message
  useEffect(() => {
    const fetchMessage = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("secret_messages")
        .select("message")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Fetch error:", error.message);
      } else if (data) {
        setExistingMessage(data.message);
        setMessage(data.message);
      }
    };

    fetchMessage();
  }, [user]);

  // Save or update secret message
  const handleSave = async () => {
    if (!user || !message.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const { error } = await supabase
        .from("secret_messages")
        .upsert([{ user_id: user.id, message, updated_at: new Date() }], {
          onConflict: "user_id",
        });

      if (error) throw error;

      setExistingMessage(message);
      setStatus("✅ Message saved successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error saving message:", err.message);
        alert("Error saving message: " + err.message);
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 space-y-6">
      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Secret Page 2</h1>
        <p className="text-gray-600 mb-4">
          Welcome, {user?.email}! You can add or update your secret message.
        </p>

        <textarea
          className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={4}
          placeholder="Write your secret message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {saving
            ? "Saving..."
            : existingMessage
            ? "Update Message"
            : "Save Message"}
        </button>

        {status && (
          <p className="text-green-600 text-center mt-3 font-medium">
            {status}
          </p>
        )}

        {existingMessage && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 font-medium mb-2">
              Your current message:
            </p>
            <p className="text-gray-800">{existingMessage}</p>
          </div>
        )}

        <div className="flex flex-col space-y-3 mt-6">
          <button
            onClick={() => router.push("/pages/secret-page-1")}
            className="bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
          >
            ⬅️ Back to Secret Page 1
          </button>
          <button
            onClick={() => router.push("/pages/secret-page-3")}
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Go to Secret Page 3 ➡️
          </button>
        </div>
      </div>
    </main>
  );
}
