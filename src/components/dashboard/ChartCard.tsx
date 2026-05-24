import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ChartCard({ title, subtitle, right, children, className }: Props) {
  return (
    <Card className={`flex flex-col p-5 ${className ?? ""}`}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}
