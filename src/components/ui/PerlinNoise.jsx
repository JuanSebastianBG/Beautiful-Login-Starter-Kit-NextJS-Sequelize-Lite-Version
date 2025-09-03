import React, { useState, useEffect, useRef } from "react";
import { BaseBackground } from "./utils";

// Fondo de Ondas Minimalistas - Más Visible y Vibrante
const PerlinNoiseBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  // Throttled mouse tracking
  const handleMouseMove = useRef(
    (() => {
      let timeout;
      return (e) => {
        if (timeout) return;
        timeout = setTimeout(() => {
          mouseRef.current = {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight
          };
          timeout = null;
        }, 16);
      };
    })()
  ).current;

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    let width, height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Colores más vibrantes y visibles
    const colors = isDark ? {
      primary: "rgba(99, 102, 241, 0.25)",    // Más opaco
      secondary: "rgba(139, 92, 246, 0.22)", // Más opaco
      accent: "rgba(59, 130, 246, 0.18)",    // Más opaco
      base: "#0a0a1a",                       // Más oscuro para contraste
      gradient1: "rgba(99, 102, 241, 0.08)",
      gradient2: "rgba(139, 92, 246, 0.06)",
      highlight: "rgba(168, 85, 247, 0.4)"
    } : {
      primary: "rgba(99, 102, 241, 0.18)",   // Más visible
      secondary: "rgba(139, 92, 246, 0.15)", // Más visible
      accent: "rgba(59, 130, 246, 0.12)",    // Más visible
      base: "#f8fafc",                       // Más claro para contraste
      gradient1: "rgba(99, 102, 241, 0.05)",
      gradient2: "rgba(139, 92, 246, 0.04)",
      highlight: "rgba(168, 85, 247, 0.2)"
    };

    const animate = () => {
      if (!isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += 0.012; // Ligeramente más rápido
      
      // Fondo base
      ctx.fillStyle = colors.base;
      ctx.fillRect(0, 0, width, height);

      // Gradiente base más visible
      const baseGradient = ctx.createRadialGradient(
        width * 0.3, height * 0.3, 0,
        width * 0.7, height * 0.7, Math.max(width, height)
      );
      baseGradient.addColorStop(0, colors.gradient1);
      baseGradient.addColorStop(0.5, colors.gradient2);
      baseGradient.addColorStop(1, "transparent");
      
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, width, height);

      // Ondas principales más prominentes
      const waves = [
        { 
          amplitude: height * 0.2, // Más amplitud
          frequency: 0.003, 
          phase: timeRef.current * 0.6,
          y: height * 0.25,
          color: colors.primary,
          thickness: 60
        },
        { 
          amplitude: height * 0.18, 
          frequency: 0.0025, 
          phase: timeRef.current * 0.4 + Math.PI,
          y: height * 0.5,
          color: colors.secondary,
          thickness: 80
        },
        { 
          amplitude: height * 0.15, 
          frequency: 0.004, 
          phase: timeRef.current * 0.8 + Math.PI * 0.5,
          y: height * 0.75,
          color: colors.accent,
          thickness: 50
        }
      ];

      waves.forEach((wave, index) => {
        ctx.beginPath();
        
        // Influencia más notable del mouse
        const mouseInfluence = {
          x: (mouseRef.current.x - 0.5) * 0.6, // Más influencia
          y: (mouseRef.current.y - 0.5) * 0.4
        };

        for (let x = 0; x <= width; x += 1) { // Más detalle
          const normalizedX = x / width;
          
          let y = wave.y;
          y += Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
          y += Math.sin(x * wave.frequency * 2 + wave.phase * 1.5) * wave.amplitude * 0.4;
          y += Math.sin(x * wave.frequency * 0.5 + wave.phase * 0.8) * wave.amplitude * 0.6;
          
          // Más influencia del mouse
          y += mouseInfluence.y * wave.amplitude * 0.4 * Math.sin(normalizedX * Math.PI);
          y += mouseInfluence.x * wave.amplitude * 0.2 * Math.cos(normalizedX * Math.PI * 2);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        // Gradiente más intenso
        const waveGradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, height);
        waveGradient.addColorStop(0, wave.color);
        waveGradient.addColorStop(0.3, wave.color.replace(/[\d\.]+\)$/, '0.1)'));
        waveGradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = waveGradient;
        ctx.fill();

        // Línea brillante más visible
        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const normalizedX = x / width;
          let y = wave.y;
          y += Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
          y += Math.sin(x * wave.frequency * 2 + wave.phase * 1.5) * wave.amplitude * 0.4;
          y += mouseInfluence.y * wave.amplitude * 0.4 * Math.sin(normalizedX * Math.PI);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.strokeStyle = colors.highlight;
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // Partículas más visibles
      if (Math.random() < 0.05) {
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 3 + 2;
          
          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
          particleGradient.addColorStop(0, isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(99, 102, 241, 0.3)");
          particleGradient.addColorStop(1, "transparent");
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = particleGradient;
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDark, isVisible]);

  return (
    <BaseBackground isDark={isDark} gradient={null}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark ? '#0a0a1a' : '#f8fafc'
        }}
      />
    </BaseBackground>
  );
};

export { PerlinNoiseBackground };