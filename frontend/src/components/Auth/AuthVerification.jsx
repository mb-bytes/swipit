import { motion } from "motion/react";
import OrbNest from "./OrbNest";

export function AuthVerification() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f2eee5] paper-grain select-none overflow-hidden">
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(17,18,21,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 300, height: 300, position: "relative", zIndex: 1 }}
      >
        <OrbNest
          width={300}
          height={300}
          speed={42}
          density={240}
          dotSize={140}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 flex flex-col items-center gap-3 text-center"
        style={{ position: "relative", zIndex: 1 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-[#111215]">
          One moment, please.
        </h1>
        <p className="text-base text-neutral-500 max-w-xs leading-relaxed">
          Checking if your session is still alive&hellip;
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="mt-10 flex items-center gap-2"
        style={{ position: "relative", zIndex: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
            style={{
              display: "block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#111215",
              opacity: 0.25,
            }}
          />
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute bottom-8 text-xs text-neutral-400 tracking-widest uppercase font-medium"
      >
        SwipIt
      </motion.p>
    </div>
  );
}

export default AuthVerification;
