"use client";

import React, { useMemo, useState } from "react";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
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
    const tPrevWeek = expenses.filter(
      (e) =>
        new Date(e.date) >= prevWeekStart && new Date(e.date) < thisWeekStart
    );

    const tThisMonth = expenses.filter(
      (e) => new Date(e.date) >= thisMonthStart
    );
    const tPrevMonth = expenses.filter(
      (e) =>
        new Date(e.date) >= prevMonthStart && new Date(e.date) < thisMonthStart
    );

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

  const rupee = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  const dayPct = pctChange(totals.today, totals.yesterday);
  const weekPct = pctChange(totals.thisWeek, totals.prevWeek);
  const monthPct = pctChange(totals.thisMonth, totals.prevMonth);

  const barData = {
    labels: ["Yesterday", "Today"],
    datasets: [
      {
        label: "Today vs Yesterday",
        data: [totals.yesterday, totals.today],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.14)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#f59e0b",
        borderWidth: 2,
      },
    ],
  };

  const weekData = {
    labels: ["Prev Week", "This Week"],
    datasets: [
      {
        label: "Prev Week",
        data: [totals.prevWeek, totals.thisWeek],
        borderColor: "#f97316",
        backgroundColor: "rgba(249,115,22,0.12)",
        fill: true,
        tension: 0.36,
        pointRadius: 3,
        pointBackgroundColor: "#fb923c",
        borderWidth: 2,
      },
    ],
  };

  const monthData = {
    labels: ["Prev Month", "This Month"],
    datasets: [
      {
        label: "Prev Month",
        data: [totals.prevMonth, totals.thisMonth],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#f59e0b",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    elements: {
      line: { borderCapStyle: "round" },
      point: { hoverRadius: 6 },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { display: true } },
      y: {
        grid: { color: "rgba(15,23,42,0.04)" },
        ticks: { callback: (value: any) => rupee.format(Number(value)) },
      },
    },
    maintainAspectRatio: false,
    animation: { duration: 500 },
  };

  // build description repetition stats
  const descStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const e of expenses) {
      const t = (e.description || "").trim();
      if (!t) continue;
      const cur = map.get(t) || { count: 0, total: 0 };
      cur.count += 1;
      cur.total += e.amount;
      map.set(t, cur);
    }
    const arr = Array.from(map.entries()).map(([text, meta]) => ({
      text,
      ...meta,
    }));
    arr.sort((a, b) => b.count - a.count || b.total - a.total);
    return arr.slice(0, 8);
  }, [expenses]);

  const descLabels = descStats.map((d) => d.text);
  const descCounts = descStats.map((d) => d.count);
  const descColors = descStats.map((_, i) =>
    i % 2 === 0 ? "rgba(245,158,11,0.9)" : "rgba(245,158,11,0.6)"
  );

  const descData = {
    labels: descLabels,
    datasets: [
      {
        label: "Frequency",
        data: descCounts,
        backgroundColor: descColors,
        borderRadius: 6,
      },
    ],
  };

  const [openDay, setOpenDay] = useState(false);
  const [openWeek, setOpenWeek] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);

  function renderSparkline(prev: number, curr: number, color: string) {
    const w = 64;
    const h = 24;
    const pad = 4;
    const max = Math.max(prev, curr, 1);
    const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
    const x0 = pad;
    const x1 = w - pad;
    const y0 = y(prev);
    const y1 = y(curr);
    const path = `M ${x0} ${y0} L ${x1} ${y1}`;
    const area = `M ${x0} ${h - pad} L ${x0} ${y0} L ${x1} ${y1} L ${x1} ${
      h - pad
    } Z`;
    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="inline-block align-middle"
      >
        <path d={area} fill={color.replace("0.9", "0.12")} />
        <path
          d={path}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  function TrendButton({
    title,
    current,
    previous,
    pct,
    open,
    onClick,
  }: {
    title: string;
    current: number;
    previous: number;
    pct: number;
    open: boolean;
    onClick: () => void;
  }) {
    const increased = pct > 0;
    const color = increased ? "text-rose-500" : "text-emerald-600";
    const Arrow = increased ? FiArrowUpRight : FiArrowDownRight;
    return (
      <button
        onClick={onClick}
        className="card p-3 text-center cursor-pointer hover:shadow-md flex-1"
        aria-expanded={open}
      >
        <div className="text-sm flex justify-center gap-2">
          {title}
          <div
            className={`${color} text-lg font-semibold flex items-center justify-center gap-1`}
          >
            {" "}
            <Arrow />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-3 mb-3">
        <TrendButton
          title="Today"
          current={totals.today}
          previous={totals.yesterday}
          pct={dayPct}
          open={openDay}
          onClick={() => setOpenDay((v) => !v)}
        />
        <TrendButton
          title="Week"
          current={totals.thisWeek}
          previous={totals.prevWeek}
          pct={weekPct}
          open={openWeek}
          onClick={() => setOpenWeek((v) => !v)}
        />
        <TrendButton
          title="Month"
          current={totals.thisMonth}
          previous={totals.prevMonth}
          pct={monthPct}
          open={openMonth}
          onClick={() => setOpenMonth((v) => !v)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <CollapsiblePanel
          title="Day Comparison"
          open={openDay}
          onToggle={() => setOpenDay((v) => !v)}
        >
          <div style={{ height: 160 }} className="animate-entrance">
            <Chart type="line" data={barData} options={options} />
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Week Comparison"
          open={openWeek}
          onToggle={() => setOpenWeek((v) => !v)}
        >
          <div style={{ height: 180 }} className="animate-entrance">
            <Chart type="line" data={weekData} options={options} />
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Month Comparison"
          open={openMonth}
          onToggle={() => setOpenMonth((v) => !v)}
        >
          <div style={{ height: 200 }} className="animate-entrance">
            <Chart type="line" data={monthData} options={options} />
          </div>
        </CollapsiblePanel>
        <CollapsiblePanel title="Most Frequent Descriptions">
          <div style={{ height: 220 }} className="animate-entrance">
            <Chart
              type="bar"
              data={descData}
              options={{
                indexAxis: "y",
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </CollapsiblePanel>
      </div>
    </div>
  );
}

function CollapsiblePanel({
  title,
  children,
  open: controlledOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? Boolean(controlledOpen) : internalOpen;

  function toggle() {
    if (onToggle) onToggle();
    if (!isControlled) setInternalOpen((v) => !v);
  }

  return (
    <div className="card p-2">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-3 py-2"
        aria-expanded={open}
      >
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm muted">
          <svg
            className={`transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all ${
          open ? "max-h-[800px]" : "max-h-0"
        }`}
      >
        <div className="p-3 pt-0">{children}</div>
      </div>
    </div>
  );
}
