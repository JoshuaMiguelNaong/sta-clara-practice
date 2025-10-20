"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        router.push("/");
      } else if (data.session) {
        router.push("/home");
      } else {
        router.push("/");
      }
    };

    checkSession();
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-gray-700 text-lg font-medium">
        Confirming your email... please wait.
      </p>
    </main>
  );
}
