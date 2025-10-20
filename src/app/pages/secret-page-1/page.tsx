"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function SecretPage1() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [secretMessage, setSecretMessage] = useState<string>("");

  useEffect(() => {
    const loadUserAndMessage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/"); // redirect if not logged in
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("secret_messages")
        .select("message")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setSecretMessage("🕵️ Default secret message visible only to users!");
      } else {
        setSecretMessage(data.message);
      }

      setLoading(false);
    };

    loadUserAndMessage();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 space-y-6">
      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Secret Page 1</h1>
        <p className="text-gray-600 mb-4">Welcome, {user?.email}</p>

        <p className="bg-gray-100 p-4 rounded-lg mb-6">{secretMessage}</p>

        {/* 🔁 Navigation Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => router.push("/home")}
            className="bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
          >
            ⬅️ Back to Home
          </button>
          <button
            onClick={() => router.push("/pages/secret-page-2")}
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Go to Secret Page 2
          </button>
        </div>
      </div>
    </main>
  );
}
