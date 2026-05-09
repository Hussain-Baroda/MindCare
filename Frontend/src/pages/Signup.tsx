import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signup as apiSignup } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [trustedContactName, setTrustedContactName] = useState("");
  const [trustedContactEmail, setTrustedContactEmail] = useState("");
  const { toast } = useToast();
  const nav = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiSignup(
        name,
        email,
        password,
        trustedContactName || trustedContactEmail
          ? { name: trustedContactName, email: trustedContactEmail }
          : undefined
      ); // stores token
      await refresh(); // fetches /me and sets user
      toast({ title: "Success", description: "Account created successfully" });
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Brain className="w-10 h-10 text-primary" />
          <span className="text-2xl font-bold gradient-text">MindCare</span>
        </Link>

        <div className="glass-card p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Start your wellness journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-4">
              <div>
                <div className="font-medium">Trusted Contact</div>
                <p className="text-xs text-muted-foreground">
                  Optional but recommended. If high-risk journal text is detected,
                  MindCare can send this person a safety alert.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trustedContactName">Contact Name</Label>
                <Input
                  id="trustedContactName"
                  type="text"
                  placeholder="Someone you trust"
                  value={trustedContactName}
                  onChange={(e) => setTrustedContactName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trustedContactEmail">Contact Email</Label>
                <Input
                  id="trustedContactEmail"
                  type="email"
                  placeholder="trusted.person@email.com"
                  value={trustedContactEmail}
                  onChange={(e) => setTrustedContactEmail(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-6">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-primary hover:text-accent smooth-transition font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
