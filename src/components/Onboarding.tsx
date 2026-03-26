import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  "Warm Lead",
  "Cold Lead",
  "Opportunity",
  "Speaking Engagement",
  "Mentorship",
  "Partnership",
  "Other",
];

interface OnboardingProps {
  onComplete: () => void;
}

interface LeadFormData {
  name: string;
  company: string;
  category: string;
  notes: string;
}

const WelcomeHero = () => {
  const nodePositions = [
    { cx: 120, cy: 40, delay: 0.4 },
    { cx: 200, cy: 80, delay: 0.6 },
    { cx: 60, cy: 100, delay: 0.8 },
    { cx: 180, cy: 160, delay: 1.0 },
  ];

  return (
    <div className="flex justify-center mb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-[240px] h-[200px]"
      >
        {/* Glow backdrop */}
        <motion.div
          className="absolute inset-0 rounded-full bg-accent opacity-60 blur-3xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1.2 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ top: "20%", left: "15%", width: "70%", height: "60%" }}
        />

        <svg viewBox="0 0 240 200" className="w-full h-full relative z-10">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(211 100% 40%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(211 100% 40%)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connecting lines from center to nodes */}
          {nodePositions.map((node, i) => (
            <motion.line
              key={`line-${i}`}
              x1="120" y1="100"
              x2={node.cx} y2={node.cy}
              stroke="hsl(211 100% 40%)"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: node.delay, ease: "easeOut" }}
            />
          ))}

          {/* Center glow circle */}
          <motion.circle
            cx="120" cy="100" r="32"
            fill="url(#centerGlow)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          />

          {/* Center icon - crosshair/target */}
          <motion.circle
            cx="120" cy="100" r="18"
            fill="none"
            stroke="hsl(211 100% 40%)"
            strokeWidth="2.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 180, delay: 0.15 }}
          />
          <motion.circle
            cx="120" cy="100" r="6"
            fill="hsl(211 100% 40%)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 250, delay: 0.3 }}
          />

          {/* Outer ring pulse */}
          <motion.circle
            cx="120" cy="100" r="28"
            fill="none"
            stroke="hsl(211 100% 40%)"
            strokeWidth="1"
            strokeOpacity="0.15"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          />

          {/* Orbiting nodes */}
          {nodePositions.map((node, i) => (
            <motion.circle
              key={`node-${i}`}
              cx={node.cx} cy={node.cy} r="7"
              fill="hsl(213 94% 95%)"
              stroke="hsl(211 100% 40%)"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200, delay: node.delay + 0.2 }}
            />
          ))}

          {/* Small decorative dots */}
          {[
            { cx: 45, cy: 55, delay: 1.1 },
            { cx: 195, cy: 140, delay: 1.3 },
            { cx: 85, cy: 165, delay: 1.2 },
          ].map((dot, i) => (
            <motion.circle
              key={`dot-${i}`}
              cx={dot.cx} cy={dot.cy} r="3"
              fill="hsl(211 100% 40%)"
              fillOpacity="0.3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: dot.delay }}
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
};

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { addLead } = useLeads();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [leadData, setLeadData] = useState<LeadFormData>({
    name: "",
    company: "",
    category: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});
  const [skippedLead, setSkippedLead] = useState(false);

  const finishOnboarding = (didAddLead: boolean) => {
    if (userName.trim()) {
      localStorage.setItem("userName", userName.trim());
    }
    localStorage.setItem("hasCompletedOnboarding", "true");

    if (didAddLead) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      addLead({
        name: leadData.name.trim().slice(0, 100),
        company: leadData.company.trim().slice(0, 100),
        category: leadData.category,
        notes: leadData.notes.trim().slice(0, 500),
        dueDate,
        createdAt: new Date(),
      });
    }

    onComplete();
  };

  const validateLead = () => {
    const newErrors: { name?: string; category?: string } = {};
    if (!leadData.name.trim()) newErrors.name = "Give this person a name";
    if (!leadData.category) newErrors.category = "Pick a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLead = () => {
    if (!validateLead()) return;
    setSkippedLead(false);
    setStep(3);
  };

  const handleSkipLead = () => {
    setSkippedLead(true);
    finishOnboarding(false);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[500px]">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 0 && (
            <motion.div
              key="step-0"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="p-8"
            >
              <h1 className="text-[24px] font-bold text-foreground mb-4">
                Follow Through App
              </h1>
              <p className="text-[16px] font-medium text-muted-foreground mb-4">
                Your Lead Management System
              </p>
              <p className="text-[14px] text-secondary-foreground leading-relaxed mb-8">
                Capture opportunities from every conversation.
                Stay on top of follow-ups. Track what converts.
                Never let a lead slip away again.
              </p>
              <Button
                size="lg"
                className="w-full font-semibold text-[14px]"
                onClick={() => setStep(1)}
              >
                Let's Get Started
              </Button>
            </motion.div>
          )}

          {/* Step 2: Name */}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="p-8"
            >
              <h1 className="text-[24px] font-bold text-foreground mb-4">
                What would you like to be called?
              </h1>
              <p className="text-[14px] text-secondary-foreground mb-6">
                We'll use this to personalize your experience.
              </p>
              <div className="mb-2">
                <Input
                  placeholder="Your name or preferred name"
                  value={userName}
                  maxLength={50}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-card text-[14px] h-12"
                />
                <p className="text-[12px] text-muted-foreground mt-2">
                  (Optional, but we'd love to know)
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-8">
                <Button
                  size="lg"
                  className="w-full font-semibold text-[14px]"
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
                <button
                  onClick={() => {
                    setUserName("");
                    setStep(2);
                  }}
                  className="text-[14px] font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Add First Lead */}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="p-8"
            >
              <h1 className="text-[24px] font-bold text-foreground mb-4">
                Let's add your first lead
              </h1>
              <p className="text-[14px] text-secondary-foreground mb-6">
                Who did you meet recently? Or what opportunity are you tracking?
              </p>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Who is this?"
                    value={leadData.name}
                    maxLength={100}
                    onChange={(e) => {
                      setLeadData((prev) => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`bg-card text-[14px] h-12 ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-[12px] text-destructive mt-1.5 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Company
                  </label>
                  <Input
                    placeholder="Where are they from?"
                    value={leadData.company}
                    maxLength={100}
                    onChange={(e) => setLeadData((prev) => ({ ...prev, company: e.target.value }))}
                    className="bg-card text-[14px] h-12"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={leadData.category}
                    onValueChange={(v) => {
                      setLeadData((prev) => ({ ...prev, category: v }));
                      if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                  >
                    <SelectTrigger className={`bg-card text-[14px] h-12 ${errors.category ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="What kind of lead is this?" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-[12px] text-destructive mt-1.5 font-medium">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Anything you want to remember about them?"
                    value={leadData.notes}
                    maxLength={500}
                    onChange={(e) => setLeadData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="bg-card min-h-[100px] text-[14px]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <Button
                  size="lg"
                  className="w-full font-semibold text-[14px]"
                  onClick={handleAddLead}
                >
                  Add Lead
                </Button>
                <button
                  onClick={handleSkipLead}
                  className="text-[14px] font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 3 && (
            <motion.div
              key="step-3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="p-8"
            >
              <h1 className="text-[24px] font-bold text-foreground mb-4">
                You're all set!
              </h1>
              <p className="text-[14px] text-secondary-foreground mb-6">
                {userName.trim()
                  ? `${userName.trim()}, your first lead is saved.`
                  : "Your first lead is saved."}
              </p>

              {/* Lead preview card */}
              <div className="p-5 bg-card rounded-xl border border-border shadow-card mb-8">
                <p className="text-[15px] font-semibold text-foreground">{leadData.name}</p>
                {leadData.company && (
                  <p className="text-[13px] text-muted-foreground mt-1">{leadData.company}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[11px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    {leadData.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Follow up in 3 days
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full font-semibold text-[14px]"
                onClick={() => finishOnboarding(true)}
              >
                Go to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
