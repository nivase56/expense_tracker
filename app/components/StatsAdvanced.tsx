"use client";

import React, { useMemo } from "react";
import { Chart } from "primereact/chart";
import type { Expense } from "../types";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function dayStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function weekStart(d: Date) {
  const dt = dayStart(d);
  const diff = dt.getDay();
  dt.setDate(dt.getDate() - diff);
  return dayStart(dt);
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function StatsAdvanced({ expenses }: { expenses: Expense[] }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="card p-4 text-sm">
        <div className="font-medium mb-1">Stats will appear here</div>
        <div className="muted">
          Add a few expenses to see insights about where and when you
          spend the most.
        </div>
      </div>
    );
  }

  const stats = useMemo(() => {
    const byItem = new Map<string, number>();
    const byDay = new Map<string, number>();
    const byWeek = new Map<string, number>();

    let total = 0;

    for (const e of expenses) {
      const amount = e.amount || 0;
      total += amount;

      const label = (e.description || "Unlabeled").trim() || "Unlabeled";
      byItem.set(label, (byItem.get(label) || 0) + amount);

      const d = new Date(e.date);
      const dayK = dateKey(d);
      byDay.set(dayK, (byDay.get(dayK) || 0) + amount);

      const wk = weekStart(d);
      const wkKey = dateKey(wk);
      byWeek.set(wkKey, (byWeek.get(wkKey) || 0) + amount);
    }

    const byItemArr = Array.from(byItem.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);

    const byDayArrAll = Array.from(byDay.entries())
      .map(([key, total]) => ({ key, total }))
      .sort((a, b) => (a.key < b.key ? -1 : 1));

    const byWeekArrAll = Array.from(byWeek.entries())
      .map(([key, total]) => ({ key, total }))
      .sort((a, b) => (a.key < b.key ? -1 : 1));

    const topItem = byItemArr[0];

    const topDay = byDayArrAll
      .slice()
      .sort((a, b) => b.total - a.total)[0];

    const topWeek = byWeekArrAll
      .slice()
      .sort((a, b) => b.total - a.total)[0];

    const byDayRecent = byDayArrAll.slice(-14);
    const byWeekRecent = byWeekArrAll.slice(-8);

    return {
      total,
      byItemArr,
      byDayRecent,
      byWeekRecent,
      topItem,
      topDay,
      topWeek,
    };
  }, [expenses]);

  const pieItemData = useMemo(() => {
    const top = stats.byItemArr.slice(0, 5);
    const othersTotal = stats.byItemArr
      .slice(5)
      .reduce((s, x) => s + x.total, 0);

    const labels = [...top.map((x) => x.label)];
    const data = [...top.map((x) => x.total)];

    if (othersTotal > 0) {
      labels.push("Other");
      data.push(othersTotal);
    }

    const colors = [
      "#f97316",
      "#fb923c",
      "#fdba74",
      "#34d399",
      "#60a5fa",
      "#a855f7",
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          hoverBackgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    };
  }, [stats.byItemArr]);

  const topItemsBarData = useMemo(() => {
    const items = stats.byItemArr.slice(0, 7);
    return {
      labels: items.map((x) => x.label),
      datasets: [
        {
          data: items.map((x) => x.total),
          backgroundColor: "rgba(249,115,22,0.8)",
          borderRadius: 8,
        },
      ],
    };
  }, [stats.byItemArr]);

  const dayBarData = useMemo(() => {
    const labels = stats.byDayRecent.map((d) => {
      const [year, month, day] = d.key.split("-").map((x) => Number(x));
      const dt = new Date(year, month - 1, day);
      return dt.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    });

    const values = stats.byDayRecent.map((d) => d.total);

    // Simple centered moving average to draw a smooth trend line
    const trend = values.map((_, idx, arr) => {
      let sum = 0;
      let count = 0;
      for (let i = idx - 2; i <= idx + 2; i++) {
        if (i >= 0 && i < arr.length) {
          sum += arr[i];
          count++;
        }
      }
      return count ? sum / count : 0;
    });

    return {
      labels,
      datasets: [
        {
          type: "bar" as const,
          label: "Amount",
          data: values,
          backgroundColor: "rgba(59,130,246,0.7)",
          borderRadius: 4,
        },
        {
          type: "line" as const,
          label: "Trend",
          data: trend,
          borderColor: "#f97316",
          backgroundColor: "rgba(249,115,22,0.15)",
          tension: 0.35,
          pointRadius: 2,
          pointBackgroundColor: "#f97316",
          borderWidth: 2,
        },
      ],
    };
  }, [stats.byDayRecent]);

  const weekBarData = useMemo(() => {
    const labels = stats.byWeekRecent.map((w) => {
      const [year, month, day] = w.key.split("-").map((x) => Number(x));
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const startLabel = start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const endLabel = end.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return `${startLabel} - ${endLabel}`;
    });

    const data = stats.byWeekRecent.map((w) => w.total);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: "rgba(16,185,129,0.75)",
          borderRadius: 4,
        },
      ],
    };
  }, [stats.byWeekRecent]);

  const pieOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const value = ctx.raw as number;
            const label = ctx.label as string;
            return `${label}: ${rupee.format(value)}`;
          },
        },
      },
    },
    cutout: "60%",
    maintainAspectRatio: false,
    animation: { duration: 500 },
  };

  const horizontalBarOptions = {
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => rupee.format(Number(ctx.raw ?? 0)),
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(15,23,42,0.06)" },
        ticks: {
          callback: (value: any) => rupee.format(Number(value)),
        },
      },
      y: {
        grid: { display: false },
      },
    },
    maintainAspectRatio: false,
  };

  const dayBarOptions = {
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx: any) => rupee.format(Number(ctx.raw ?? 0)),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        grid: { color: "rgba(15,23,42,0.06)" },
        ticks: {
          callback: (value: any) => rupee.format(Number(value)),
        },
      },
    },
    maintainAspectRatio: false,
  };

  const weekBarOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => rupee.format(Number(ctx.raw ?? 0)),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        grid: { color: "rgba(15,23,42,0.06)" },
        ticks: {
          callback: (value: any) => rupee.format(Number(value)),
        },
      },
    },
    maintainAspectRatio: false,
  };

  const topDayLabel = stats.topDay
    ? (() => {
        const [year, month, day] = stats.topDay.key
          .split("-")
          .map((x) => Number(x));
        const dt = new Date(year, month - 1, day);
        return dt.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        });
      })()
    : "-";

  const topWeekLabel = stats.topWeek
    ? (() => {
        const [year, month, day] = stats.topWeek.key
          .split("-")
          .map((x) => Number(x));
        const start = new Date(year, month - 1, day);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const s = start.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        const e = end.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        return `${s} - ${e}`;
      })()
    : "-";

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-3">
          <div className="small muted mb-1">Top item</div>
          <div className="text-sm font-semibold">
            {stats.topItem ? stats.topItem.label : "-"}
          </div>
          <div className="text-xs muted mt-1">
            {stats.topItem
              ? rupee.format(stats.topItem.total)
              : "No data yet"}
          </div>
        </div>
        <div className="card p-3">
          <div className="small muted mb-1">Highest spend day</div>
          <div className="text-sm font-semibold">{topDayLabel}</div>
          <div className="text-xs muted mt-1">
            {stats.topDay
              ? rupee.format(stats.topDay.total)
              : "No data yet"}
          </div>
        </div>
        <div className="card p-3">
          <div className="small muted mb-1">Highest spend week</div>
          <div className="text-sm font-semibold">{topWeekLabel}</div>
          <div className="text-xs muted mt-1">
            {stats.topWeek
              ? rupee.format(stats.topWeek.total)
              : "No data yet"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-3">
          <div className="text-sm font-medium mb-2">Spending by item</div>
          <div style={{ height: 260 }} className="animate-entrance">
            <Chart type="doughnut" data={pieItemData} options={pieOptions} />
          </div>
        </div>
        <div className="card p-3">
          <div className="text-sm font-medium mb-2">Top items (amount)</div>
          <div style={{ height: 260 }} className="animate-entrance">
            <Chart
              type="bar"
              data={topItemsBarData}
              options={horizontalBarOptions}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-3">
          <div className="text-sm font-medium mb-2">Last 14 days</div>
          <div style={{ height: 260 }} className="animate-entrance">
            <Chart type="bar" data={dayBarData} options={dayBarOptions} />
          </div>
        </div>
        <div className="card p-3">
          <div className="text-sm font-medium mb-2">Last 8 weeks</div>
          <div style={{ height: 260 }} className="animate-entrance">
            <Chart type="bar" data={weekBarData} options={weekBarOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
