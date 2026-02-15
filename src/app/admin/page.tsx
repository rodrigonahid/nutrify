import { getSession } from "@/lib/session";
import { Stethoscope, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

const ADMIN_CARDS = [
  {
    href: "/admin/professionals",
    icon: Stethoscope,
    label: "Nutricionistas",
    desc: "Gerenciar contas de nutricionistas",
    available: true,
  },
  {
    href: "#",
    icon: Users,
    label: "Pacientes",
    desc: "Ver todos os pacientes do sistema",
    available: false,
  },
  {
    href: "#",
    icon: BarChart3,
    label: "Estatísticas",
    desc: "Análises e relatórios da plataforma",
    available: false,
  },
];

export default async function AdminDashboard() {
  const { user } = await getSession();
  // Auth handled by layout

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-1">
          Admin
        </h1>
        <p className="text-sm font-medium text-[#6B7280]">
          Gestão da plataforma — {user?.email}
        </p>
      </div>

      {/* Management cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ADMIN_CARDS.map(({ href, icon: Icon, label, desc, available }) =>
            available ? (
              <Link
                key={href}
                href={href}
                className="group bg-white border border-[#E5E7EB] rounded-xl p-5 flex items-start gap-4 transition-all duration-150 hover:border-[#D1D5DB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(46,139,90,0.08)] flex items-center justify-center shrink-0 transition-colors duration-150 group-hover:bg-[rgba(46,139,90,0.12)]">
                  <Icon size={18} className="text-[#2E8B5A]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827] mb-0.5">{label}</p>
                  <p className="text-[13px] text-[#9CA3AF]">{desc}</p>
                </div>
              </Link>
            ) : (
              <div
                key={label}
                className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex items-start gap-4 opacity-50 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#9CA3AF]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827] mb-0.5">{label}</p>
                  <p className="text-[13px] text-[#9CA3AF]">{desc}</p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

    </div>
  );
}
