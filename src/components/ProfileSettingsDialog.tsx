import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Braces, Eye, EyeOff, Palette, Shield, User } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { toast } from "sonner";
import { useClassView } from "@/context/ClassViewContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { auth } from "@/lib/firebase";
import { getSession, setSession } from "@/lib/session";

const MIN_NEW_PASSWORD = 8;

const LS_INAPP = "nexus-settings-inapp";
const LS_EMAIL_ALERTS = "nexus-settings-email-alerts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

function readBool(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    return v === "true";
  } catch {
    return fallback;
  }
}

export default function ProfileSettingsDialog({ open, onOpenChange, onSaved }: Props) {
  const { enabled: classViewEnabled, setEnabled: setClassViewEnabled } = useClassView();
  const { theme: activeTheme, setTheme: setColorMode } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inApp, setInApp] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [appearance, setAppearance] = useState<"light" | "dark">("dark");
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (!open) return;
    const s = getSession();
    setName(s?.name ?? "");
    setEmail(s?.email ?? "");
    setInApp(readBool(LS_INAPP, true));
    setEmailAlerts(readBool(LS_EMAIL_ALERTS, true));
    setAppearance(activeTheme === "light" ? "light" : "dark");
  }, [open, activeTheme]);

  useEffect(() => {
    if (!open) {
      setPasswordFormOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordBusy(false);
      setShowCurrentPw(false);
      setShowNewPw(false);
      setShowConfirmPw(false);
    }
  }, [open]);

  useEffect(() => {
    if (!passwordFormOpen) {
      setShowCurrentPw(false);
      setShowNewPw(false);
      setShowConfirmPw(false);
    }
  }, [passwordFormOpen]);

  const passwordErrorMessage = (error: unknown): string => {
    if (!(error instanceof FirebaseError)) return "Could not update password. Try again.";
    switch (error.code) {
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Current password is incorrect.";
      case "auth/weak-password":
        return "New password is too weak. Use at least 8 characters with mixed character types.";
      case "auth/requires-recent-login":
        return "Please sign out and sign in again, then try changing your password.";
      case "auth/too-many-requests":
        return "Too many attempts. Wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection.";
      default:
        return "Could not update password. Try again.";
    }
  };

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user?.email) {
      toast.error("No signed-in Firebase account. Sign in again.");
      return;
    }
    const hasEmailPassword = user.providerData.some((p) => p.providerId === "password");
    if (!hasEmailPassword) {
      toast.error("This account uses Google sign-in. Change your password in your Google account.");
      return;
    }
    if (!currentPassword) {
      toast.error("Enter your current password.");
      return;
    }
    if (newPassword.length < MIN_NEW_PASSWORD) {
      toast.error(`New password must be at least ${MIN_NEW_PASSWORD} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("Choose a new password different from the current one.");
      return;
    }
    setPasswordBusy(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFormOpen(false);
      toast.success("Password updated");
    } catch (error) {
      toast.error(passwordErrorMessage(error));
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleSave = () => {
    const n = name.trim();
    const em = email.trim();
    if (!em) {
      toast.error("Email is required");
      return;
    }
    setSession({ name: n || em.split("@")[0] || "User", email: em });
    localStorage.setItem(LS_INAPP, String(inApp));
    localStorage.setItem(LS_EMAIL_ALERTS, String(emailAlerts));
    onSaved?.();
    toast.success("Settings saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100] flex max-h-[min(85vh,720px)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1 border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your profile details and account information.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="h-4 w-4 text-primary" />
                Profile
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-name">Display name</Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/30"
                />
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="inapp" checked={inApp} onCheckedChange={(c) => setInApp(c === true)} />
                <label htmlFor="inapp" className="text-sm leading-none peer-disabled:cursor-not-allowed">
                  In-app notifications
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="email-alerts"
                  checked={emailAlerts}
                  onCheckedChange={(c) => setEmailAlerts(c === true)}
                />
                <label htmlFor="email-alerts" className="text-sm leading-none">
                  Email alerts for test results
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Palette className="h-4 w-4 text-primary" />
                Appearance
              </div>
              <div className="space-y-3">
                <Label>Theme</Label>
                <RadioGroup
                  value={appearance}
                  onValueChange={(v) => {
                    const next = v === "light" ? "light" : "dark";
                    setAppearance(next);
                    setColorMode(next);
                  }}
                  className="grid gap-2"
                >
                  <label
                    htmlFor="theme-dark"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/35 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <span>
                      <span className="font-medium text-foreground">Dark</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">Olive studio — default</span>
                    </span>
                  </label>
                  <label
                    htmlFor="theme-light"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/35 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value="light" id="theme-light" />
                    <span>
                      <span className="font-medium text-foreground">Light</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">Warm paper & sage accents</span>
                    </span>
                  </label>
                </RadioGroup>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="class-view"
                  checked={classViewEnabled}
                  onCheckedChange={(c) => setClassViewEnabled(c === true)}
                />
                <div className="grid gap-0.5 leading-none">
                  <label htmlFor="class-view" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Braces className="h-3.5 w-3.5 text-primary" />
                    Class view
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Show Tailwind class names while you hover. Shortcut: Ctrl+Shift+C
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                Security
              </div>
              <p className="text-sm text-muted-foreground">Update password and secure your account.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => setPasswordFormOpen((v) => !v)}
              >
                {passwordFormOpen ? "Cancel" : "Change password"}
              </Button>
              {passwordFormOpen && (
                <div className="mt-3 space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="space-y-2">
                    <Label htmlFor="settings-current-pw">Current password</Label>
                    <div className="relative">
                      <Input
                        id="settings-current-pw"
                        type={showCurrentPw ? "text" : "password"}
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-background/60 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showCurrentPw ? "Hide password" : "Show password"}
                      >
                        {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-new-pw">New password</Label>
                    <div className="relative">
                      <Input
                        id="settings-new-pw"
                        type={showNewPw ? "text" : "password"}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-background/60 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showNewPw ? "Hide password" : "Show password"}
                      >
                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-confirm-pw">Confirm new password</Label>
                    <div className="relative">
                      <Input
                        id="settings-confirm-pw"
                        type={showConfirmPw ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-background/60 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showConfirmPw ? "Hide password" : "Show password"}
                      >
                        {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={passwordBusy}
                    onClick={() => void handleChangePassword()}
                  >
                    {passwordBusy ? "Updating…" : "Update password"}
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>

        <DialogFooter className="border-t border-border/40 px-6 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
