"use client";

import { useRouter } from "next/navigation";

export default function NavigationButtons() {
  const router = useRouter();

  const pages = [
    { label: "Go to Secret Page 1", path: "/pages/secret-page-1" },
    { label: "Go to Secret Page 2", path: "/pages/secret-page-2" },
    { label: "Go to Secret Page 3", path: "/pages/secret-page-3" },
  ];

  return (
    <nav className="space-y-2 mb-6">
      {pages.map((page) => (
        <button
          key={page.path}
          onClick={() => router.push(page.path)}
          className="block w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {page.label}
        </button>
      ))}
    </nav>
  );
}
