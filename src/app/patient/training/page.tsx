import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Dumbbell, ClipboardList, BookOpen } from "lucide-react";

const NAV_CARDS = [
  {
    href: "/patient/training/sessions",
    icon: ClipboardList,
    title: "Sessions",
    desc: "Log and view your training sessions",
  },
  {
    href: "/patient/training/workouts",
    icon: Dumbbell,
    title: "Workouts",
    desc: "Create and manage workout templates",
  },
  {
    href: "/patient/training/exercises",
    icon: BookOpen,
    title: "Exercise Library",
    desc: "Browse and add exercises",
  },
];

export default async function TrainingDashboard() {
  const { user } = await getSession();
  if (!user || user.role !== "patient") redirect("/login");

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/patient"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
          Training
        </h1>
      </div>

      <div className="space-y-3">
        {NAV_CARDS.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 px-4 py-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#D1D5DB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px transition-all duration-150"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(46,139,90,0.07)] flex items-center justify-center shrink-0">
              <Icon size={18} className="text-[#2E8B5A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">{title}</p>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">{desc}</p>
            </div>
            <span className="shrink-0 text-[12px] font-semibold text-[#2E8B5A]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
