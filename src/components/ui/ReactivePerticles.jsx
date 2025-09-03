import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// Partículas Reactivas con Más Densidad
const ReactiveParticlesBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(true);

  // Más partículas para mayor densidad
  const initializeParticles = useCallback(() => {
    if (typeof window === "undefined") return [];

    const particleCount = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 8000)); // Más partículas
    
    return Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 2.5 + 0.8, // Variedad en tamaños
      color: getRandomColor(),
      vx: (Math.random() - 0.5) * 0.8, // Más velocidad
      vy: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.7 + 0.3,
      pulsePhase: Math.random() * Math.PI * 2, // Para efecto de pulsación
      originalRadius: 0
    }));
  }, []);

  // Throttled mouse tracking
  const handleMouseMove = useRef(
    (() => {
      let timeout;
      return (e) => {
        if (timeout) return;
        timeout = setTimeout(() => {
          mouseRef.current = { x: e.clientX, y: e.clientY };
          timeout = null;
        }, 16);
      };
    })()
  ).current;

  useEffect(() => {
    if (typeof window === "undefined") return;

    particlesRef.current = initializeParticles();
    particlesRef.current.forEach(p => p.originalRadius = p.radius);

    const handleResize = () => {
      particlesRef.current = initializeParticles();
      particlesRef.current.forEach(p => p.originalRadius = p.radius);
    };

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeParticles]);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined" || particlesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    let time = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const animate = () => {
      if (!isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Actualizar partículas
      particlesRef.current.forEach((particle) => {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Interacción con el mouse más fuerte
        if (distance < 120) {
          const force = (120 - distance) / 120;
          particle.vx -= dx * force * 0.015;
          particle.vy -= dy * force * 0.015;
        }

        // Límites de velocidad
        particle.vx = Math.max(-2, Math.min(2, particle.vx));
        particle.vy = Math.max(-2, Math.min(2, particle.vy));

        // Actualizar posición
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Rebote en bordes
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Fricción
        particle.vx *= 0.995;
        particle.vy *= 0.995;

        // Efecto de pulsación
        particle.pulsePhase += 0.05;
        particle.radius = particle.originalRadius + Math.sin(particle.pulsePhase) * 0.5;
      });

      // Dibujar conexiones más densas
      ctx.strokeStyle = isDark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(99, 102, 241, 0.15)";
      ctx.lineWidth = 0.8;

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p1 = particlesRef.current[i];
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) { // Mayor rango de conexión
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.globalAlpha = ((120 - distance) / 120) * 0.6;
            ctx.stroke();
          }
        }
      }

      // Dibujar partículas con efectos mejorados
      particlesRef.current.forEach((particle) => {
        // Halo exterior
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        
        const colorVariant = getColorVariant(particle.color, isDark ? "400" : "500");
        gradient.addColorStop(0, colorVariant.replace('rgb', 'rgba').replace(')', ', 0.4)'));
        gradient.addColorStop(1, "transparent");
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        ctx.fill();

        // Partícula principal
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = colorVariant;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // Núcleo brillante
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.9)";
        ctx.globalAlpha = 0.6;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
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
      gradient={
        isDark
          ? "from-gray-900 via-slate-800 to-black"
          : "from-blue-50 via-purple-50 to-indigo-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </BaseBackground>
  );
};

export { ReactiveParticlesBackground };