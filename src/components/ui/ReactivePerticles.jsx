import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";


// 2. Partículas Reactivas
const ReactiveParticlesBackground = ({ isDark = false }) => {
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const animationFrameRef = useRef();
  const canvasRef = useRef(null);

  // Inicializar partículas
  const initializeParticles = useCallback(() => {
    if (typeof window === "undefined") return [];

    return Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 3 + 1,
      color: getRandomColor(),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setParticles(initializeParticles());

    const handleResize = () => {
      setParticles(initializeParticles());
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
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
    if (!canvasRef.current || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ajustar tamaño del canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Función de animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Actualizar y dibujar partículas
      setParticles((prevParticles) => {
        const updatedParticles = prevParticles.map((particle) => {
          // Calcular distancia al mouse
          const dx = mousePos.x - particle.x;
          const dy = mousePos.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Actualizar velocidad basada en la posición del mouse
          let vx = particle.vx;
          let vy = particle.vy;

          if (distance < 100) {
            // Alejarse del mouse
            const force = (100 - distance) / 100;
            vx -= dx * force * 0.01;
            vy -= dy * force * 0.01;
          }

          // Aplicar velocidad con límites
          vx = Math.max(-1, Math.min(1, vx));
          vy = Math.max(-1, Math.min(1, vy));

          // Actualizar posición
          let x = particle.x + vx;
          let y = particle.y + vy;

          // Mantener dentro de los límites
          if (x < 0) x = canvas.width;
          if (x > canvas.width) x = 0;
          if (y < 0) y = canvas.height;
          if (y > canvas.height) y = 0;

          return {
            ...particle,
            x,
            y,
            vx: vx * 0.98, // Fricción
            vy: vy * 0.98,
          };
        });

        // Dibujar conexiones entre partículas cercanas
        ctx.strokeStyle = isDark
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(100, 100, 255, 0.15)";
        ctx.lineWidth = 0.5;

        for (let i = 0; i < updatedParticles.length; i++) {
          const p1 = updatedParticles[i];

          for (let j = i + 1; j < updatedParticles.length; j++) {
            const p2 = updatedParticles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.globalAlpha = ((100 - distance) / 100) * 0.8;
              ctx.stroke();
            }
          }
        }

        // Dibujar partículas
        updatedParticles.forEach((particle) => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = getColorVariant(
            particle.color,
            isDark ? "400" : "500"
          );
          ctx.globalAlpha = particle.opacity;
          ctx.fill();
        });

        return updatedParticles;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos, isDark]);

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
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export {ReactiveParticlesBackground};