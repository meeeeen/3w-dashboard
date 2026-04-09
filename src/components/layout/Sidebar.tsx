"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Wallet,
  UsersRound,
  Briefcase,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "대시보드", icon: BarChart3 },
  { href: "/projects", label: "프로젝트", icon: FolderKanban },
  { href: "/finance", label: "경영 현황", icon: Wallet },
  { href: "/team", label: "조직/인력", icon: UsersRound },
  { href: "/portfolio", label: "사업 포트폴리오", icon: Briefcase },
  { href: "/risks", label: "리스크 관리", icon: ShieldAlert },
  { href: "/projects/new", label: "프로젝트 등록", icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 border-r border-border bg-sidebar flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                3W
              </span>
            </div>
            <span className="font-semibold text-sm">통합 대시보드</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            3W Dashboard v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
