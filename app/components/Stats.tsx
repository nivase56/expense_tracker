"use client";

import React from "react";
import type { Expense } from "../types";

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

function sum(list: Expense[]) {
  return list.reduce((s, e) => s + e.amount, 0);
}

export default function Stats({ expenses }: { expenses: Expense[] }) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const today = expenses.filter((e) => new Date(e.date) >= startOfToday);
  const week = expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);
  const month = expenses.filter((e) => new Date(e.date) >= startOfMonth);

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <div className="text-sm muted">Today</div>
          <div className="mt-2 text-lg font-semibold">{rupee.format(sum(today))}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-sm muted">Last 7 days</div>
          <div className="mt-2 text-lg font-semibold">{rupee.format(sum(week))}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-sm muted">Month</div>
          <div className="mt-2 text-lg font-semibold">{rupee.format(sum(month))}</div>
        </div>
      </div>
    </div>
  );
}
