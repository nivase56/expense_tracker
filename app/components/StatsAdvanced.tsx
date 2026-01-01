"use client";

import React, { useMemo, useState } from "react";
import type { Expense } from "../types";
import { Chart } from "primereact/chart";

function dayStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function weekStart(d: Date) {
  const dt = dayStart(d);
  const diff = dt.getDay();
  dt.setDate(dt.getDate() - diff);
  return dayStart(dt);
}

function monthStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sum(list: Expense[]) {
  return list.reduce((s, e) => s + e.amount, 0);
}

export default function StatsAdvanced({ expenses }: { expenses: Expense[] }) {
  const now = new Date();
  const todayStart = dayStart(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const thisWeekStart = weekStart(now);
  const prevWeekStart = new Date(thisWeekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const thisMonthStart = monthStart(now);
  const prevMonthStart = new Date(thisMonthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const totals = useMemo(() => {
    const tToday = expenses.filter((e) => new Date(e.date) >= todayStart);
    const tYesterday = expenses.filter((e) => {
      const d = new Date(e.date);
      return d >= yesterdayStart && d < todayStart;
    });

    const tThisWeek = expenses.filter((e) => new Date(e.date) >= thisWeekStart);
    const tPrevWeek = expenses.filter((e) => new Date(e.date) >= prevWeekStart && new Date(e.date) < thisWeekStart);

    const tThisMonth = expenses.filter((e) => new Date(e.date) >= thisMonthStart);
    const tPrevMonth = expenses.filter((e) => new Date(e.date) >= prevMonthStart && new Date(e.date) < thisMonthStart);

    return {
      today: sum(tToday),
      yesterday: sum(tYesterday),
      thisWeek: sum(tThisWeek),
      prevWeek: sum(tPrevWeek),
      thisMonth: sum(tThisMonth),
      prevMonth: sum(tPrevMonth),
    };
  }, [expenses]);

  function pctChange(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

  const dayPct = pctChange(totals.today, totals.yesterday);
  const weekPct = pctChange(totals.thisWeek, totals.prevWeek);
  const monthPct = pctChange(totals.thisMonth, totals.prevMonth);

  const barData = {
    labels: ["Yesterday", "Today"],
    datasets: [
      {
        label: "Amount",
        backgroundColor: ["#ffd8a8", "#f59e0b"],
        data: [totals.yesterday, totals.today],
      },
    ],
  };

  const weekData = {
    labels: ["Prev Week", "This Week"],
    datasets: [
      {
        label: "Amount",
        backgroundColor: ["#fde68a", "#f59e0b"],
        data: [totals.prevWeek, totals.thisWeek],
      },
    ],
  };

  const monthData = {
    labels: ["Prev Month", "This Month"],
    datasets: [
      {
        label: "Amount",
        backgroundColor: ["#fee2b3", "#f59e0b"],
        data: [totals.prevMonth, totals.thisMonth],
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: (value: any) => rupee.format(Number(value)) } } },
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="card p-3 text-center">
          <div className="text-sm muted">Today</div>
          <div className="mt-1 text-lg font-semibold">{rupee.format(totals.today)}</div>
          <div className={`mt-1 text-sm ${dayPct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{dayPct}%</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-sm muted">Week</div>
          <div className="mt-1 text-lg font-semibold">{rupee.format(totals.thisWeek)}</div>
          <div className={`mt-1 text-sm ${weekPct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{weekPct}%</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-sm muted">Month</div>
          <div className="mt-1 text-lg font-semibold">{rupee.format(totals.thisMonth)}</div>
          <div className={`mt-1 text-sm ${monthPct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{monthPct}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <CollapsiblePanel title="Day Comparison">
          <Chart type="bar" data={barData} options={options} />
        </CollapsiblePanel>
        <CollapsiblePanel title="Week Comparison">
          <Chart type="bar" data={weekData} options={options} />
        </CollapsiblePanel>
        <CollapsiblePanel title="Month Comparison">
          <Chart type="bar" data={monthData} options={options} />
        </CollapsiblePanel>
      </div>
    </div>
  );
}

function CollapsiblePanel({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2"
        aria-expanded={open}
      >
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm muted">
          <svg
            className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
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
      <div className={`overflow-hidden transition-all ${open ? "max-h-[800px]" : "max-h-0"}`}>
        <div className="p-3 pt-0">{children}</div>
      </div>
    </div>
  );
}
