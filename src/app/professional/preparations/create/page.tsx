"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Unit = "g" | "ml" | "cups" | "spoons" | "scoops" | "units";
type Category = "food" | "preparation";

interface IngredientRow {
  name: string;
  unit: Unit;
}

export default function CreatePreparationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("preparation");
  const [description, setDescription] = useState("");
  const [preparationMethod, setPreparationMethod] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { name: "", unit: "g" },
  ]);

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: "", unit: "g" }]);
  }

  function removeIngredient(idx: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateIngredient(idx: number, field: keyof IngredientRow, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/professional/preparations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim() || undefined,
          preparationMethod:
            category === "preparation" ? preparationMethod.trim() || undefined : undefined,
          ingredients: ingredients
            .filter((ing) => ing.name.trim())
            .map((ing, idx) => ({ name: ing.name.trim(), unit: ing.unit, orderIndex: idx })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao criar preparação");
      }

      router.push("/professional/preparations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar preparação");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[640px]">

      <Link
        href="/professional/preparations"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar às preparações
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-1">
          Nova Preparação
        </h1>
        <p className="text-sm font-medium text-[#6B7280]">
          Crie um template de alimento ou preparação para reutilizar em planos alimentares.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Main details */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="text-[14px] font-semibold text-[#111827]">Detalhes</p>
          </div>
          <div className="p-4 space-y-4">

            {/* Name */}
            <div>
              <Label
                htmlFor="prep-name"
                className="text-[13px] font-semibold text-[#374151] mb-1.5 block"
              >
                Nome <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="prep-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex.: Frango grelhado com legumes"
                required
              />
            </div>

            {/* Category */}
            <div>
              <p className="text-[13px] font-semibold text-[#374151] mb-2">
                Categoria <span className="text-[#DC2626]">*</span>
              </p>
              <div className="flex gap-2">
                {(["preparation", "food"] as Category[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={[
                      "h-8 px-3.5 text-[13px] font-semibold rounded-[8px] border transition-all duration-150",
                      category === cat
                        ? cat === "food"
                          ? "bg-[#F3F4F6] border-[#9CA3AF] text-[#374151]"
                          : "bg-[rgba(46,139,90,0.08)] border-[#2E8B5A] text-[#2E8B5A]"
                        : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]",
                    ].join(" ")}
                  >
                    {cat === "food" ? "Alimento" : "Preparação"}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="prep-desc"
                className="text-[13px] font-semibold text-[#374151] mb-1.5 block"
              >
                Descrição{" "}
                <span className="text-[#9CA3AF] font-normal">(opcional)</span>
              </Label>
              <Input
                id="prep-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição"
              />
            </div>

            {/* Preparation method — only for "preparation" category */}
            {category === "preparation" && (
              <div>
                <Label
                  htmlFor="prep-method"
                  className="text-[13px] font-semibold text-[#374151] mb-1.5 block"
                >
                  Modo de preparo{" "}
                  <span className="text-[#9CA3AF] font-normal">(opcional)</span>
                </Label>
                <textarea
                  id="prep-method"
                  value={preparationMethod}
                  onChange={(e) => setPreparationMethod(e.target.value)}
                  rows={4}
                  placeholder="Descreva como preparar…"
                  className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none resize-none transition-all duration-150 hover:border-[#D1D5DB] focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.12)]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="text-[14px] font-semibold text-[#111827]">Ingredientes</p>
          </div>
          <div className="p-4 space-y-2">

            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Input
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                    placeholder="Nome do ingrediente"
                    className="h-9"
                  />
                </div>

                <div className="inline-flex shrink-0">
                  <select
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                    className="h-9 w-[80px] px-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] outline-none transition-all duration-150 focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.12)] appearance-none cursor-pointer"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="cups">cups</option>
                    <option value="spoons">spoons</option>
                    <option value="scoops">scoops</option>
                    <option value="units">units</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  disabled={ingredients.length === 1}
                  className="h-9 w-9 flex items-center justify-center shrink-0 text-[#9CA3AF] hover:text-[#DC2626] rounded-[6px] transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Remover ingrediente"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addIngredient}
              className="h-8 px-3 text-[12px] font-semibold text-[#6B7280] border border-dashed border-[#D1D5DB] rounded-[6px] hover:border-[#2E8B5A] hover:text-[#2E8B5A] transition-colors duration-150"
            >
              + Adicionar ingrediente
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/professional/preparations"
            className="flex-1 h-11 flex items-center justify-center text-[14px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-150"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvando…
              </>
            ) : (
              "Salvar preparação"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
