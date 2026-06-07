"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Cards from "../cards";


interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  active: boolean;
}

const STAR_COLORS = [
  "#ffffff",
  "#ffe4f0",
  "#e0d4ff",
  "#d4f0ff",
  "#fff5d4",
  "#ffd4f5",
  "#d4ffe0",
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [entered, setEntered] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showOnlyPhotos, setShowOnlyPhotos] = useState(false);

  const NUM_CANDLES = 6;
  const [litCandles, setLitCandles] = useState<boolean[]>(
    Array(NUM_CANDLES).fill(true)
  );
  const [allBlown, setAllBlown] = useState(false);
  const [blowingIdx, setBlowingIdx] = useState<number | null>(null);
  

  const blowCandle = useCallback(
    (i: number) => {
      if (!litCandles[i]) return;
      setBlowingIdx(i);
      setTimeout(() => {
        setLitCandles((prev) => {
          const next = [...prev];
          next[i] = false;
          if (next.every((v) => !v)) {
            setAllBlown(true);
            setShowOnlyPhotos(true);
          }
          return next;
        });
        setBlowingIdx(null);
      }, 350);
    },
    [litCandles]
  );

  const resetCake = () => {
    setLitCandles(Array(NUM_CANDLES).fill(true));
    setAllBlown(false);
    setShowOnlyPhotos(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 3000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      }));

      shootingStarsRef.current = Array.from({ length: 5 }, () =>
        makeShootingStar(canvas.width, canvas.height)
      );
    };

    const makeShootingStar = (w: number, h: number): ShootingStar => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.5,
      length: Math.random() * 120 + 60,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
      speed: Math.random() * 8 + 4,
      opacity: 0,
      active: false,
    });

    const draw = (time: number) => {
      timeRef.current = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space background gradient
      const bg = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.4,
        0,
        canvas.width * 0.5,
        canvas.height * 0.4,
        canvas.width * 0.9
      );
      bg.addColorStop(0, "#0d0620");
      bg.addColorStop(0.5, "#060310");
      bg.addColorStop(1, "#020108");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nebula glow blobs
      const blobs = [
        { x: 0.2, y: 0.3, r: 0.25, color: "rgba(180,100,255,0.04)" },
        { x: 0.75, y: 0.2, r: 0.2, color: "rgba(100,180,255,0.04)" },
        { x: 0.5, y: 0.7, r: 0.3, color: "rgba(255,100,180,0.03)" },
        { x: 0.85, y: 0.65, r: 0.18, color: "rgba(100,255,200,0.03)" },
      ];
      blobs.forEach(({ x, y, r, color }) => {
        const g = ctx.createRadialGradient(
          x * canvas.width,
          y * canvas.height,
          0,
          x * canvas.width,
          y * canvas.height,
          r * canvas.width
        );
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw twinkling stars
      starsRef.current.forEach((star) => {
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.35 + 0.65;
        const alpha = star.opacity * twinkle;
        const size = star.size * (0.85 + twinkle * 0.15);

        ctx.save();
        ctx.globalAlpha = alpha;

        // Glow
        const glow = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          size * 3.5
        );
        glow.addColorStop(0, star.color);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();

        // 4-point sparkle for larger stars
        if (star.size > 1.4) {
          ctx.globalAlpha = alpha * 0.5;
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          const sp = size * 4;
          ctx.beginPath();
          ctx.moveTo(star.x - sp, star.y);
          ctx.lineTo(star.x + sp, star.y);
          ctx.moveTo(star.x, star.y - sp);
          ctx.lineTo(star.x, star.y + sp);
          ctx.stroke();
        }

        ctx.restore();

        // Drift upward slowly
        star.y -= star.speed * 0.1;
        if (star.y < -5) {
          star.y = canvas.height + 5;
          star.x = Math.random() * canvas.width;
        }
      });

      // Shooting stars
      shootingStarsRef.current.forEach((ss, i) => {
        if (!ss.active) {
          if (Math.random() < 0.003) {
            ss.active = true;
            ss.x = Math.random() * canvas.width * 0.8;
            ss.y = Math.random() * canvas.height * 0.4;
            ss.opacity = 1;
          }
          return;
        }

        ctx.save();
        ctx.globalAlpha = ss.opacity;
        const grad = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        ctx.stroke();
        ctx.restore();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0 || ss.x > canvas.width || ss.y > canvas.height) {
          shootingStarsRef.current[i] = makeShootingStar(
            canvas.width,
            canvas.height
          );
        }
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => setShowContent(true), 400);
  };


  return (
    <div className="relative w-full h-screen overflow-hidden font-display">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { text-shadow: 0 0 30px rgba(255,180,230,0.6), 0 0 60px rgba(200,130,255,0.3); }
          50% { text-shadow: 0 0 50px rgba(255,180,230,0.9), 0 0 100px rgba(200,130,255,0.5), 0 0 150px rgba(130,200,255,0.2); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(230,80,180,0.5), 0 0 60px rgba(160,80,255,0.3); }
          50% { box-shadow: 0 0 40px rgba(230,80,180,0.8), 0 0 100px rgba(160,80,255,0.5); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes celebrationIn {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes flicker {
          0%,100% { transform: scaleX(1) scaleY(1) translateX(0); opacity: 1; }
          20% { transform: scaleX(0.85) scaleY(1.1) translateX(-1px); opacity: 0.9; }
          40% { transform: scaleX(1.1) scaleY(0.9) translateX(1px); opacity: 1; }
          60% { transform: scaleX(0.9) scaleY(1.05) translateX(-1px); opacity: 0.95; }
          80% { transform: scaleX(1.05) scaleY(0.95) translateX(1px); opacity: 1; }
        }
        @keyframes smokeRise {
          0% { opacity: 0.7; transform: translateY(0) scaleX(1); }
          100% { opacity: 0; transform: translateY(-22px) scaleX(2.5); }
        }
        @keyframes blowOut {
          0% { opacity: 1; transform: scaleY(1); }
          60% { opacity: 0.4; transform: scaleY(1.6) scaleX(0.3) translateX(8px); }
          100% { opacity: 0; transform: scaleY(0); }
        }
        @keyframes wishAppear {
          0% { opacity: 0; transform: translateY(16px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }

        .landing-overlay {
          animation: ${entered ? "fadeOut 0.6s ease forwards" : "none"};
        }
        .name-top {
          animation: floatUp 0.9s ease forwards, pulseGlow 3s ease-in-out infinite 0.9s;
          opacity: 0;
          animation-delay: 0s, 0.9s;
        }
        .subtitle {
          animation: floatUp 0.9s 0.25s ease forwards;
          opacity: 0;
        }
        .hb-title {
          animation: floatUp 1s 0.5s ease forwards;
          opacity: 0;
        }
        .name-main {
          animation: floatUp 1s 0.8s ease forwards, shimmer 2.5s ease-in-out infinite 1.8s;
          opacity: 0;
        }
        .party-icon {
          animation: floatUp 1s 1s ease forwards;
          opacity: 0;
        }
        .enter-btn {
          animation: floatUp 1s 1.2s ease forwards, btnPulse 2s ease-in-out infinite 2.2s;
          opacity: 0;
        }
        .hint-text {
          animation: floatUp 1s 1.5s ease forwards;
          opacity: 0;
        }
        .celebration-content {
          animation: celebrationIn 0.8s ease forwards;
        }
      `}</style>

      {/* Star canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Landing screen */}
      {!entered && (
        <div
          className="landing-overlay absolute inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 10 }}
        >
          {/* Top name */}
          <p
            className="name-top text-5xl font-display font-bold mb-2"
            style={{
              color: "#ffb3d9",
              letterSpacing: "0.05em",
            }}
          >
            Alisha
          </p>

          {/* Subtitle */}
          <p
            className="subtitle font-body text-base mb-10"
            style={{
              color: "rgba(200,180,230,0.7)",
              fontWeight: 300,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontSize: "0.85rem",
            }}
          >
            A Special Day Awaits
          </p>

          {/* Decorative line */}
          <div
            style={{
              width: 60,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(200,150,255,0.5), transparent)",
              marginBottom: "2.5rem",
            }}
          />

          {/* Happy Birthday */}
          <h1
            className="hb-title text-center font-display font-black"
            style={{
              fontSize: "clamp(3rem, 10vw, 7rem)",
              lineHeight: 1.05,
              background:
                "linear-gradient(135deg, #ff9de2 0%, #c084fc 40%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.5rem",
              filter: "drop-shadow(0 0 30px rgba(192,132,252,0.4))",
            }}
          >
            Happy Birthday
          </h1>

          {/* Name with sparkles */}
          <div
            className="name-main flex items-center gap-3 mb-6"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3.2rem)" }}
          >
           
            {/* <span
              className="font-display font-bold"
              style={{
                color: "#fcd34d",
                textShadow:
                  "0 0 30px rgba(252,211,77,0.7), 0 0 60px rgba(252,211,77,0.3)",
                letterSpacing: "0.04em",
              }}
            >
              Alisha
            </span> */}
         
          </div>

          {/* Party emoji */}
          <div
            className="party-icon text-5xl mb-8"
            style={{ filter: "drop-shadow(0 0 10px rgba(255,200,100,0.5))" }}
          >
            
          </div>

          {/* Enter button */}
          <button
            className="enter-btn font-body font-medium"
            onClick={handleEnter}
            style={{
              background:
                "linear-gradient(135deg, #e040a0 0%, #9b4de8 100%)",
              border: "none",
              borderRadius: 50,
              padding: "1rem 3.5rem",
              fontSize: "1.1rem",
              color: "#fff",
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "transform 0.2s ease",
              marginBottom: "1rem",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.transform = "scale(1)")
            }
          >
            Enter
          </button>

          {/* Hint */}
          <p
            className="hint-text font-body"
            style={{
              color: "rgba(180,160,210,0.55)",
              fontSize: "0.8rem",
              fontStyle: "italic",
              letterSpacing: "0.05em",
            }}
          >
            Click to reveal something special...
          </p>
        </div>
      )}

      {/* Celebration / Cake screen */}
      {showContent && (
        <div
          className="celebration-content absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ zIndex: 10 }}
        >
          <p
            className="font-body"
            style={{
              color: "rgba(200,180,255,0.7)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontSize: "0.72rem",
              marginBottom: "0.25rem",
            }}
          >
   
          </p>

          <h2
            className="font-display font-black"
            style={{
              fontSize: "clamp(1.6rem, 5vw, 3.2rem)",
              background: "linear-gradient(135deg, #ff9de2, #c084fc, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.1,
              filter: "drop-shadow(0 0 20px rgba(192,132,252,0.4))",
            }}
          >
            Happy Birthday, Alisha !
          </h2>

          {!allBlown && !showOnlyPhotos && (
            <p
              className="font-body"
              style={{
                color: "rgba(200,180,255,0.6)",
                fontSize: "0.8rem",
                fontStyle: "italic",
                letterSpacing: "0.04em",
              }}
            >
              Click each candle to blow it out 🌬️
            </p>
          )}

          {showOnlyPhotos ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <Cards />

             <p className="font-bold  mt-2" style={{ color: "rgba(200,160,255,0.6)", letterSpacing: "0.04em" }}>
                 Hope you liked the surprise! 
             </p>
              <button
                className="font-body"
                onClick={resetCake}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(251,191,36,0.4)",
                  borderRadius: 50,
                  padding: "0.45rem 1.6rem",
                  fontSize: "0.78rem",
                  color: "rgba(251,191,36,0.8)",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                🕯️ Relight
              </button>
            </div>
          ) : (
            <>
              <div style={{ position: "relative", userSelect: "none" }}>
                {allBlown &&
                  Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: `${10 + Math.random() * 80}%`,
                        top: `${-10 + Math.random() * 30}%`,
                        width: 7,
                        height: 7,
                        borderRadius: i % 3 === 0 ? "50%" : 2,
                        background: ["#ff9de2", "#c084fc", "#60a5fa", "#fbbf24", "#34d399", "#f87171"][i % 6],
                        animation: `confettiFall ${0.8 + (i * 0.13) % 1.2}s ${(i * 0.09) % 0.8}s ease-out forwards`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    gap: 14,
                    marginBottom: -2,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {litCandles.map((lit, i) => {
                    const isBlowing = blowingIdx === i;
                    const candleColors = [
                      ["#ff9de2", "#e040a0"],
                      ["#c084fc", "#7c3aed"],
                      ["#60a5fa", "#2563eb"],
                      ["#fbbf24", "#d97706"],
                      ["#34d399", "#059669"],
                      ["#f87171", "#dc2626"],
                    ];
                    const [light, dark] = candleColors[i % candleColors.length];

                    return (
                      <div
                        key={i}
                        onClick={() => blowCandle(i)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: lit ? "pointer" : "default",
                        }}
                      >
                        <div style={{ height: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                          {lit && !isBlowing && (
                            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <div
                                style={{
                                  width: 12,
                                  height: 20,
                                  background: "linear-gradient(180deg, #fff7 0%, #fbbf24 40%, #ef4444 100%)",
                                  borderRadius: "50% 50% 30% 30%",
                                  animation: `flicker ${0.6 + i * 0.07}s ease-in-out infinite alternate`,
                                  filter: "blur(0.5px)",
                                  boxShadow: `0 0 8px 3px rgba(251,191,36,0.55), 0 0 18px 6px rgba(239,68,68,0.25)`,
                                  transformOrigin: "bottom center",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 2,
                                  width: 5,
                                  height: 10,
                                  background: "linear-gradient(180deg, #fff 0%, #fef3c7 100%)",
                                  borderRadius: "50% 50% 30% 30%",
                                  opacity: 0.9,
                                }}
                              />
                            </div>
                          )}
                          {isBlowing && (
                            <div
                              style={{
                                width: 12,
                                height: 20,
                                background: "linear-gradient(180deg, #fbbf24, #ef4444)",
                                borderRadius: "50% 50% 30% 30%",
                                animation: "blowOut 0.35s ease forwards",
                                transformOrigin: "bottom center",
                              }}
                            />
                          )}
                          {!lit && !isBlowing && (
                            <>
                              <div
                                style={{
                                  width: 4,
                                  height: 10,
                                  background: "rgba(200,200,220,0.5)",
                                  borderRadius: 4,
                                  animation: "smokeRise 1.2s ease-out infinite",
                                  animationDelay: "0s",
                                }}
                              />
                              <div
                                style={{
                                  width: 3,
                                  height: 8,
                                  background: "rgba(200,200,220,0.35)",
                                  borderRadius: 4,
                                  position: "absolute",
                                  bottom: 8,
                                  left: -4,
                                  animation: "smokeRise 1.2s ease-out infinite",
                                  animationDelay: "0.4s",
                                }}
                              />
                            </>
                          )}
                        </div>

                        <div
                          style={{
                            width: 18,
                            height: 52,
                            background: `linear-gradient(180deg, ${light} 0%, ${dark} 100%)`,
                            borderRadius: "4px 4px 3px 3px",
                            boxShadow: lit
                              ? `0 0 10px 2px ${light}88, inset -3px 0 6px rgba(0,0,0,0.15)`
                              : `inset -3px 0 6px rgba(0,0,0,0.2)`,
                            position: "relative",
                            opacity: lit ? 1 : 0.65,
                            transition: "opacity 0.3s ease, box-shadow 0.3s ease",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 6,
                              left: 3,
                              width: 5,
                              height: 12,
                              background: `${light}aa`,
                              borderRadius: "0 0 4px 4px",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: -6,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 2,
                              height: 8,
                              background: lit ? "#92400e" : "#4b2e00",
                              borderRadius: 2,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 220,
                      height: 55,
                      background: "linear-gradient(180deg, #f9a8d4 0%, #ec4899 100%)",
                      borderRadius: "12px 12px 4px 4px",
                      margin: "0 auto",
                      position: "relative",
                      boxShadow: "0 4px 20px rgba(236,72,153,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "rgba(255,255,255,0.35)", borderRadius: "12px 12px 0 0" }} />
                    {[18, 50, 85, 120, 155, 188].map((x, i) => (
                      <div key={i} style={{
                        position: "absolute",
                        top: 18,
                        left: x,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: ["#fbbf24", "#c084fc", "#60a5fa", "#34d399", "#fbbf24", "#f87171"][i],
                        boxShadow: `0 0 6px 2px ${["#fbbf24", "#c084fc", "#60a5fa", "#34d399", "#fbbf24", "#f87171"][i]}88`,
                      }} />
                    ))}
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.9)",
                      textShadow: "0 1px 4px rgba(0,0,0,0.25)",
                      letterSpacing: "0.08em",
                      marginTop: 12,
                    }}>Alisha 🎂</span>
                  </div>

                  <div
                    style={{
                      width: 280,
                      height: 70,
                      background: "linear-gradient(180deg, #c084fc 0%, #7c3aed 100%)",
                      borderRadius: "8px 8px 16px 16px",
                      margin: "0 auto",
                      position: "relative",
                      boxShadow: "0 8px 30px rgba(124,58,237,0.45)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, background: "rgba(255,255,255,0.3)", borderRadius: "8px 8px 0 0" }} />
                    {[30, 65, 100, 135, 170, 210, 245].map((x, i) => (
                      <div key={i} style={{
                        position: "absolute",
                        top: 20,
                        left: x,
                        width: 3,
                        height: 35,
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: 2,
                      }} />
                    ))}
                    {[20, 50, 80, 110, 140, 170, 200, 230, 255].map((x, i) => (
                      <div key={i} style={{
                        position: "absolute",
                        bottom: 14,
                        left: x,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: ["#fbbf24", "#ff9de2", "#60a5fa", "#34d399", "#f87171", "#c084fc", "#fbbf24", "#ff9de2", "#60a5fa"][i],
                      }} />
                    ))}
                  </div>

                  <div
                    style={{
                      width: 320,
                      height: 14,
                      background: "radial-gradient(ellipse at center, rgba(124,58,237,0.35) 0%, transparent 70%)",
                      margin: "0 auto",
                      borderRadius: "50%",
                    }}
                  />
                </div>

                {!allBlown && (
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "rgba(200,180,255,0.45)",
                    fontSize: "0.75rem",
                    marginTop: "-0.25rem",
                  }}>
                    {litCandles.filter(Boolean).length} of {NUM_CANDLES} candles remaining
                  </p>
                )}
              </div>
            </>
          )}

          <button
            className="font-body font-medium"
            onClick={() => {
              setEntered(false);
              setShowContent(false);
              setShowOnlyPhotos(false);
              resetCake();
            }}
            style={{
              background: "transparent",
              border: "1px solid rgba(200,150,255,0.3)",
              borderRadius: 50,
              padding: "0.55rem 2rem",
              fontSize: "0.78rem",
              color: "rgba(200,160,255,0.7)",
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.target as HTMLButtonElement;
              el.style.borderColor = "rgba(200,150,255,0.65)";
              el.style.color = "rgba(220,180,255,1)";
            }}
            onMouseLeave={(e) => {
              const el = e.target as HTMLButtonElement;
              el.style.borderColor = "rgba(200,150,255,0.3)";
              el.style.color = "rgba(200,160,255,0.7)";
            }}
          >
            ↩ Back
          </button>
        </div>
      )}
    
    </div>
  );
}