import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, PenLine, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: CalendarCheck,
    title: "Today's Follow-Ups",
    description: "Your most urgent leads show up here. Overdue and due-today items appear first so you never miss a beat.",
  },
  {
    icon: PenLine,
    title: "Quick Capture",
    description: "Tap Add Lead to capture someone new in seconds — from an event, a call, or a conversation.",
  },
  {
    icon: List,
    title: "All Leads",
    description: "See everything in one place. Filter, search, and track what actually converts.",
  },
];

const AppTour = () => {
  const [visible, setVisible] = useState(
    () => localStorage.getItem("hasSeenAppTour") !== "true"
  );
  const [step, setStep] = useState(0);

  const dismiss = () => {
    localStorage.setItem("hasSeenAppTour", "true");
    setVisible(false);
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={dismiss}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -8 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[360px] bg-card rounded-xl border border-border shadow-modal p-6"
        >
          <div className="flex justify-end mb-2">
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors duration-200 text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon size={24} className="text-primary" />
            </div>
            <h3 className="text-[18px] font-bold text-foreground mb-2">{current.title}</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
              {current.description}
            </p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                  i === step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 text-[13px]" onClick={dismiss}>
              Skip
            </Button>
            <Button
              size="sm"
              className="flex-1 text-[13px] font-semibold"
              onClick={() => (isLast ? dismiss() : setStep(step + 1))}
            >
              {isLast ? "Got It" : "Next"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppTour;
