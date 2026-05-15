import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Mood Test", path: "/mood-test" },
    { label: "Journal", path: "/journal" },
    { label: "Meditation", path: "/meditation" },
    { label: "Tips", path: "/tips" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold gradient-text">MindCare</span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            </div>
          ) : (
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setOpen((v) => !v)}
              >
                <User className="w-4 h-4" />
                <span className="max-w-[140px] truncate">
                  {user.name || "Profile"}
                </span>
              </Button>

              {open && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg p-2"
                  onMouseLeave={() => setOpen(false)}
                >
                  <div className="px-3 py-2">
                    <div className="text-sm font-medium">
                      {user.name || "User"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>

                  <div className="h-px bg-border my-2" />

                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted smooth-transition text-sm"
                    onClick={() => {
                      setOpen(false);
                      navigate("/settings");
                    }}
                  >
                    Settings
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted smooth-transition text-sm text-red-600"
                    onClick={() => {
                      setOpen(false);
                      logout();
                      navigate("/login", { replace: true });
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 px-4 py-4 shadow-lg backdrop-blur-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!user && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
              <Button
                variant="outline"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/signup");
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
