import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, RotateCcw, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLeads } from "@/context/LeadsContext";
import LeadForm from "@/components/voice/LeadForm";

const MAX_SECONDS = 60;
const WARN_SECONDS = 50;

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

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
      timerRef.current = setInterval(() => {
        setElapsed((s) => {
          const next = s + 1;
          if (next >= MAX_SECONDS) {
            if (timerRef.current) clearInterval(timerRef.current);
            mediaRecorder.stop();
          }
          return next;
        });
      }, 1000);
    } catch {
      toast.error("Couldn't access your microphone. Check your browser permissions! 🎙️");
    }
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
  }, [audioUrl]);

  const remaining = MAX_SECONDS - elapsed;
  const isWarning = elapsed >= WARN_SECONDS && elapsed < MAX_SECONDS;
  const isMaxed = elapsed >= MAX_SECONDS;

  const timerColor = isMaxed
    ? "text-destructive"
    : isWarning
    ? "text-yellow-500"
    : "text-foreground";

  const timerMessage = isMaxed
    ? "Time's up! That's perfect. 🎯"
    : isWarning
    ? "Almost there, wrap it up! ⏳"
    : elapsed < 10
    ? "You're doing great, keep going..."
    : elapsed < 30
    ? "Nice! Take your time."
    : "Awesome detail! 💪";

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto flex flex-col items-center">
      <div className="w-full flex justify-end -mt-1 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X size={22} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE & RECORDING */}
        {(phase === "idle" || phase === "recording") && (
          <motion.div
            key="record-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full"
          >
            <div className="text-center mb-6 mt-2">
              <h1 className="text-2xl font-extrabold text-foreground">
                Add a Voice Note 🎙️
              </h1>
              <p className="text-muted-foreground mt-1 font-medium text-sm">
                Just talk. We'll remember.
              </p>
            </div>

            {/* Guide text — idle only */}
            {phase === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-card border border-border rounded-xl p-4 mb-8 text-center"
              >
                <p className="text-sm font-bold text-foreground mb-2">
                  You've got 60 seconds. Make it count! 🚀
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Include: Who you met, what they do, why they matter, and when to follow up.
                </p>
                <p className="text-xs text-muted-foreground/70 italic">
                  Example: "Met Sarah from TechCrunch about sponsorship. Wants to chat next week."
                </p>
              </motion.div>
            )}

            {/* Timer — recording only */}
            <AnimatePresence>
              {phase === "recording" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center mb-6"
                >
                  <p className={`text-4xl font-extrabold tracking-wider font-mono ${timerColor}`}>
                    {formatTime(elapsed)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    {formatTime(remaining)} remaining
                  </p>
                  <p className={`text-xs mt-2 font-medium ${isMaxed ? "text-destructive" : isWarning ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {timerMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Record / Stop button */}
            <div className="relative flex items-center justify-center mb-6">
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

            <p className="text-muted-foreground font-bold text-sm">
              {phase === "idle" ? "Tap to Start Recording" : "🔴 Recording... Tap to Stop"}
            </p>
          </motion.div>
        )}

        {/* REVIEW */}
        {phase === "review" && (
          <motion.div
            key="review-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="text-center mb-6 mt-2">
              <h1 className="text-2xl font-extrabold text-foreground">
                {isMaxed ? "Time's up! That's perfect. 🎯" : "Nice capture! 🎧"}
              </h1>
              <p className="text-muted-foreground mt-1 font-medium text-sm">
                {formatTime(elapsed)} recorded
              </p>
            </div>

            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Playback */}
            <div className="flex items-center justify-center gap-4 mb-6 p-5 bg-card rounded-xl border border-border">
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
                title="Re-record"
              >
                <Mic size={18} />
              </motion.button>
            </div>

            {/* Transcript placeholder */}
            <div className="mb-4">
              <label className="text-sm font-bold text-foreground mb-1.5 block">
                What happened?
              </label>
              <div className="bg-card border border-border rounded-xl p-4 mb-1">
                <p className="text-xs text-muted-foreground italic">
                  Transcript coming soon — for now, jot down the key points below! ✍️
                </p>
              </div>
            </div>

            {/* Context note */}
            <div className="mb-5">
              <label className="text-sm font-bold text-foreground mb-1.5 block">
                Quick notes (optional)
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
              className="w-full font-bold text-base gap-2"
              onClick={() => setPhase("form")}
            >
              Continue to Form <ArrowRight size={18} />
            </Button>

            <button
              onClick={resetAll}
              className="w-full text-center mt-3 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              🔄 Re-record
            </button>
          </motion.div>
        )}

        {/* FORM */}
        {phase === "form" && (
          <motion.div
            key="form-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <LeadForm
              audioUrl={audioUrl}
              context={context}
              onBack={() => setPhase("review")}
              onSave={(data) => {
                const today = new Date();
                const dueDate = new Date(today);
                dueDate.setDate(dueDate.getDate() + 3);
                addLead({
                  name: data.name,
                  company: data.company,
                  category: data.category,
                  notes: data.context,
                  dueDate,
                  createdAt: today,
                  audioUrl: audioUrl || undefined,
                });
                toast.success("Got it! We'll remind you about them. 🎉");
                navigate("/");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCapture;
