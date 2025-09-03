import React, { useState, useEffect, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 9. Fluido Interactivo (Liquid Background) - Mejorado y Corregido
const InteractiveFluidBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [lastMousePos, setLastMousePos] = useState({ x: -100, y: -100 });
  const [pointerDown, setPointerDown] = useState(false);
  const particlesRef = useRef([]);

  // Manejar eventos del mouse
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      setLastMousePos(mousePos);
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setPointerDown(true);
    };

    const handleMouseUp = () => {
      setPointerDown(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mousePos]);

  // Animación principal
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

    // Simulación simplificada de fluido con partículas
    const animate = () => {
      // Fade out anterior para efecto de persistencia
      ctx.fillStyle = isDark
        ? "rgba(5, 5, 20, 0.02)"  // Alpha bajo para fade lento
        : "rgba(240, 240, 255, 0.02)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Emitir partículas si el mouse se mueve
      if (
        mousePos.x > 0 &&
        mousePos.y > 0 &&
        lastMousePos.x > 0 &&
        lastMousePos.y > 0
      ) {
        const dx = mousePos.x - lastMousePos.x;
        const dy = mousePos.y - lastMousePos.y;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 5) {
          let numParticles = Math.floor(speed / 5) + 3;  // Más partículas con velocidad
          if (pointerDown) numParticles *= 2;  // Más si el botón está presionado

          for (let i = 0; i < numParticles; i++) {
            const t = Math.random();
            const px = lastMousePos.x + dx * t;
            const py = lastMousePos.y + dy * t;
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI / 2;  // Dispersión
            const vel = speed * 0.05 + Math.random() * 2;
            const vx = Math.cos(angle) * vel;
            const vy = Math.sin(angle) * vel;
            const life = 100 + Math.random() * 200;  // Vida variable
            const color = getRandomColor();

            particlesRef.current.push({ x: px, y: py, vx, vy, life, maxLife: life, color });
          }

          // Dibujar rastro principal con curva para efecto fluido
          const gradient = ctx.createLinearGradient(lastMousePos.x, lastMousePos.y, mousePos.x, mousePos.y);
          if (isDark) {
            gradient.addColorStop(0, "rgba(100, 50, 255, 0.6)");
            gradient.addColorStop(1, "rgba(50, 100, 255, 0.6)");
          } else {
            gradient.addColorStop(0, "rgba(200, 230, 255, 0.6)");
            gradient.addColorStop(1, "rgba(150, 200, 255, 0.6)");
          }

          ctx.beginPath();
          ctx.moveTo(lastMousePos.x, lastMousePos.y);
          const midX = (lastMousePos.x + mousePos.x) / 2 + (Math.random() - 0.5) * 20;
          const midY = (lastMousePos.y + mousePos.y) / 2 + (Math.random() - 0.5) * 20;
          ctx.quadraticCurveTo(midX, midY, mousePos.x, mousePos.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 10 + speed * 0.2;  // Grosor variable con velocidad
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Actualizar y dibujar partículas
      particlesRef.current = particlesRef.current.map((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;  // Fricción
        p.vy *= 0.98;
        p.life -= 1;

        // Mantener dentro de límites (opcional, para evitar salida)
        if (p.x < 0 || p.x > canvas.width) p.vx *= -0.8;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -0.8;

        return p;
      }).filter((p) => p.life > 0);

      particlesRef.current.forEach((p) => {
        const alpha = p.life / p.maxLife * 0.8;
        const radius = (10 + (p.maxLife - p.life) / p.maxLife * 20) * (pointerDown ? 1.5 : 1);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        const alphaHexHalf = Math.floor(alpha * 128).toString(16).padStart(2, '0');
        gradient.addColorStop(0, getColorVariant(p.color, isDark ? "400" : "500") + alphaHex);
        gradient.addColorStop(0.5, getColorVariant(p.color, isDark ? "300" : "400") + alphaHexHalf);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos, lastMousePos, pointerDown, isDark]);

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-indigo-900 via-blue-900 to-purple-900"
          : "from-blue-50 via-indigo-50 to-purple-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { InteractiveFluidBackground };