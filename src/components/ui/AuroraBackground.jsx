import React, { useState, useEffect, useRef } from "react";
import { BaseBackground } from "./utils";

// Aurora Minimalista y Dinámica - Completamente Rediseñada
const AuroraBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  // Throttled mouse tracking normalizado
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

    // Paleta de colores minimalista
    const palette = isDark ? {
      base: "#0a0a0f",
      primary: [64, 224, 208],    // Turquesa
      secondary: [138, 43, 226],  // Violeta
      accent: [30, 144, 255],     // Azul
      highlight: [255, 20, 147]   // Rosa
    } : {
      base: "#fafbff",
      primary: [100, 200, 255],   // Azul claro
      secondary: [180, 120, 255], // Lavanda
      accent: [120, 255, 200],    // Verde menta
      highlight: [255, 150, 200]  // Rosa suave
    };

    const animate = () => {
      if (!isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += 0.008;
      
      // Fondo base
      ctx.fillStyle = palette.base;
      ctx.fillRect(0, 0, width, height);

      // Crear 3 capas de aurora minimalistas
      const layers = [
        {
          color: palette.primary,
          intensity: 0.15,
          speed: 1,
          height: height * 0.6,
          frequency: 0.002,
          amplitude: height * 0.15
        },
        {
          color: palette.secondary,
          intensity: 0.12,
          speed: 0.7,
          height: height * 0.4,
          frequency: 0.0015,
          amplitude: height * 0.12
        },
        {
          color: palette.accent,
          intensity: 0.08,
          speed: 1.3,
          height: height * 0.8,
          frequency: 0.0025,
          amplitude: height * 0.08
        }
      ];

      layers.forEach((layer, index) => {
        // Influencia dinámica del mouse
        const mouseInfluence = {
          x: (mouseRef.current.x - 0.5) * 0.5,
          y: (mouseRef.current.y - 0.5) * 0.3
        };

        // Crear gradiente vertical suave
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        const [r, g, b] = layer.color;
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${layer.intensity * 0.3})`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${layer.intensity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        // Dibujar ondas aurora
        ctx.beginPath();
        
        for (let x = 0; x <= width; x += 3) {
          const normalizedX = x / width;
          
          // Onda principal con armónicos
          let y = layer.height;
          y += Math.sin(x * layer.frequency + timeRef.current * layer.speed) * layer.amplitude;
          y += Math.sin(x * layer.frequency * 2 + timeRef.current * layer.speed * 1.5) * layer.amplitude * 0.3;
          y += Math.sin(x * layer.frequency * 0.5 + timeRef.current * layer.speed * 0.8) * layer.amplitude * 0.5;
          
          // Influencia del mouse más sutil y elegante
          const mouseWave = Math.sin(normalizedX * Math.PI * 2 + timeRef.current * 2) * mouseInfluence.y * layer.amplitude * 0.3;
          const mouseShift = mouseInfluence.x * layer.amplitude * 0.2 * Math.cos(normalizedX * Math.PI);
          
          y += mouseWave + mouseShift;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        // Completar forma para relleno
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Línea brillante superior
        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const normalizedX = x / width;
          let y = layer.height;
          y += Math.sin(x * layer.frequency + timeRef.current * layer.speed) * layer.amplitude;
          y += Math.sin(x * layer.frequency * 2 + timeRef.current * layer.speed * 1.5) * layer.amplitude * 0.3;
          
          const mouseWave = Math.sin(normalizedX * Math.PI * 2 + timeRef.current * 2) * mouseInfluence.y * layer.amplitude * 0.3;
          y += mouseWave;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${layer.intensity * 2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Partículas de luz flotantes minimalistas
      if (Math.random() < 0.03) {
        const particleCount = 2;
        for (let i = 0; i < particleCount; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height * 0.7;
          const size = Math.random() * 2 + 1;
          const [r, g, b] = palette.highlight;
          
          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 6);
          particleGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
          particleGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.2)`);
          particleGradient.addColorStop(1, "transparent");
          
          ctx.beginPath();
          ctx.arc(x, y, size * 3, 0, Math.PI * 2);
          ctx.fillStyle = particleGradient;
          ctx.fill();
        }
      }

      // Efecto de resplandor central sutil
      const centerGlow = ctx.createRadialGradient(
        width * mouseRef.current.x, height * mouseRef.current.y, 0,
        width * mouseRef.current.x, height * mouseRef.current.y, 200
      );
      const [hr, hg, hb] = palette.highlight;
      centerGlow.addColorStop(0, `rgba(${hr}, ${hg}, ${hb}, 0.05)`);
      centerGlow.addColorStop(1, "transparent");
      
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

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
    <BaseBackground
      isDark={isDark}
      gradient={null}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark ? '#0a0a0f' : '#fafbff'
        }}
      />
    </BaseBackground>
  );
};

export { AuroraBackground };