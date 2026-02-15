"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  TrendingUp,
  Dumbbell,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/patient", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/patient/meal-plan", icon: UtensilsCrossed, label: "Meal Plan" },
  { href: "/patient/progress", icon: TrendingUp, label: "Progress" },
  { href: "/patient/training", icon: Dumbbell, label: "Training" },
];

interface PatientNavProps {
  userEmail: string;
}

export function PatientNav({ userEmail }: PatientNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initial = userEmail[0]?.toUpperCase() ?? "?";

  return (
    <>
      {/* ── Desktop left mini-rail ─────────────────────── */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-dvh w-14 bg-white border-r border-[#E5E7EB] z-40">
        <div className="flex items-center justify-center h-14 border-b border-[#E5E7EB] shrink-0">
          <Link href="/patient" title="Dashboard">
            <div className="w-8 h-8 bg-[#236B47] rounded-[8px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                <line x1="11" y1="20" x2="11" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11 10.5C11 10.5 6.5 9 6 3.5C6 3.5 11.5 3 14 7C15.5 9 14.5 10.8 11 10.5Z" fill="white" fillOpacity="0.92"/>
                <path d="M11 15C11 15 15.5 12.5 18.5 15C18.5 15 17.5 20 13.5 20.5C11.5 20.8 10.5 17.5 11 15Z" fill="white" fillOpacity="0.65"/>
              </svg>
            </div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center py-3 gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={[
                  "w-10 h-10 rounded-[10px] flex items-center justify-center transition-all duration-150",
                  active
                    ? "bg-[rgba(46,139,90,0.10)] text-[#2E8B5A]"
                    : "text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6]",
                ].join(" ")}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col items-center pb-4 gap-1 shrink-0">
          <div
            title={userEmail}
            className="w-8 h-8 rounded-full bg-[#F2F4F3] border border-[#E5E7EB] flex items-center justify-center text-[11px] font-bold text-[#6B7280] select-none"
          >
            {initial}
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all duration-150"
          >
            <LogOut size={18} strokeWidth={1.8} />
          </button>
        </div>
      </nav>

      {/* ── Mobile top bar ────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E7EB] z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#236B47] rounded-[7px] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
              <line x1="11" y1="20" x2="11" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M11 10.5C11 10.5 6.5 9 6 3.5C6 3.5 11.5 3 14 7C15.5 9 14.5 10.8 11 10.5Z" fill="white" fillOpacity="0.92"/>
              <path d="M11 15C11 15 15.5 12.5 18.5 15C18.5 15 17.5 20 13.5 20.5C11.5 20.8 10.5 17.5 11 15Z" fill="white" fillOpacity="0.65"/>
            </svg>
          </div>
          <span className="text-[15px] font-extrabold text-[#111827] tracking-[-0.3px]">
            Nutri<span className="opacity-50 font-semibold">fy</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-150 p-1"
          title="Sign out"
        >
          <LogOut size={18} strokeWidth={1.8} />
        </button>
      </header>

      {/* ── Mobile bottom tab bar ─────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E5E7EB] z-40 flex items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-[3px] min-w-[44px] py-1 rounded-[8px] transition-colors duration-150",
                active ? "text-[#2E8B5A]" : "text-[#9CA3AF]",
              ].join(" ")}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-[3px] min-w-[44px] py-1 rounded-[8px] text-[#9CA3AF] transition-colors duration-150"
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span className="text-[10px] font-semibold">Sign out</span>
        </button>
      </nav>
    </>
  );
}
