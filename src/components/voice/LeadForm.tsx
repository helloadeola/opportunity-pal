import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExtractedData } from "@/lib/transcriptExtractor";

const categories = [
  "Opportunity",
  "Warm Lead",
  "Speaking Engagement",
  "Partnership",
  "Collaboration",
  "Other",
];

interface LeadFormProps {
  audioUrl: string | null;
  transcript: string;
  context: string;
  extracted: ExtractedData | null;
  onBack: () => void;
  onSave: (data: {
    name: string;
    company: string;
    category: string;
    notes: string;
    dueDate: Date;
  }) => void;
}

const LeadForm = ({ transcript, context, extracted, onBack, onSave }: LeadFormProps) => {
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 3);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("Other");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState<Date>(defaultDue);
  const [dueDateLabel, setDueDateLabel] = useState("Default: 3 days from now");
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  // Pre-fill from extracted data
  useEffect(() => {
    if (extracted) {
      if (extracted.name) setName(extracted.name);
      if (extracted.company) setCompany(extracted.company);
      if (extracted.category) setCategory(extracted.category);
      if (extracted.dueDate) setDueDate(extracted.dueDate);
      if (extracted.dueDateLabel) setDueDateLabel(extracted.dueDateLabel);
    }
    // Combine transcript + context for notes
    const combined = [transcript, context].filter(Boolean).join("\n\n").trim();
    if (combined) setNotes(combined);
  }, [extracted, transcript, context]);

  const handleSave = () => {
    const newErrors: { name?: string; category?: string } = {};
    if (!name.trim()) newErrors.name = "Who is this about? Give them a name! 😊";
    if (!category) newErrors.category = "Pick a category so we can organize! ✨";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSave({
      name: name.trim().slice(0, 100),
      company: company.trim().slice(0, 100),
      category,
      notes: notes.trim().slice(0, 1000),
      dueDate,
    });
  };

  const hasExtracted = extracted && (extracted.name || extracted.company || extracted.category !== "Other");

  return (
    <>
      <div className="mb-4 mt-2">
        <h1 className="text-2xl font-extrabold text-foreground">Almost there! 🙌</h1>
        <p className="text-muted-foreground mt-1 font-medium text-sm">
          {hasExtracted
            ? "We pre-filled what we could. See something to fix? Just edit below!"
            : "Just a few quick details about this lead."}
        </p>
      </div>

      {hasExtracted && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4"
        >
          <p className="text-xs font-medium text-primary">
            ✨ We extracted some info from your voice note. Edit anything that doesn't look right!
          </p>
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">
            Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Who is this about?"
            value={name}
            maxLength={100}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            className={`bg-card ${errors.name ? "border-destructive" : ""}`}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-destructive mt-1.5 font-medium"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">Company</label>
          <Input
            placeholder="Where are they from?"
            value={company}
            maxLength={100}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-card"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">
            Category <span className="text-destructive">*</span>
          </label>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              if (errors.category) setErrors((p) => ({ ...p, category: undefined }));
            }}
          >
            <SelectTrigger className={`bg-card ${errors.category ? "border-destructive" : ""}`}>
              <SelectValue placeholder="What kind of lead?" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AnimatePresence>
            {errors.category && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-destructive mt-1.5 font-medium"
              >
                {errors.category}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Notes / transcript */}
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">Notes</label>
          <Textarea
            placeholder="Context, notes, transcript..."
            value={notes}
            maxLength={1000}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-card min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your voice note transcript + notes are here. Edit freely!
          </p>
        </div>

        {/* Follow-up date */}
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">
            Follow up by
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-card",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dueDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(d) => {
                  if (d) {
                    setDueDate(d);
                    setDueDateLabel("Custom date");
                  }
                }}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground mt-1">
            {dueDateLabel}
          </p>
        </div>

        <Button size="lg" className="mt-2 font-bold text-base" onClick={handleSave}>
          Save Lead 🚀
        </Button>
        <button
          onClick={onBack}
          className="text-center text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          ← Back to recording
        </button>
      </div>
    </>
  );
};

export default LeadForm;
