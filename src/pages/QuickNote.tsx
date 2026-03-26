import { useState } from "react";
import { motion } from "framer-motion";
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

const categories = [
  "Opportunity",
  "Warm Lead",
  "Speaking Engagement",
  "Partnership",
  "Collaboration",
  "Other",
];

const QuickNote = () => {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please add a name!");
      return;
    }
    toast.success(`${name} added! You won't forget. 🎉`);
    setName("");
    setCompany("");
    setCategory("");
    setNotes("");
  };

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold text-foreground mb-1">
          Add a Quick Note ✏️
        </h1>
        <p className="text-muted-foreground font-medium mb-6">
          Capture it before it slips away.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">Name</label>
          <Input
            placeholder="Who did you meet?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-card"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">Company</label>
          <Input
            placeholder="Where are they from?"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-card"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card">
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
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">Notes</label>
          <Textarea
            placeholder="Anything you want to remember..."
            value={notes}
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
