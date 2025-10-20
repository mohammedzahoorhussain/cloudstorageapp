"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import bcrypt from "bcryptjs";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const uploadFile = async () => {
    try {
      if (!file || !userName || !password) {
        alert("Please fill in all fields and select a file.");
        return;
      }

      setUploading(true);

      // Prefix filename with username so download filters work
      const fileName = `${userName}_${Date.now()}_${file.name}`;

      // 1) Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        alert("Upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      // 2) Hash the password (bcryptjs)
      const passwordHash = await bcrypt.hash(password, 10);

      // 3) Insert metadata into file_access
      const { error: dbError } = await supabase.from("file_access").insert([
        {
          file_name: fileName,
          user_name: userName,
          password_hash: passwordHash,
        },
      ]);

      if (dbError) {
        console.error("DB insert error:", dbError.message);
        alert("Error saving file info: " + dbError.message);
        setUploading(false);
        return;
      }

      alert("✅ File uploaded and access saved successfully!");
      // clear inputs
      setFile(null);
      setPassword("");
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 p-6">
      <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold text-blue-600">CloudStorageApp</h1>
        <nav className="space-x-4">
          <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
          <Link href="/upload" className="text-blue-600 font-semibold">Upload</Link>
          <Link href="/download" className="text-gray-700 hover:text-blue-600 font-medium">Download</Link>
        </nav>
      </header>

      <div className="bg-white rounded-2xl shadow-lg p-8 mt-20 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Upload File</h2>
        <p className="text-gray-500 mb-6">Enter your details and upload securely.</p>

        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="mb-4 w-full border border-gray-300 rounded-lg p-2 placeholder-gray-500 text-black"
        />

        <input
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full border border-gray-300 rounded-lg p-2 placeholder-gray-500 text-black"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full border border-gray-300 rounded-lg p-2"
        />

        <button
          onClick={uploadFile}
          disabled={uploading}
          className={`w-full py-2 rounded-lg font-semibold text-white transition ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
