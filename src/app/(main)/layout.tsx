import React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Navbar from "@/components/custom/navbar";
import { MobileBottomNav } from "@/components/custom/mobile-bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        
        {/* Main Content */}
        <SidebarInset className="flex flex-col min-h-screen">
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
            {/* Mobile Bottom Navigation - hidden on desktop */}
          <div className="md:hidden">
            <MobileBottomNav />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}