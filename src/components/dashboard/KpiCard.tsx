import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: "default" | "success" | "danger" | "warning";
  icon?: ReactNode;
};

export function KpiCard({ label, value, hint, accent = "default", icon }: Props) {
  const accentBar = {
    default: "bg-primary",
    success: "bg-emerald-500",
    danger: "bg-rose-500",
    warning: "bg-amber-500",
  }[accent];

  const accentText = {
    default: "text-primary",
    success: "text-emerald-600",
    danger: "text-rose-600",
    warning: "text-amber-600",
  }[accent];

  return (
    <Card className="relative overflow-hidden p-5">
      <div className={cn("absolute left-0 top-0 h-full w-1", accentBar)} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {icon ? <div className={cn("opacity-70", accentText)}>{icon}</div> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}
