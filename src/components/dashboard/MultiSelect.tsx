import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({ label, options, selected, onChange, placeholder }: Props) {
  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter((s) => s !== val));
    else onChange([...selected, val]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-10 w-full justify-between font-normal"
          >
            <span className="truncate text-left">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">
                  {placeholder ?? "Todos"}
                </span>
              ) : selected.length <= 2 ? (
                selected.join(", ")
              ) : (
                <span className="flex items-center gap-1">
                  <Badge variant="secondary" className="rounded-md">
                    {selected.length} selecionados
                  </Badge>
                </span>
              )}
            </span>
            <div className="flex items-center gap-1">
              {selected.length > 0 ? (
                <X
                  className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([]);
                  }}
                />
              ) : null}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Nenhum resultado.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSel = selected.includes(opt);
                  return (
                    <CommandItem
                      key={opt}
                      onSelect={() => toggle(opt)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                          isSel
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input",
                        )}
                      >
                        {isSel ? <Check className="h-3 w-3" /> : null}
                      </div>
                      <span className="truncate">{opt}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
