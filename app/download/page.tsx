"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";
import Link from "next/link";

interface FileObject {
  name: string;
  [key: string]: any;
}

export default function DownloadPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<FileObject[]>([]);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setVerified(false);
    setUserName("");
    setPassword("");
    setFiles([]);
    setErrorMsg("");
  }, []);

  const verifyUser = async () => {
    if (!userName || !password) {
      setErrorMsg("Please enter both name and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("file_access")
      .select("*")
      .eq("user_name", userName);

    if (error || !data || data.length === 0) {
      setErrorMsg("No files found for this user.");
      setLoading(false);
      return;
    }

    const isMatch = await bcrypt.compare(password, data[0].password_hash);
    if (!isMatch) {
      setErrorMsg("Incorrect password.");
      setLoading(false);
      return;
    }

    setVerified(true);
    await fetchFiles(userName);
    setLoading(false);
  };

  const fetchFiles = async (user: string) => {
    const { data, error } = await supabase.storage.from("uploads").list("", {
      limit: 100,
    });

    if (error) {
      console.error("Error fetching files:", error.message);
      return;
    }

    const filtered = data?.filter((f) => f.name.startsWith(user + "_"));
    setFiles(filtered || []);
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);
    return data?.publicUrl || "#";
  };

  const deleteFile = async (fileName: string) => {
    const confirmDelete = confirm(`Delete ${fileName}?`);
    if (!confirmDelete) return;

    setDeleting(fileName);

    const { error: storageError } = await supabase.storage
      .from("uploads")
      .remove([fileName]);

    if (storageError) {
      alert("❌ Failed to delete: " + storageError.message);
      setDeleting(null);
      return;
    }

    await supabase.from("file_access").delete().eq("file_name", fileName);

    setFiles(files.filter((f) => f.name !== fileName));
    alert("✅ File deleted.");
    setDeleting(null);
  };

  const handleLogout = () => {
    setVerified(false);
    setUserName("");
    setPassword("");
    setFiles([]);
    setErrorMsg("");
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
          <Link href="/upload" className="text-gray-800 hover:text-blue-600 font-medium">
            Upload
          </Link>
          <Link href="/download" className="text-blue-600 font-semibold">
            Download
          </Link>
        </nav>
      </header>

      {/* Login Section */}
      {!verified ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-20 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">🔐 Access Files</h2>
          <p className="text-gray-800 mb-6 font-medium">
            Enter your name and password to view your uploaded files.
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-3 w-full border border-gray-500 rounded-lg p-2 text-black placeholder-black font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {errorMsg && <p className="text-red-600 text-sm mb-3 font-semibold">{errorMsg}</p>}

          <button
            onClick={verifyUser}
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {loading ? "Verifying..." : "Access Files"}
          </button>
        </div>
      ) : (
        <div className="mt-24 w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">
              📂 Files for {userName}
            </h2>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-700 hover:text-blue-600 font-medium"
            >
              Log Out
            </button>
          </div>

          {files.length === 0 ? (
            <p className="text-center text-gray-700 font-medium">
              No files found for this user.
            </p>
          ) : (
            <ul className="space-y-3">
              {files.map((file) => (
                <li
                  key={file.name}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm"
                >
                  <span className="truncate max-w-[60%] text-gray-900 font-semibold">
                    {file.name.replace(userName + "_", "")}
                  </span>

                  <div className="flex gap-3">
                    <a
                      href={getFileUrl(file.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Download ⬇️
                    </a>
                    <button
                      onClick={() => deleteFile(file.name)}
                      disabled={deleting === file.name}
                      className="text-red-600 font-bold hover:underline"
                    >
                      {deleting === file.name ? "Deleting..." : "Delete 🗑️"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
