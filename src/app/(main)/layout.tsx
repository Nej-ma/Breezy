import React, { ReactNode } from "react";
import Navbar from "@/components/custom/navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

interface HomeLayoutProps {
  children: ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <SidebarProvider>
          <Navbar />
          <SidebarInset className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <main className="w-full p-5 overflow-auto h-screen">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
};

export default HomeLayout;
