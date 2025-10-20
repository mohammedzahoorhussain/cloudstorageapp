"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";
import Link from "next/link";

interface FileObject {
  name: string;
  [key: string]: any;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !userName || !password) {
      alert("Please enter your name, password, and select a file.");
      return;
    }

    setUploading(true);

    const passwordHash = await bcrypt.hash(password, 10);
    const fileName = `${userName}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(fileName, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    await supabase.from("file_access").insert([
      { file_name: fileName, user_name: userName, password_hash: passwordHash },
    ]);

    alert("✅ File uploaded successfully!");
    setFile(null);
    setUserName("");
    setPassword("");
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {/* Navbar */}
      <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold text-blue-600">CloudStorageApp</h1>
        <nav className="space-x-4">
          <Link href="/" className="text-gray-800 hover:text-blue-600 font-medium">
            Home
          </Link>
          <Link href="/upload" className="text-blue-600 font-semibold">
            Upload
          </Link>
          <Link href="/download" className="text-gray-800 hover:text-blue-600 font-medium">
            Download
          </Link>
        </nav>
      </header>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-20 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">📤 Upload File</h2>
        <p className="text-gray-800 mb-6 font-medium">
          Securely upload your file with a name and password.
        </p>

        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="mb-3 w-full border border-gray-500 rounded-lg p-2 text-black placeholder-black font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full border border-gray-500 rounded-lg p-2 text-black placeholder-black font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full border border-gray-500 rounded-lg p-2 text-black font-semibold"
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full py-2 rounded-lg font-semibold text-white transition ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
          }`}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </div>
    </div>
  );
}
