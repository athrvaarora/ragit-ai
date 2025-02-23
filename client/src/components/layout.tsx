import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 h-[calc(100vh-64px)] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}