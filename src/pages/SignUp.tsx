import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Check, X } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { toast } from "sonner";
import AuthGlassBackground from "@/components/AuthGlassBackground";
import { APP_TAGLINE } from "@/lib/branding";
import { setSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";

const MIN_PASSWORD_LENGTH = 8;

type PasswordRuleKey = "minLength" | "uppercase" | "lowercase" | "number" | "special";

function evaluatePasswordRules(password: string): Record<PasswordRuleKey, boolean> {
  return {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

const PASSWORD_RULE_LABELS: { key: PasswordRuleKey; label: string }[] = [
  { key: "minLength", label: `At least ${MIN_PASSWORD_LENGTH} characters` },
  { key: "uppercase", label: "At least one uppercase letter" },
  { key: "lowercase", label: "At least one lowercase letter" },
  { key: "number", label: "At least one number" },
  { key: "special", label: "At least one special character" },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm({ ...form, [key]: val });
  const mismatch = form.password.length > 0 && form.confirm.length > 0 && form.password !== form.confirm;

  const passwordRules = useMemo(() => evaluatePasswordRules(form.password), [form.password]);
  const passwordValid = useMemo(
    () => PASSWORD_RULE_LABELS.every(({ key }) => passwordRules[key]),
    [passwordRules],
  );

  const showRuleFeedback = form.password.length > 0;

  const authErrorMessage = (error: unknown): string => {
    if (!(error instanceof FirebaseError)) return "Sign-up failed. Please try again.";
    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/email-already-in-use":
        return "This email is already in use. Try signing in.";
      case "auth/weak-password":
        return "Password is too weak. Please improve it.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "Could not create account. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch || !passwordValid) return;
    const email = form.email.trim();
    const name = form.name.trim() || email.split("@")[0] || "User";
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, form.password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      setSession({ email: cred.user.email || email, name });
      toast.success("Account created successfully");
      navigate("/");
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthGlassBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="auth-glass-view p-8 space-y-6">
          <div className="text-center space-y-2">
            <img src="/Logo OA.svg" alt="OA logo" className="mx-auto h-20 w-auto" />
            <h2 className="text-2xl font-bold text-foreground">Create account</h2>
            <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground input-glow focus:outline-none focus:border-primary/50 transition-all" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground input-glow focus:outline-none focus:border-primary/50 transition-all" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-describedby="password-requirements"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/40 border text-sm text-foreground placeholder:text-muted-foreground input-glow focus:outline-none transition-all",
                    showRuleFeedback && !passwordValid ? "border-destructive/60 focus:border-destructive/70" : "border-border/40 focus:border-primary/50",
                  )}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ul
                id="password-requirements"
                className="space-y-1.5 rounded-lg border border-border/35 bg-muted/20 px-3 py-2.5"
                aria-live="polite"
              >
                {PASSWORD_RULE_LABELS.map(({ key, label }) => {
                  const met = passwordRules[key];
                  return (
                    <li key={key} className="flex items-start gap-2 text-xs">
                      {!showRuleFeedback ? (
                        <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border border-border/60" aria-hidden />
                      ) : met ? (
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                      ) : (
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" strokeWidth={2.5} aria-hidden />
                      )}
                      <span
                        className={cn(
                          !showRuleFeedback && "text-muted-foreground",
                          showRuleFeedback && met && "text-foreground",
                          showRuleFeedback && !met && "text-destructive",
                        )}
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={showPass ? "text" : "password"} value={form.confirm} onChange={(e) => update("confirm", e.target.value)} placeholder="••••••••" className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border text-sm text-foreground placeholder:text-muted-foreground input-glow focus:outline-none transition-all ${mismatch ? "border-destructive" : "border-border/40 focus:border-primary/50"}`} required />
              </div>
              {mismatch && <p className="text-xs text-destructive">Passwords don't match</p>}
            </div>
            <button
              type="submit"
              disabled={loading || mismatch || !passwordValid}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm btn-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {loading ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mx-auto" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
