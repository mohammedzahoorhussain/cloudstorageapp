"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-5xl font-bold mb-12 text-center"
      >
        Cloud Storage Portal ☁️
      </motion.h1>

      <div className="flex gap-8 flex-wrap justify-center">
        <Link href="/upload">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition"
          >
            Upload Files 🚀
          </motion.button>
        </Link>

              <Link href="/download">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition"
        >
          View / Download Files 📂
        </motion.button>
      </Link>

      </div>
    </div>
  );
}
