import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

export function AdminLayout() {
  const { isAdmin, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card shrink-0 z-30">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-bold text-foreground">Admin Dashboard</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
