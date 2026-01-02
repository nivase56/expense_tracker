"use client";

import React, { useState } from "react";
import type { Expense } from "../types";
import EmptyState from "./EmptyState";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export default function ExpenseList({
  expenses,
  onDelete,
  onEdit,
}: {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit?: (e: Expense) => void;
}) {
  if (!expenses || expenses.length === 0) {
    return <EmptyState />;
  }

  function pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }
  function localKey(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // group expenses by local date
  const groups = expenses
    .slice()
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .reduce((acc: Record<string, Expense[]>, e) => {
      const d = new Date(e.date);
      const key = localKey(d);
      acc[key] = acc[key] || [];
      acc[key].push(e);
      return acc;
    }, {});

  const keys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));

  const [openDate, setOpenDate] = useState<string | null>(keys[0] || null);

  return (
    <div className="mt-4 w-full list-container space-y-3">
      {keys.map((k) => {
        const items = groups[k];
        const total = items.reduce((s, it) => s + it.amount, 0);
        const sampleDate = new Date(items[0].date);
        const label = sampleDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const isOpen = openDate === k;

        return (
          <div key={k} className="card p-2 animate-entrance">
            <button
              type="button"
              onClick={() => setOpenDate(isOpen ? null : k)}
              className="w-full flex items-center justify-between px-3 py-2"
              aria-expanded={isOpen}
            >
              <div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs muted">{items.length} item{items.length>1? 's':''}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-semibold">{rupee.format(total)}</div>
                <svg
                  className={`transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            <div className={`overflow-hidden transition-all ${isOpen ? 'max-h-[1200px]' : 'max-h-0'}`}>
              <div className="p-3 pt-0 space-y-2">
                {items.map((e, idx) => (
                  <div key={e.id} className="card flex items-center justify-between p-3 animate-entrance" style={{ ['--i' as any]: idx }}>
                    <div>
                      <div className="text-sm font-medium">{e.description}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold">{rupee.format(e.amount)}</div>
                      <button
                        onClick={() => onEdit && onEdit(e)}
                        className="p-2 rounded-full text-amber-600 hover:bg-amber-50"
                        aria-label={`Edit ${e.description}`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => onDelete(e.id)}
                        className="p-2 rounded-full text-rose-600 hover:bg-rose-50"
                        aria-label={`Delete ${e.description}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
