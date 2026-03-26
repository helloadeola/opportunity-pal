import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, RotateCcw, X } from "lucide-react";
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

type Phase = "idle" | "recording" | "review" | "form";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const VoiceCapture = () => {
  const navigate = useNavigate();
  const { addLead } = useLeads();

  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [context, setContext] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        setPhase("review");
      };

      mediaRecorder.start();
      setElapsed(0);
      setPhase("recording");
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      toast.error("Couldn't access your microphone. Check your browser permissions! 🎙️");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const restartPlayback = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  }, []);

  const resetAll = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setPhase("idle");
    setElapsed(0);
    setIsPlaying(false);
    setContext("");
    setName("");
    setCompany("");
    setCategory("");
    setErrors({});
  }, [audioUrl]);

  const handleSaveLead = () => {
    const newErrors: { name?: string; category?: string } = {};
    if (!name.trim()) newErrors.name = "Who is this about? Give them a name! 😊";
    if (!category) newErrors.category = "Pick a category so we can organize! ✨";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 3);

    addLead({
      name: name.trim().slice(0, 100),
      company: company.trim().slice(0, 100),
      category,
      notes: context.trim().slice(0, 500),
      dueDate,
      createdAt: today,
      audioUrl: audioUrl || undefined,
    });

    toast.success("Got it! We'll remind you about them. 🎉");
    navigate("/");
  };

  // Friendly timer encouragement
  const timerMessage =
    elapsed < 10
      ? "You're doing great, keep going..."
      : elapsed < 30
      ? "Nice! Take your time."
      : elapsed < 60
      ? "Awesome detail! 💪"
      : "Wow, thorough! Wrap up when ready.";

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto flex flex-col items-center">
      {/* Close button */}
      <div className="w-full flex justify-end -mt-1 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X size={22} />
        </button>
      </div>

      {/* IDLE & RECORDING phases */}
      <AnimatePresence mode="wait">
        {(phase === "idle" || phase === "recording") && (
          <motion.div
            key="record-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full"
          >
            <div className="text-center mb-10 mt-4">
              <h1 className="text-2xl font-extrabold text-foreground">
                Add a Voice Note 🎙️
              </h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Just talk. We'll remember.
              </p>
            </div>

            {/* Timer */}
            <AnimatePresence>
              {phase === "recording" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center mb-6"
                >
                  <p className="text-4xl font-extrabold text-foreground tracking-wider font-mono">
                    {formatTime(elapsed)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">
                    {timerMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Record / Stop button */}
            <div className="relative flex items-center justify-center mb-8">
              <AnimatePresence>
                {phase === "recording" && (
                  <>
                    <motion.div
                      key="ring1"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute w-32 h-32 rounded-full bg-destructive/30"
                    />
                    <motion.div
                      key="ring2"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                      className="absolute w-32 h-32 rounded-full bg-destructive/20"
                    />
                  </>
                )}
              </AnimatePresence>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={phase === "idle" ? startRecording : stopRecording}
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  phase === "recording" ? "bg-destructive" : "bg-primary"
                }`}
              >
                {phase === "recording" ? (
                  <Square size={36} className="text-destructive-foreground" />
                ) : (
                  <Mic size={40} className="text-primary-foreground" />
                )}
              </motion.button>
            </div>

            <p className="text-muted-foreground font-medium text-sm">
              {phase === "idle"
                ? "Tap the mic to start recording"
                : "🔴 Recording... Tap to stop"}
            </p>
          </motion.div>
        )}

        {/* REVIEW phase */}
        {phase === "review" && (
          <motion.div
            key="review-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="text-center mb-6 mt-4">
              <h1 className="text-2xl font-extrabold text-foreground">
                Nice! Here's your note 🎧
              </h1>
              <p className="text-muted-foreground mt-1 font-medium text-sm">
                {formatTime(elapsed)} recorded
              </p>
            </div>

            {/* Audio element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-4 mb-8 p-5 bg-card rounded-xl border border-border">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={restartPlayback}
                className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw size={18} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayback}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md"
              >
                {isPlaying ? (
                  <Pause size={28} className="text-primary-foreground" />
                ) : (
                  <Play size={28} className="text-primary-foreground ml-1" />
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={resetAll}
                className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mic size={18} />
              </motion.button>
            </div>

            {/* Context note */}
            <div className="mb-4">
              <label className="text-sm font-bold text-foreground mb-1.5 block">
                What's this about? (optional)
              </label>
              <Textarea
                placeholder="e.g. Met at the conference, wants to collaborate..."
                value={context}
                maxLength={500}
                onChange={(e) => setContext(e.target.value)}
                className="bg-card min-h-[80px]"
              />
            </div>

            <Button
              size="lg"
              className="w-full font-bold text-base"
              onClick={() => setPhase("form")}
            >
              Save as Lead 🚀
            </Button>

            <button
              onClick={resetAll}
              className="w-full text-center mt-3 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Record again
            </button>
          </motion.div>
        )}

        {/* FORM phase */}
        {phase === "form" && (
          <motion.div
            key="form-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="mb-6 mt-4">
              <h1 className="text-2xl font-extrabold text-foreground">
                Almost there! 🙌
              </h1>
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

              <Button size="lg" className="mt-2 font-bold text-base" onClick={handleSaveLead}>
                Save Lead 🚀
              </Button>
              <button
                onClick={() => setPhase("review")}
                className="text-center text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                ← Back to recording
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCapture;
