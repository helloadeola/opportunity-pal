import { useState, useMemo } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface QuickOption {
  label: string;
  days: number;
}

const quickOptions: QuickOption[] = [
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "In 1 week", days: 7 },
  { label: "In 2 weeks", days: 14 },
];

interface FollowUpPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  hintLabel?: string;
}

const FollowUpPicker = ({ value, onChange, hintLabel }: FollowUpPickerProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const daysAway = differenceInCalendarDays(value, today);

  const daysLabel =
    daysAway === 0
      ? "Today"
      : daysAway === 1
      ? "Tomorrow"
      : `In ${daysAway} days`;

  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  return (
    <div>
      <label className="text-sm font-bold text-foreground mb-1.5 block">
        Follow up by
      </label>

      {/* Quick option chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickOptions.map((opt) => {
          const isActive = daysAway === opt.days;
          return (
            <button
              key={opt.days}
              type="button"
              onClick={() => onChange(addDays(opt.days))}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              )}
            >
              {opt.label}
            </button>
          );
        })}

        {/* Pick a date button */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1",
                !quickOptions.some((o) => o.days === daysAway)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              )}
            >
              <CalendarIcon size={12} />
              Pick a date
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(d) => {
                if (d) {
                  onChange(d);
                  setCalendarOpen(false);
                }
              }}
              disabled={(d) => d < today}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected date display */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5">
        <CalendarIcon size={16} className="text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {format(value, "EEEE, MMMM d")}
          </p>
          <p className="text-xs text-muted-foreground">
            {daysLabel}
            {hintLabel && !quickOptions.some((o) => o.days === daysAway) ? ` · ${hintLabel}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FollowUpPicker;
