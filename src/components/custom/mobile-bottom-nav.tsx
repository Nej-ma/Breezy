"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, Bell, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/auth-provider";

const navigationItems = [
  {
    name: "Accueil",
    href: "/home",
    icon: Home,
  },
  {
    name: "Recherche",
    href: "/search",
    icon: Search,
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    name: "Notifications",
    href: "/notifications", 
    icon: Bell,
  },
  {
    name: "Profil",
    href: "/profile", // On mettra à jour avec le username
    icon: User,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Mettre à jour le lien profil avec le username
  const items = navigationItems.map(item => 
    item.name === "Profil" 
      ? { ...item, href: `/${user?.username || 'profile'}` }
      : item
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/search" && pathname.startsWith("/search"));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isActive && "fill-current"
              )} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
