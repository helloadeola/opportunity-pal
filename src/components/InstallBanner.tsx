import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone || localStorage.getItem("installBannerDismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator as any).standalone;
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("installBannerDismissed", "true");
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-[calc(var(--nav-height)+8px)] left-3 right-3 z-50 max-w-[480px] mx-auto"
        >
          <div className="bg-card border border-border rounded-xl shadow-modal p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {isIOS ? (
                <Share size={20} className="text-primary" />
              ) : (
                <Download size={20} className="text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-tight">
                Install Follow Through
              </p>
              {isIOS ? (
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                  Tap <Share size={12} className="inline -mt-0.5 text-primary" /> then <span className="font-medium text-foreground">"Add to Home Screen"</span>
                </p>
              ) : (
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                  Add to your home screen for the full experience
                </p>
              )}

              {!isIOS && deferredPrompt && (
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="mt-2 h-8 text-[12px] font-semibold px-4"
                >
                  Install App
                </Button>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallBanner;
