import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const CurtainContext = createContext(null);

export function CurtainProvider({ children }) {
  const navigate = useNavigate();
  const [curtain, setCurtain] = useState(null); // { color, direction }

  /**
   * Jalankan transisi tirai lalu eksekusi aksi (pindah URL atau ganti state)
   * @param {string | Function} targetOrCallback - Path URL (misal "/populer") atau fungsi callback
   * @param {Object} options - { color: "#10b981", direction: "right" | "left" }
   */
  const triggerCurtain = (
    targetOrCallback,
    { color = "#10b981", direction = "right" } = {}
  ) => {
    if (curtain) return; // Cegah klik ganda saat animasi berjalan

    setCurtain({ color, direction });

    // Di pertengahan animasi (saat tirai menutup penuh), pindah halaman/state
    setTimeout(() => {
      if (typeof targetOrCallback === "string") {
        navigate(targetOrCallback);
      } else if (typeof targetOrCallback === "function") {
        targetOrCallback();
      }
    }, 320);

    // Selesai membuka tirai
    setTimeout(() => {
      setCurtain(null);
    }, 700);
  };

  return (
    <CurtainContext.Provider value={{ triggerCurtain, isTransitioning: Boolean(curtain) }}>
      {children}

      {/* Overlay Tirai Clip-Wipe */}
      <AnimatePresence>
        {curtain && (
          <motion.div
            key="curtain-wipe"
            initial={{
              clipPath:
                curtain.direction === "right"
                  ? "ellipse(0% 140% at 0% 50%)"
                  : "ellipse(0% 140% at 100% 50%)",
            }}
            animate={{
              clipPath: [
                curtain.direction === "right"
                  ? "ellipse(0% 140% at 0% 50%)"
                  : "ellipse(0% 140% at 100% 50%)",
                "ellipse(150% 150% at 50% 50%)",
                curtain.direction === "right"
                  ? "ellipse(0% 140% at 100% 50%)"
                  : "ellipse(0% 140% at 0% 50%)",
              ],
            }}
            transition={{
              duration: 0.68,
              times: [0, 0.48, 1],
              ease: [0.76, 0, 0.24, 1],
            }}
            style={{ backgroundColor: curtain.color }}
            className="pointer-events-none fixed inset-0 z-[9999]"
          />
        )}
      </AnimatePresence>
    </CurtainContext.Provider>
  );
}

export function useCurtain() {
  return useContext(CurtainContext);
}