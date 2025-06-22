"use client";

import type * as React from "react";
import { Home, User, MessageSquare, Bell, LogOut } from "lucide-react";

import Link from "next/link";

// ui components
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// hooks
import { useAuth } from "@/app/auth-provider";
import { useTranslation } from "react-i18next";

export default function Navbar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {  // Custom hooks to fetch user and auth data
  const { user, logout } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  const { t } = useTranslation("common"); // use the "common" namespace

  // Navigation items
  const items = [
    {
      title: t("navbar.home"),
      url: "/home",
      icon: Home,
    },
    {
      title: t("navbar.profile"),
      url: `/${user?.username}`,
      icon: User,
    },
    {
      title: t("navbar.message"),
      url: "#",
      icon: MessageSquare,
    },
    {
      title: t("navbar.notification"),
      url: "#",
      icon: Bell,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarTrigger className="ml-auto" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex flex-row items-center p-4">
                <Image
                  src={"/breezy_logo_small.svg"}
                  alt="Breezy Logo"
                  className=""
                  width={60}
                  height={60}
                />
                <div>
                  <h1 className="text-lg font-semibold">Breezy</h1>
                  <p className="text-sm text-muted-foreground">
                    {user?.username || "Guest"}
                  </p>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                onClick={handleLogout}
                variant={"ghost"}
                className="flex items-center justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut
                  onClick={handleLogout}
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                <span>{t("navbar.logout")}</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
