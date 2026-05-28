import { useEffect, useState } from "react";
import {
  formatMemoryDetail,
  formatMetricPercent,
  getSystemMetrics,
  type SystemMetrics,
} from "../services/systemMetrics";

export function SystemMetricCards() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function refreshMetrics() {
      try {
        const nextMetrics = await getSystemMetrics();
        if (isMounted && nextMetrics) {
          setMetrics(nextMetrics);
        }
      } catch (error) {
        console.warn("Failed to read system metrics", error);
      }
    }

    refreshMetrics();
    const intervalId = window.setInterval(refreshMetrics, 1000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="flex h-12 w-[96px] shrink-0 flex-col justify-center gap-1" aria-label="系统占用">
      <MetricCard label="CPU" value={formatMetricPercent(metrics?.cpuPercent ?? null)} />
      <MetricCard
        label="内存"
        value={formatMetricPercent(metrics?.memoryPercent ?? null)}
        detail={metrics ? formatMemoryDetail(metrics) : undefined}
      />
    </section>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
}

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="flex h-[22px] w-full items-center justify-between rounded border border-slate-300 bg-white/95 px-1.5 text-[10px] leading-none text-slate-700 shadow-sm">
      <span className="shrink-0 font-medium">{label}</span>
      <span className="min-w-[38px] text-right font-semibold tabular-nums text-slate-950" title={detail}>
        {value}
      </span>
    </div>
  );
}
