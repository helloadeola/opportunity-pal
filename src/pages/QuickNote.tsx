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

const categories = [
  "Opportunity",
  "Warm Lead",
  "Speaking Engagement",
  "Partnership",
  "Collaboration",
  "Other",
];

const QuickNote = () => {
  const navigate = useNavigate();
  const { addLead } = useLeads();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; category?: string } = {};
    if (!name.trim()) newErrors.name = "Hey, let's give this person a name! 😊";
    if (!category) newErrors.category = "What category fits best? Pick one! ✨";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 3);

    addLead({
      name: name.trim().slice(0, 100),
      company: company.trim().slice(0, 100),
      category,
      notes: notes.trim().slice(0, 500),
      dueDate,
      status: "upcoming",
      createdAt: today,
    });

    toast.success(`${name.trim()} added! You won't forget. 🎉`);
    navigate("/");
  };

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto">
      <div className="flex items-start justify-between mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            Add a Quick Note ✏️
          </h1>
          <p className="text-muted-foreground font-medium">
            Capture it before it slips away.
          </p>
        </motion.div>
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 -mt-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X size={22} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 mt-6"
      >
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">
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
            className={`bg-card ${errors.name ? "border-destructive" : ""}`}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
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
              if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
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
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-destructive mt-1.5 font-medium"
              >
                {errors.category}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">Notes</label>
          <Textarea
            placeholder="Anything you want to remember..."
            value={notes}
            maxLength={500}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-card min-h-[100px]"
          />
        </div>

        <Button onClick={handleSave} size="lg" className="mt-2 font-bold text-base">
          Save Lead 🚀
        </Button>
      </motion.div>
    </div>
  );
};

export default QuickNote;
