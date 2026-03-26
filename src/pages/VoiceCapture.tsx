import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square } from "lucide-react";

const VoiceCapture = () => {
  const [recording, setRecording] = useState(false);

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 mt-8"
      >
        <h1 className="text-2xl font-extrabold text-foreground">
          Add a Voice Note 🎙️
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Just talk. We'll remember.
        </p>
      </motion.div>

      <div className="relative flex items-center justify-center mb-10">
        <AnimatePresence>
          {recording && (
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
          onClick={() => setRecording(!recording)}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            recording
              ? "bg-destructive"
              : "bg-primary"
          }`}
        >
          {recording ? (
            <Square size={36} className="text-destructive-foreground" />
          ) : (
            <Mic size={40} className="text-primary-foreground" />
          )}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {recording ? (
          <motion.p
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-destructive font-bold text-sm"
          >
            🔴 Recording... Tap to stop
          </motion.p>
        ) : (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-muted-foreground font-medium text-sm"
          >
            Tap the mic to start recording
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCapture;
