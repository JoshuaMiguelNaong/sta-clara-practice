"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";

interface Friend {
  id: string;
  email: string;
  message?: string | null;
}

export default function SecretPage3() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [status, setStatus] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  // Fetch friends and incoming requests
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 1️⃣ Accepted friends
        const { data: accepted, error: acceptedError } = await supabase
          .from("friendships")
          .select("requester_id, receiver_id")
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (acceptedError) throw acceptedError;

        const friendIds = accepted?.map((f) =>
          f.requester_id === user.id ? f.receiver_id : f.requester_id
        );

        let friendsList: Friend[] = [];
        if (friendIds?.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", friendIds);

          const { data: messages } = await supabase
            .from("secret_messages")
            .select("user_id, message")
            .in("user_id", friendIds);

          friendsList =
            profiles?.map((p) => ({
              id: p.id,
              email: p.email,
              message:
                messages?.find((m) => m.user_id === p.id)?.message ?? null,
            })) ?? [];
        }

        setFriends(friendsList);

        // 2️⃣ Incoming friend requests
        const { data: incoming, error: reqError } = await supabase
          .from("friendships")
          .select("requester_id")
          .eq("receiver_id", user.id)
          .eq("status", "pending");

        if (!reqError && incoming?.length) {
          const requesterIds = incoming.map((r) => r.requester_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", requesterIds);

          setRequests(profiles ?? []);
        }
      } catch (err: unknown) {
        if (err instanceof Error) console.error("Fetch error:", err.message);
      }
    };

    fetchData();
  }, [user]);

  // Send friend request
  const handleAddFriend = async () => {
    if (!emailToAdd.trim() || !user) return;

    // Lookup target user
    const { data: targetUser, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", emailToAdd)
      .maybeSingle();

    if (lookupError || !targetUser) {
      alert("User not found.");
      return;
    }

    if (targetUser.id === user.id) {
      alert("You cannot add yourself as a friend.");
      return;
    }

    // Check existing friendship
    const { data: existing } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},receiver_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      alert("Friend request already exists or you are already friends.");
      return;
    }

    // Insert friend request
    const { error: insertError } = await supabase.from("friendships").insert([
      {
        requester_id: user.id,
        receiver_id: targetUser.id,
        status: "pending",
      },
    ]);

    if (insertError) {
      alert("Error sending friend request: " + insertError.message);
    } else {
      setStatus("✅ Friend request sent!");
      setEmailToAdd("");
    }
  };

  // Accept friend request
  const handleAccept = async (requesterId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("requester_id", requesterId)
      .eq("receiver_id", user?.id);

    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== requesterId));
      alert("Friend request accepted!");
    } else {
      alert("Error accepting request: " + error.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 space-y-6">
      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Secret Page 3</h1>
        <p className="text-gray-600 mb-4">
          Welcome, {user?.email}! Manage your friends and view their messages.
        </p>

        {/* Add Friend */}
        <div className="mb-6">
          <input
            type="email"
            placeholder="Enter email to add friend"
            value={emailToAdd}
            onChange={(e) => setEmailToAdd(e.target.value)}
            className="border border-gray-300 rounded-lg w-full p-3 mb-3"
          />
          <button
            onClick={handleAddFriend}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Send Friend Request
          </button>
          {status && (
            <p className="text-green-600 text-center mt-3 font-medium">
              {status}
            </p>
          )}
        </div>

        {/* Incoming Requests */}
        {requests.length > 0 && (
          <div className="mb-6 text-left">
            <h2 className="font-semibold mb-2">Incoming Friend Requests</h2>
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2"
              >
                <span>{r.email}</span>
                <button
                  onClick={() => handleAccept(r.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Friends List */}
        <div className="text-left">
          <h2 className="font-semibold mb-2">Friends’ Secret Messages</h2>
          {friends.length > 0 ? (
            friends.map((f) => (
              <div
                key={f.id}
                className="bg-gray-50 p-3 rounded-lg mb-2 border border-gray-200"
              >
                <p className="font-medium text-gray-700">{f.email}</p>
                {f.message ? (
                  <p className="text-gray-800 mt-1">{f.message}</p>
                ) : (
                  <p className="text-red-500 text-sm mt-1">
                    ❌ 401 Unauthorized — not friends or no message.
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">You have no friends yet 😢</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-3 mt-6">
          <button
            onClick={() => router.push("/pages/secret-page-2")}
            className="bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
          >
            ⬅️ Back to Secret Page 2
          </button>
          <button
            onClick={() => router.push("/home")}
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Back to Home 🏠
          </button>
        </div>
      </div>
    </main>
  );
}
