import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  BookOpen,
  Brain,
  Crown,
  Heart,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Settings,
  Trophy,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Heart, label: "Mood Test", path: "/mood-test" },
  { icon: BookOpen, label: "Journal", path: "/journal" },
  { icon: Brain, label: "Meditation", path: "/meditation" },
  { icon: Lightbulb, label: "Tips", path: "/tips" },
  { icon: Trophy, label: "Achievements", path: "/achievements" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: Crown, label: "Leaderboard", path: "/leaderboard" },
  { icon: Settings, label: "Profile", path: "/settings" },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col p-4 sm:p-6">
      <Link
        to="/dashboard"
        onClick={onNavigate}
        className="mb-8 flex items-center gap-2"
      >
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold gradient-text">MindCare</span>
      </Link>

      <nav className="space-y-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 smooth-transition ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/55"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[82vw] max-w-72 border-r border-sidebar-border bg-sidebar shadow-2xl">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-border p-2 hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right text-sm text-muted-foreground sm:block">
              <div className="truncate">{user?.name}</div>
              <div className="truncate text-xs">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 text-sm text-muted-foreground hover:text-foreground smooth-transition"
            >
              Logout
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
