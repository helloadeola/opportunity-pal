import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeads } from "@/context/LeadsContext";
import FollowUpPicker from "@/components/voice/FollowUpPicker";

const categories = [
  { value: "Opportunity", emoji: "💡" },
  { value: "Warm Lead", emoji: "🔥" },
  { value: "Speaking Engagement", emoji: "🎤" },
  { value: "Partnership", emoji: "🤝" },
  { value: "Collaboration", emoji: "📊" },
  { value: "Other", emoji: "🔗" },
];

const QuickNote = () => {
  const navigate = useNavigate();
  const { addLead } = useLeads();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 3);
  const [dueDate, setDueDate] = useState<Date>(defaultDue);

  const validate = () => {
    const newErrors: { name?: string; category?: string } = {};
    if (!name.trim()) newErrors.name = "Give this person a name";
    if (!category) newErrors.category = "Pick a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    addLead({
      name: name.trim().slice(0, 100),
      company: company.trim().slice(0, 100),
      category,
      notes: notes.trim().slice(0, 500),
      dueDate,
      createdAt: new Date(),
    });

    toast.success(`Saved! We'll remind you about ${name.trim()}.`);
    navigate("/");
  };

  return (
    <div className="safe-bottom px-4 py-6 max-w-[480px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="text-[22px] font-bold text-foreground leading-tight">
            📝 Quick Note
          </h1>
          <p className="text-muted-foreground text-[13px] mt-1">
            Capture it before it slips away.
          </p>
        </motion.div>
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 -mt-1 rounded-lg hover:bg-accent transition-colors duration-200 text-muted-foreground"
        >
          <X size={18} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col gap-5"
      >
        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Who did you meet?"
            value={name}
            maxLength={100}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className={`bg-card text-[14px] ${errors.name ? "border-destructive" : ""}`}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[12px] text-destructive mt-1.5 font-medium"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Company</label>
          <Input
            placeholder="Where are they from?"
            value={company}
            maxLength={100}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-card text-[14px]"
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Category <span className="text-destructive">*</span>
          </label>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
            }}
          >
            <SelectTrigger className={`bg-card text-[14px] ${errors.category ? "border-destructive" : ""}`}>
              <SelectValue placeholder="What kind of lead?" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AnimatePresence>
            {errors.category && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[12px] text-destructive mt-1.5 font-medium"
              >
                {errors.category}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</label>
          <Textarea
            placeholder="Anything you want to remember..."
            value={notes}
            maxLength={500}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-card min-h-[100px] text-[14px]"
          />
        </div>

        <FollowUpPicker value={dueDate} onChange={setDueDate} />

        <Button onClick={handleSave} size="lg" className="mt-1 font-semibold text-[14px]">
          Save Lead →
        </Button>
      </motion.div>
    </div>
  );
};

export default QuickNote;