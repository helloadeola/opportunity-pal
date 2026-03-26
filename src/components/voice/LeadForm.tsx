import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  context: string;
  onBack: () => void;
  onSave: (data: { name: string; company: string; category: string; context: string }) => void;
}

const LeadForm = ({ context, onBack, onSave }: LeadFormProps) => {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

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
      context: context.trim().slice(0, 500),
    });
  };

  return (
    <>
      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-extrabold text-foreground">Almost there! 🙌</h1>
        <p className="text-muted-foreground mt-1 font-medium text-sm">
          Just a few quick details about this lead.
        </p>
      </div>

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
