import { Home, PlusCircle, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/add", icon: PlusCircle, label: "Add Lead" },
  { path: "/leads", icon: List, label: "All Leads" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="mx-auto max-w-[480px] flex items-center justify-around h-[var(--nav-height)] px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200"
              style={{ minWidth: 64 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-accent rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`relative z-10 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`relative z-10 text-[11px] font-semibold transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;