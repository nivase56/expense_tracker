"use client";

import React, { useState } from "react";
import { GiWallet } from "react-icons/gi";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
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

  const rupeeFmt = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const todayTotal = (expenses || []).filter((e) => new Date(e.date) >= startOfToday).reduce((s, e) => s + e.amount, 0);
  const weekTotal = (expenses || []).filter((e) => new Date(e.date) >= sevenDaysAgo).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="app-container px-4">
        <header className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-glass p-2 flex items-center justify-center">
              <GiWallet className="text-amber-600" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Expense Tracker</h1>
            </div>
          </div>
          <nav className="flex gap-2 mt-2 sm:mt-0 flex-wrap items-center">
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
            {/* mobile-visible totals */}
            <div className="flex gap-2 ml-2">
              <div className="rounded-full bg-glass px-3 py-1 text-sm text-center">
                <div className="small muted">Today</div>
                <div className="font-semibold">{rupeeFmt(todayTotal)}</div>
              </div>
              <div className="rounded-full bg-glass px-3 py-1 text-sm text-center">
                <div className="small muted">Week</div>
                <div className="font-semibold">{rupeeFmt(weekTotal)}</div>
              </div>
            </div>
          </nav>
        </header>

        {tab === "expenses" ? (
          <section>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="card p-4 mb-4">
                  <ExpenseForm onAdd={addExpense} />
                </div>

                <div>
                  <ExpenseList expenses={expenses || []} onDelete={deleteExpense} />
                </div>
              </div>

            </div>
          </section>
        ) : (
          <section>
              <div className="card p-4">
                <StatsAdvanced expenses={expenses || []} />
              </div>
          </section>
        )}
      </main>
    </div>
  );
}
