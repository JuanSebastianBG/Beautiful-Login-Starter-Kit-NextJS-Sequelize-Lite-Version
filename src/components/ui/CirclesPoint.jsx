import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// Círculos Pulsantes Optimizados
const PulsatingCirclesBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const circlesRef = useRef([]);
  const ripplesRef = useRef([]);

  // Inicializar círculos usando useRef
  const initializeCircles = useCallback(() => {
    if (typeof window === "undefined") return [];

    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      baseRadius: 15 + Math.random() * 35,
      radius: 15 + Math.random() * 35,
      color: getRandomColor(),
      pulseSpeed: 0.3 + Math.random() * 1.2,
      pulseAmplitude: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.4 + Math.random() * 0.3,
      glowIntensity: 0.3 + Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    circlesRef.current = initializeCircles();
    ripplesRef.current = [];

    const handleResize = () => {
      circlesRef.current = initializeCircles();
    };

    const handleClick = (e) => {
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 200,
        speed: 3,
        opacity: 1,
        color: getRandomColor(),
        particles: Array.from({ length: 15 }, () => ({
          angle: Math.random() * Math.PI * 2,
          distance: 0,
          speed: 1.5 + Math.random() * 2,
          size: 1 + Math.random() * 2,
        })),
      };
      ripplesRef.current = [...ripplesRef.current, newRipple].slice(-8);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initializeCircles]);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined" || circlesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Actualizar círculos
      circlesRef.current = circlesRef.current.map((circle) => {
        const pulse = Math.sin(Date.now() * 0.001 * circle.pulseSpeed + circle.phase);
        const radius = circle.baseRadius * (1 + pulse * circle.pulseAmplitude);

        let x = circle.x + circle.vx;
        let y = circle.y + circle.vy;

        if (x < 0 || x > canvas.width) {
          circle.vx *= -1;
          x = Math.max(0, Math.min(canvas.width, x));
        }
        if (y < 0 || y > canvas.height) {
          circle.vy *= -1;
          y = Math.max(0, Math.min(canvas.height, y));
        }

        return { ...circle, radius, x, y };
      });

      // Dibujar conexiones
      circlesRef.current.forEach((c1, i) => {
        for (let j = i + 1; j < circlesRef.current.length; j++) {
          const c2 = circlesRef.current[j];
          const dx = c1.x - c2.x;
          const dy = c1.y - c2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const gradient = ctx.createLinearGradient(c1.x, c1.y, c2.x, c2.y);
            gradient.addColorStop(0, getColorVariant(c1.color, isDark ? "400" : "300") + "44");
            gradient.addColorStop(1, getColorVariant(c2.color, isDark ? "400" : "300") + "44");

            ctx.beginPath();
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = (180 - dist) / 60;
            ctx.globalAlpha = (180 - dist) / 180 * 0.6;
            ctx.stroke();
          }
        }
      });

      // Dibujar círculos con glow
      circlesRef.current.forEach((circle) => {
        const gradient = ctx.createRadialGradient(
          circle.x, circle.y, 0,
          circle.x, circle.y, circle.radius * (1 + circle.glowIntensity)
        );
        gradient.addColorStop(0, getColorVariant(circle.color, isDark ? "300" : "400") + "DD");
        gradient.addColorStop(0.7, getColorVariant(circle.color, isDark ? "500" : "300") + "66");
        gradient.addColorStop(1, getColorVariant(circle.color, isDark ? "700" : "500") + "00");

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius * (1 + circle.glowIntensity), 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = circle.opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = getColorVariant(circle.color, isDark ? "400" : "300");
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Actualizar y dibujar ripples
      ripplesRef.current = ripplesRef.current.map((ripple) => {
        const newRadius = ripple.radius + ripple.speed;
        const newOpacity = ripple.opacity * (1 - newRadius / ripple.maxRadius);
        const newParticles = ripple.particles.map((p) => ({
          ...p,
          distance: p.distance + p.speed,
        }));

        return {
          ...ripple,
          radius: newRadius,
          opacity: newOpacity,
          particles: newParticles,
        };
      }).filter((ripple) => ripple.opacity > 0.01);

      ripplesRef.current.forEach((ripple) => {
        // Onda principal
        const gradient = ctx.createRadialGradient(
          ripple.x, ripple.y, ripple.radius * 0.8,
          ripple.x, ripple.y, ripple.radius
        );
        gradient.addColorStop(0, getColorVariant(ripple.color, isDark ? "300" : "400") + "00");
        gradient.addColorStop(1, getColorVariant(ripple.color, isDark ? "500" : "300") + "BB");

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.globalAlpha = ripple.opacity;
        ctx.stroke();

        // Partículas
        ripple.particles.forEach((p) => {
          const px = ripple.x + Math.cos(p.angle) * p.distance;
          const py = ripple.y + Math.sin(p.angle) * p.distance;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = getColorVariant(ripple.color, isDark ? "400" : "300");
          ctx.globalAlpha = ripple.opacity * (1 - p.distance / ripple.maxRadius);
          ctx.fill();
        });
      });

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDark]);

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-gray-900 via-purple-900 to-black"
          : "from-blue-50 via-purple-50 to-indigo-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { PulsatingCirclesBackground };