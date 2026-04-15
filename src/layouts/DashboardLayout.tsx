import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardLayout() {
  return (
    <div className="relative min-h-screen">
      <AppSidebar />
      <div className="relative z-10 lg:ml-64 transition-all duration-300">
        <DashboardHeader />
        <main className="p-4 md:p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
