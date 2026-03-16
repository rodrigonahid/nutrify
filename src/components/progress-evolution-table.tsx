"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, Check } from "lucide-react";
import { Progress } from "@/types";

// ── Field definitions ─────────────────────────────────────────────────────

interface FieldDef {
  key: keyof Progress;
  label: string;
  unit: string;
  decimals?: number;
}

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Parâmetros",
    fields: [
      { key: "height",            label: "Altura",           unit: "m",     decimals: 2 },
      { key: "totalWeight",       label: "Peso total",       unit: "kg",    decimals: 1 },
      { key: "bmi",               label: "IMC",              unit: "kg/m²", decimals: 1 },
      { key: "bodyFatPercentage", label: "Gordura corporal", unit: "%",     decimals: 1 },
    ],
  },
  {
    title: "Circunferências",
    fields: [
      { key: "perimeterShoulder",              label: "Ombro",              unit: "cm" },
      { key: "perimeterChest",                 label: "Tórax",              unit: "cm" },
      { key: "perimeterNeck",                  label: "Pescoço",            unit: "cm" },
      { key: "perimeterWaist",                 label: "Cintura",            unit: "cm" },
      { key: "perimeterAbdomen",               label: "Abdômen",            unit: "cm" },
      { key: "perimeterHip",                   label: "Quadril",            unit: "cm" },
      { key: "perimeterBicepsLeftRelaxed",     label: "Bíceps E relaxado",  unit: "cm" },
      { key: "perimeterBicepsLeftContracted",  label: "Bíceps E contraído", unit: "cm" },
      { key: "perimeterBicepsRightRelaxed",    label: "Bíceps D relaxado",  unit: "cm" },
      { key: "perimeterBicepsRightContracted", label: "Bíceps D contraído", unit: "cm" },
      { key: "perimeterForearmLeft",           label: "Antebraço E",        unit: "cm" },
      { key: "perimeterForearmRight",          label: "Antebraço D",        unit: "cm" },
      { key: "perimeterWristLeft",             label: "Pulso E",            unit: "cm" },
      { key: "perimeterWristRight",            label: "Pulso D",            unit: "cm" },
      { key: "perimeterThighProximalLeft",     label: "Coxa proximal E",    unit: "cm" },
      { key: "perimeterThighProximalRight",    label: "Coxa proximal D",    unit: "cm" },
      { key: "perimeterThighMedialLeft",       label: "Coxa medial E",      unit: "cm" },
      { key: "perimeterThighMedialRight",      label: "Coxa medial D",      unit: "cm" },
      { key: "perimeterThighDistalLeft",       label: "Coxa distal E",      unit: "cm" },
      { key: "perimeterThighDistalRight",      label: "Coxa distal D",      unit: "cm" },
      { key: "perimeterCalfLeft",              label: "Panturrilha E",      unit: "cm" },
      { key: "perimeterCalfRight",             label: "Panturrilha D",      unit: "cm" },
    ],
  },
  {
    title: "Dobras Cutâneas",
    fields: [
      { key: "skinfoldBiceps",      label: "Bíceps",       unit: "mm" },
      { key: "skinfoldTriceps",     label: "Tríceps",      unit: "mm" },
      { key: "skinfoldAxillary",    label: "Axilar",       unit: "mm" },
      { key: "skinfoldSuprailiac",  label: "Suprailíaca",  unit: "mm" },
      { key: "skinfoldAbdominal",   label: "Abdominal",    unit: "mm" },
      { key: "skinfoldSubscapular", label: "Subescapular", unit: "mm" },
      { key: "skinfoldChest",       label: "Peitoral",     unit: "mm" },
      { key: "skinfoldThigh",       label: "Coxa",         unit: "mm" },
      { key: "skinfoldCalf",        label: "Panturrilha",  unit: "mm" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function getVal(entry: Progress, key: keyof Progress): number | null {
  const raw = entry[key];
  if (raw === null || raw === undefined) return null;
  const n = parseFloat(raw as string);
  return isNaN(n) ? null : n;
}

function fmt(val: number | null, decimals = 1): string {
  if (val === null) return "—";
  return val.toFixed(decimals);
}

// ── Delta indicator ───────────────────────────────────────────────────────

function Delta({ current, prev, decimals = 1 }: { current: number | null; prev: number | null; decimals?: number }) {
  if (current === null || prev === null) return null;
  const diff = current - prev;
  if (Math.abs(diff) < 0.05) return null;

  return (
    <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#F3F4F6] text-[13px] font-semibold text-[#374151]">
      {diff > 0 ? "↑" : "↓"}
      {Math.abs(diff).toFixed(decimals)}
    </span>
  );
}

// ── Column date dropdown (swap) ───────────────────────────────────────────

function ColumnDateDropdown({
  current,
  allEntries,
  otherSelectedIds,
  isLatest,
  onSwap,
  onRemove,
  canRemove,
}: {
  current: Progress;
  allEntries: Progress[];
  otherSelectedIds: number[];
  isLatest: boolean;
  onSwap: (newId: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [open, setOpen] = useState(false);
  // Options: all entries not selected in OTHER columns
  const options = allEntries.filter((e) => !otherSelectedIds.includes(e.id));

  return (
    <div className="relative inline-flex items-center gap-1">
      {canRemove && (
        <button
          onClick={onRemove}
          className="text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors duration-100 shrink-0"
          title="Remover coluna"
        >
          <X size={9} strokeWidth={2.5} />
        </button>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-0.5 text-[13px] font-semibold transition-colors duration-100",
          isLatest ? "text-[#2E8B5A] hover:text-[#236B47]" : "text-[#6B7280] hover:text-[#374151]",
        ].join(" ")}
      >
        {fmtDate(current.createdAt)}
        <ChevronDown size={9} strokeWidth={2.5} className={open ? "rotate-180" : ""} style={{ transition: "transform 0.15s" }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 z-20 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden min-w-[130px] left-1/2 -translate-x-1/2">
            {options.map((e) => {
              const isSelected = e.id === current.id;
              return (
                <button
                  key={e.id}
                  onClick={() => { if (!isSelected) onSwap(e.id); setOpen(false); }}
                  className={[
                    "w-full text-left px-3 py-2 text-[14px] flex items-center gap-2 transition-colors duration-100",
                    isSelected ? "text-[#2E8B5A] font-semibold bg-[rgba(46,139,90,0.04)]" : "text-[#374151] hover:bg-[#F9FAFB]",
                  ].join(" ")}
                >
                  <span className="w-3 shrink-0">
                    {isSelected && <Check size={10} strokeWidth={2.5} />}
                  </span>
                  {fmtDate(e.createdAt)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Add column button ─────────────────────────────────────────────────────

function AddColumnButton({
  allEntries,
  selectedIds,
  onAdd,
}: {
  allEntries: Progress[];
  selectedIds: number[];
  onAdd: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = allEntries.filter((e) => !selectedIds.includes(e.id));
  if (available.length === 0) return null;

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Adicionar data"
        className="w-5 h-5 rounded-full bg-[#F3F4F6] hover:bg-[rgba(46,139,90,0.10)] text-[#9CA3AF] hover:text-[#2E8B5A] flex items-center justify-center transition-colors duration-150"
      >
        <Plus size={11} strokeWidth={2.5} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden min-w-[130px]">
            <p className="px-3 pt-2 pb-1 text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              Adicionar data
            </p>
            {available.map((e) => (
              <button
                key={e.id}
                onClick={() => { onAdd(e.id); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[14px] text-[#374151] hover:bg-[#F9FAFB] transition-colors duration-100"
              >
                {fmtDate(e.createdAt)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

interface Props {
  allEntries: Progress[];
  selectedIds: number[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onSwap: (oldId: number, newId: number) => void;
}

const COL_W = 160;
const LABEL_W = 260;
const ADD_COL_W = 28;

export function ProgressEvolutionTable({ allEntries, selectedIds, onAdd, onRemove, onSwap }: Props) {
  const MAX_COLS = 5;

  const columns = selectedIds
    .map((id) => allEntries.find((e) => e.id === id))
    .filter(Boolean) as Progress[];
  columns.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const showAddCol = selectedIds.length < MAX_COLS && allEntries.length > selectedIds.length;
  const tableMinWidth = LABEL_W + columns.length * COL_W + (showAddCol ? ADD_COL_W : 0);

  if (columns.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-10 text-center text-[13px] text-[#9CA3AF]">
        Nenhum registro selecionado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => {
        const visibleFields = section.fields.filter((f) =>
          columns.some((col) => getVal(col, f.key) !== null)
        );
        if (visibleFields.length === 0) return null;

        return (
          <div key={section.title} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden w-fit max-w-full">
            <div className="overflow-x-auto max-w-full">
              <table style={{ width: tableMinWidth, borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                  {/* Section title row */}
                  <tr className="border-b border-[#F3F4F6]">
                    <th
                      colSpan={columns.length + 1 + (showAddCol ? 1 : 0)}
                      className="text-left px-4 py-2 bg-[#F9FAFB]"
                    >
                      <span className="text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                        {section.title}
                      </span>
                    </th>
                  </tr>
                  {/* Column headers — compact single row */}
                  <tr className="border-b-2 border-[#F3F4F6]">
                    <th style={{ width: LABEL_W }} className="px-4 py-1.5" />
                    {columns.map((col, i) => {
                      const isLatest = i === columns.length - 1;
                      const otherIds = selectedIds.filter((id) => id !== col.id);
                      return (
                        <th key={col.id} style={{ width: COL_W }} className="px-2 py-1.5 text-center">
                          <ColumnDateDropdown
                            current={col}
                            allEntries={allEntries}
                            otherSelectedIds={otherIds}
                            isLatest={isLatest}
                            onSwap={(newId) => onSwap(col.id, newId)}
                            onRemove={() => onRemove(col.id)}
                            canRemove={selectedIds.length > 2 && !isLatest}
                          />
                        </th>
                      );
                    })}
                    {showAddCol && (
                      <th style={{ width: ADD_COL_W }} className="px-0 py-1.5">
                        <AddColumnButton allEntries={allEntries} selectedIds={selectedIds} onAdd={onAdd} />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleFields.map((field, rowIdx) => (
                    <tr key={String(field.key)} className={rowIdx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-[14px] text-[#6B7280]">{field.label}</span>
                        {field.unit && (
                          <span className="text-[13px] text-[#C4C9D4] ml-1">{field.unit}</span>
                        )}
                      </td>
                      {columns.map((col, i) => {
                        const val = getVal(col, field.key);
                        const prevVal = i > 0 ? getVal(columns[i - 1], field.key) : null;
                        const decimals = field.decimals ?? 1;
                        const isLatest = i === columns.length - 1;

                        return (
                          <td
                            key={col.id}
                            className={[
                              "px-2 py-2 text-center whitespace-nowrap",
                              isLatest ? "bg-[rgba(46,139,90,0.03)]" : "",
                            ].join(" ")}
                          >
                            <span className={[
                              "text-[15px] font-semibold",
                              val === null ? "text-[#D1D5DB]" : isLatest ? "text-[#111827]" : "text-[#374151]",
                            ].join(" ")}>
                              {fmt(val, decimals)}
                            </span>
                            {i > 0 && <Delta current={val} prev={prevVal} decimals={decimals} />}
                          </td>
                        );
                      })}
                      {showAddCol && <td style={{ width: ADD_COL_W }} />}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
