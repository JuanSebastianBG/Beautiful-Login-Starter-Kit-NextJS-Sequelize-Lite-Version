import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// Fondo de Partículas Borrosas Optimizado
const BlurryParticlesBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const particlesRef = useRef([]);
  const lastMouseUpdateRef = useRef(0);

  // Inicializar partículas con mejor distribución
  const initializeParticles = useCallback(() => {
    if (typeof window === "undefined") return [];

    const numParticles = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    const newParticles = [];

    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        originX: Math.random() * window.innerWidth,
        originY: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 8 + 3,
        color: getRandomColor(),
        opacity: Math.random() * 0.4 + 0.3,
      });
    }

    return newParticles;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    particlesRef.current = initializeParticles();

    const handleResize = () => {
      particlesRef.current = initializeParticles();
    };

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMouseUpdateRef.current > 16) { // Throttle a 60fps
        setMousePos({ x: e.clientX, y: e.clientY });
        lastMouseUpdateRef.current = now;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initializeParticles]);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined" || particlesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(6px)";

      // Actualizar partículas con mejor física
      particlesRef.current = particlesRef.current.map((particle) => {
        let { x, y, vx, vy, originX, originY } = particle;

        x += vx;
        y += vy;

        // Rebote mejorado
        if (x < 0 || x > canvas.width) {
          vx = -vx * 0.7;
          x = Math.max(0, Math.min(canvas.width, x));
        }
        if (y < 0 || y > canvas.height) {
          vy = -vy * 0.7;
          y = Math.max(0, Math.min(canvas.height, y));
        }

        // Interacción con mouse optimizada
        const dx = mousePos.x - x;
        const dy = mousePos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150 && distance > 0) {
          const force = (150 - distance) / 150 * 0.3;
          vx += (dx / distance) * force;
          vy += (dy / distance) * force;
        } else {
          // Regreso suave al origen
          vx += (originX - x) * 0.0005;
          vy += (originY - y) * 0.0005;
        }

        // Límites de velocidad
        vx = Math.max(Math.min(vx, 0.8), -0.8);
        vy = Math.max(Math.min(vy, 0.8), -0.8);

        // Fricción
        vx *= 0.99;
        vy *= 0.99;

        return { ...particle, x, y, vx, vy };
      });

      // Dibujar partículas con gradientes
      particlesRef.current.forEach((particle) => {
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );
        gradient.addColorStop(0, getColorVariant(particle.color, isDark ? "400" : "300") + "CC");
        gradient.addColorStop(1, getColorVariant(particle.color, isDark ? "600" : "500") + "00");

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      ctx.filter = "none";
      ctx.globalAlpha = 1;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos, isDark]);

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-gray-800 via-indigo-900 to-purple-900"
          : "from-indigo-50 via-purple-50 to-pink-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { BlurryParticlesBackground };