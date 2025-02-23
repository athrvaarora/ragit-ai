import { Link } from "wouter";
import { Bot } from "lucide-react";

export function Navbar() {
  return (
    <div className="h-16 border-b bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto h-full flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">RagIT AI</h1>
              <p className="text-xs text-white/80">AI-based RAG Config Generator</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
