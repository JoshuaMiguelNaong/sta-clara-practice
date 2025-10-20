"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import HomeHeader from "@/app/components/homeHeader";
import NavigationButtons from "@/app/components/navigationButton";
import AccountActions from "@/app/components/accountActions";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/"); // redirect if not logged in
      } else {
        setUser(data.user);
      }
    };
    getUser();
  }, [router]);

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return null; // optional loading fallback

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <HomeHeader email={user.email ?? null} />
        <NavigationButtons />
        {/* Pass user.id (Supabase UID) to AccountActions */}
        <AccountActions userId={user.id} onLogout={handleLogout} />
      </div>
    </main>
  );
}
