import { getSession } from "@/lib/session";
import { db } from "@/db";
import { patients, professionals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UtensilsCrossed, TrendingUp, Dumbbell, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const FEATURE_CARDS = [
  {
    href: "/patient/meal-plan",
    icon: UtensilsCrossed,
    label: "Meu Plano Alimentar",
    desc: "Veja seu plano nutricional atual",
  },
  {
    href: "/patient/progress",
    icon: TrendingUp,
    label: "Progresso",
    desc: "Acompanhe sua jornada de saúde",
  },
  {
    href: "/patient/training",
    icon: Dumbbell,
    label: "Treino",
    desc: "Acompanhe seu progresso na academia",
  },
  {
    href: "/patient/nutritionist",
    icon: User,
    label: "Meu Nutricionista",
    desc: "Veja seu nutricionista e plano",
  },
];

export default async function PatientDashboard() {
  const { user } = await getSession();

  // Fetch patient + professional for name/avatar
  const [patient] = await db
    .select({ id: patients.id, name: patients.name, professionalId: patients.professionalId })
    .from(patients)
    .where(eq(patients.userId, user!.id))
    .limit(1);

  const [professional] = patient
    ? await db
        .select({ name: professionals.name, avatarUrl: professionals.avatarUrl, logoUrl: professionals.logoUrl })
        .from(professionals)
        .where(eq(professionals.id, patient.professionalId))
        .limit(1)
    : [null];

  const firstName = patient?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "você";
  const profAvatar = professional?.avatarUrl ?? null;
  const profLogo = professional?.logoUrl ?? null;
  const profName = professional?.name ?? null;

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Page heading */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-1">
            Olá, {firstName}
          </h1>
          <p className="text-sm font-medium text-[#6B7280]">
            Aqui está uma visão geral da sua jornada de saúde
          </p>
        </div>

        {/* Professional badge + logo */}
        {(profAvatar || profLogo || profName) && (
          <div className="shrink-0 flex items-center gap-2">

            {/* Logo */}
            {profLogo && (
              <Link href="/patient/nutritionist" className="shrink-0">
                <Image
                  src={profLogo}
                  alt="Logo"
                  width={200}
                  height={64}
                  className="h-16 w-auto object-contain rounded-lg"
                  unoptimized
                />
              </Link>
            )}

            {/* Professional button */}
            <Link
              href="/patient/nutritionist"
              className="shrink-0 flex items-center gap-2.5 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 hover:border-[#D1D5DB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-150"
            >
              {profAvatar ? (
                <Image
                  src={profAvatar}
                  alt={profName ?? "Nutricionista"}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[rgba(46,139,90,0.08)] flex items-center justify-center shrink-0">
                  <User size={15} className="text-[#2E8B5A]" />
                </div>
              )}
              <div className="text-left">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide leading-none mb-0.5">Nutricionista</p>
                <p className="text-[12px] font-semibold text-[#374151] leading-none">{profName ?? "Ver perfil"}</p>
              </div>
            </Link>

          </div>
        )}
      </div>

      {/* Feature cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURE_CARDS.map(({ href, icon: Icon, label, desc }) => (
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
          ))}
        </div>
      </section>

    </div>
  );
}
