"use client";

import React, { useState } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Stats from "./components/Stats";
import StatsAdvanced from "./components/StatsAdvanced";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Expense } from "./types";

export default function Home() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses:v1", []);
  const [tab, setTab] = useState<"expenses" | "stats">("expenses");

  function addExpense(e: Expense) {
    setExpenses([...(expenses || []), e]);
    setTab("expenses");
  }

  function deleteExpense(id: string) {
    setExpenses((expenses || []).filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="app-container px-4">
        <header className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-glass p-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10h18M7 6h.01M17 6h.01M12 3v18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Expense Tracker</h1>
            </div>
          </div>
          <nav className="flex gap-2 mt-2 sm:mt-0 flex-wrap">
            <button
              onClick={() => setTab("expenses")}
              className={`rounded-full px-3 py-1 text-sm ${tab === "expenses" ? "bg-amber-600 text-white" : "border"}`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTab("stats")}
              className={`rounded-full px-3 py-1 text-sm ${tab === "stats" ? "bg-amber-600 text-white" : "border"}`}
            >
              Stats
            </button>
          </nav>
        </header>

        {tab === "expenses" ? (
          <section>
            <div className="card p-4 mb-4">
              <ExpenseForm onAdd={addExpense} />
            </div>

            <div className="">
              <ExpenseList expenses={expenses || []} onDelete={deleteExpense} />
            </div>
          </section>
        ) : (
          <section>
            <div className="card p-4">
              <Stats expenses={expenses || []} />
            </div>
            <div className="mt-4 card p-4">
              <StatsAdvanced expenses={expenses || []} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
