import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  from: Date | null;
  to: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
};

export function DateRange({ label, from, to, onChange }: Props) {
  const text =
    from && to
      ? `${format(from, "dd/MM/yy")} – ${format(to, "dd/MM/yy")}`
      : from
        ? `A partir de ${format(from, "dd/MM/yy")}`
        : to
          ? `Até ${format(to, "dd/MM/yy")}`
          : "Qualquer data";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 w-full justify-start font-normal",
              !from && !to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="flex-1 truncate text-left">{text}</span>
            {(from || to) && (
              <X
                className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null, null);
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            locale={ptBR}
            selected={{ from: from ?? undefined, to: to ?? undefined }}
            onSelect={(r) => onChange(r?.from ?? null, r?.to ?? null)}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
