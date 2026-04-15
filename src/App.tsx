import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { ClassViewProvider } from "@/context/ClassViewContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/firebase";
import { clearSession, displayNameFromEmail, getSession, setSession } from "@/lib/session";
import DashboardLayout from "./layouts/DashboardLayout.tsx";
import DashboardHome from "./pages/DashboardHome.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import NotFound from "./pages/NotFound.tsx";
import IdeaInput from "./pages/startup/IdeaInput.tsx";
import ConceptGeneration from "./pages/startup/ConceptGeneration.tsx";
import BusinessModelPlanning from "./pages/startup/BusinessModelPlanning.tsx";
import WorkflowVisualization from "./pages/startup/WorkflowVisualization.tsx";
import ConceptValidation from "./pages/startup/ConceptValidation.tsx";
import InnovationSystem from "./pages/startup/InnovationSystem.tsx";

const queryClient = new QueryClient();

function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta || !resolvedTheme) return;
    meta.setAttribute("content", resolvedTheme === "light" ? "#F5F7F8" : "#45474B");
  }, [resolvedTheme]);
  return null;
}

function RequireAuth() {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        clearSession();
        setSignedIn(false);
        setChecking(false);
        return;
      }
      const fallbackEmail = getSession()?.email || "";
      const email = user.email || fallbackEmail;
      const name = user.displayName?.trim() || displayNameFromEmail(email || "user@example.com");
      if (email) {
        setSession({ email, name });
      }
      setSignedIn(true);
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return signedIn ? <Outlet /> : <Navigate to="/signin" replace />;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="nexus-settings-theme">
    <ThemeColorMeta />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ClassViewProvider>
            <Routes>
              <Route element={<RequireAuth />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/startup/ideas" element={<IdeaInput />} />
                  <Route path="/startup/concepts" element={<ConceptGeneration />} />
                  <Route path="/startup/planning" element={<BusinessModelPlanning />} />
                  <Route path="/startup/workflow" element={<WorkflowVisualization />} />
                  <Route path="/startup/validation" element={<ConceptValidation />} />
                  <Route path="/startup/innovation" element={<InnovationSystem />} />
                </Route>
              </Route>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ClassViewProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
