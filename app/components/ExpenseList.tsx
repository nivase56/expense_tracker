"use client";

import React from "react";
import type { Expense } from "../types";
import EmptyState from "./EmptyState";
import { FiTrash2 } from "react-icons/fi";

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export default function ExpenseList({
  expenses,
  onDelete,
}: {
  expenses: Expense[];
  onDelete: (id: string) => void;
}) {
  if (!expenses || expenses.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="mt-4 w-full list-container">
      {expenses
        .slice()
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .map((e) => (
          <li key={e.id} className="mb-2">
            <div className="card flex items-center justify-between p-3">
              <div>
                <div className="text-sm font-medium">{e.description}</div>
                <div className="text-xs muted">{new Date(e.date).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold">{rupee.format(e.amount)}</div>
                <button
                  onClick={() => onDelete(e.id)}
                  className="p-2 rounded-full text-rose-600 hover:bg-rose-50"
                  aria-label={`Delete ${e.description}`}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </li>
        ))}
    </ul>
  );
}
