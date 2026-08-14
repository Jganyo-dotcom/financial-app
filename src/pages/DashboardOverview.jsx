import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Package,
  Zap,
} from "lucide-react";

export default function DashboardOverview() {
  // Animated number counters on initial mount
  const animatedRevenue = useCountUp(28450, 1500);
  const animatedProfit = useCountUp(8920, 1500);
  const animatedStock = useCountUp(1240, 1200);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-page)",
        color: "var(--text-main)",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "1.5rem",
        minHeight: "100vh",
        transition: "background-color 0.25s ease, color 0.25s ease",
        fontFamily: "sans-serif",
      }}
    >
      {/* Keyframe Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(6deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(10px) rotate(-6deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.2), inset 0 0 15px rgba(99, 102, 241, 0.1); }
          50% { box-shadow: 0 0 35px rgba(99, 102, 241, 0.4), inset 0 0 25px rgba(99, 102, 241, 0.2); }
        }
      `}</style>

      {/* 1. HERO BANNER WITH THEME ADAPTIVE GRADIENT */}
      <div
        style={{
          position: "relative",
          background: "var(--hero-bg)",
          border: "1px solid var(--hero-border)",
          borderRadius: "1.25rem",
          padding: "2rem",
          marginBottom: "2rem",
          overflow: "hidden",
          animation: "pulseGlow 4s infinite ease-in-out",
        }}
      >
        {/* Floating Money Graphics */}
        <div
          style={{
            position: "absolute",
            top: "15px",
            right: "80px",
            fontSize: "2.5rem",
            animation: "float 3.5s infinite ease-in-out",
            opacity: 0.8,
            pointerEvents: "none",
          }}
        >
          💸
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "200px",
            fontSize: "2rem",
            animation: "floatReverse 4s infinite ease-in-out",
            opacity: 0.7,
            pointerEvents: "none",
          }}
        >
          💰
        </div>
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "20px",
            fontSize: "1.5rem",
            animation: "float 2.8s infinite ease-in-out",
            opacity: 0.9,
            pointerEvents: "none",
          }}
        >
          ✨
        </div>

        {/* Banner Content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "650px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              padding: "0.25rem 0.75rem",
              borderRadius: "2rem",
              fontSize: "0.8125rem",
              color: "#ffffff",
              fontWeight: "700",
              marginBottom: "0.75rem",
              backdropFilter: "blur(4px)",
            }}
          >
            <Zap size={14} color="#ffffff" /> SYSTEM ACTIVE • DUMMY PREVIEW DATA
          </div>

          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "900",
              color: "var(--hero-text)",
              margin: "0 0 0.5rem 0",
              letterSpacing: "-0.02em",
            }}
          >
            Financial Hub 🚀
          </h1>
          <p
            style={{
              color: "var(--hero-subtext)",
              fontSize: "0.95rem",
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            Real-time tracking system configured and ready. Watch live profit
            calculation, automated inventory alerts, and cash flow streams in
            action below.
          </p>
        </div>
      </div>

      {/* 2. STAT CARDS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Total Revenue */}
        <AnimatedStatCard
          title="Total Revenue"
          value={`GHC ${animatedRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign color="var(--accent-blue)" size={24} />}
          color="rgba(99, 102, 241, 0.12)"
          borderColor="var(--border-color)"
        />

        {/* Calculated Net Profit */}
        <AnimatedStatCard
          title="Calculated Net Profit"
          value={`GHC ${animatedProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp color="#10b981" size={24} />}
          color="rgba(16, 185, 129, 0.12)"
          borderColor="var(--border-color)"
          valueColor="#10b981"
        />

        {/* Total Items Stocked */}
        <AnimatedStatCard
          title="Total Items Stocked"
          value={`${animatedStock.toLocaleString()} Units`}
          icon={<Package color="#3b82f6" size={24} />}
          color="rgba(59, 130, 246, 0.12)"
          borderColor="var(--border-color)"
        />

        {/* Low Stock Warning */}
        <AnimatedStatCard
          title="Low Stock Warning"
          value="2 Items"
          icon={<AlertTriangle color="#f59e0b" size={24} />}
          color="rgba(245, 158, 11, 0.12)"
          borderColor="rgba(245, 158, 11, 0.4)"
          badge="Attention Needed"
        />
      </div>
    </div>
  );
}

// Reusable StatCard powered by CSS Tokens
function AnimatedStatCard({
  title,
  value,
  icon,
  color,
  borderColor,
  badge,
  valueColor,
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${borderColor || "var(--border-color)"}`,
        borderRadius: "1rem",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        boxShadow: "var(--card-shadow)",
        transition: "all 0.25s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            backgroundColor: color,
            padding: "0.75rem",
            borderRadius: "0.75rem",
            display: "flex",
          }}
        >
          {icon}
        </div>
        {badge && (
          <span
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              color: "#f59e0b",
              fontSize: "0.6875rem",
              fontWeight: "700",
              padding: "0.2rem 0.5rem",
              borderRadius: "0.375rem",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            fontWeight: "600",
            margin: 0,
          }}
        >
          {title}
        </p>
        <h3
          style={{
            fontSize: "1.625rem",
            fontWeight: "900",
            color: valueColor || "var(--text-main)",
            margin: "0.25rem 0 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

// Smooth count-up hook
function useCountUp(targetNumber, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = targetNumber;
    const totalFrames = Math.min(60, Math.floor(duration / 16));
    const increment = end / totalFrames;
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      start += increment;
      if (currentFrame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetNumber, duration]);

  return count;
}
