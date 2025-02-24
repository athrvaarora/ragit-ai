import { useState } from "react";
import { Menu } from "lucide-react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Close sidebar when navigating to configuration page
  if (location.includes("/configuration") && isOpen) {
    setIsOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="fixed top-16 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[80%] sm:w-80">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
      <main className="flex-1 h-[calc(100vh-64px)] ml-4 overflow-auto">
        {children}
      </main>
    </div>
  );
}