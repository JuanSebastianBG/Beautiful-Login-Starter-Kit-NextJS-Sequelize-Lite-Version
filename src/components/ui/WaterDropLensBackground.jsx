import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// Fondo de Lupa de Gota de Agua Mejorado
const WaterDropLensBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const dotsRef = useRef([]);
  const dripsRef = useRef([]);
  const lastMouseUpdateRef = useRef(0);

  // Inicializar puntos con mejor distribución
  const initializeDots = useCallback(() => {
    if (typeof window === "undefined") return [];

    const numDots = Math.min(300, Math.floor((window.innerWidth * window.innerHeight) / 8000));
    const newDots = [];

    for (let i = 0; i < numDots; i++) {
      newDots.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 4 + 1,
        color: getRandomColor(),
        opacity: Math.random() * 0.6 + 0.2,
        pulseSpeed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return newDots;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    dotsRef.current = initializeDots();
    dripsRef.current = [];

    const handleResize = () => {
      dotsRef.current = initializeDots();
    };

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMouseUpdateRef.current > 16) {
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
  }, [initializeDots]);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined" || dotsRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Crear offscreen canvas una sola vez
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const dropRadius = 80;
    const magnification = 1.8;

    const animate = () => {
      // Dibujar fondo en offscreen canvas
      offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      offscreenCtx.filter = "blur(1px)";

      // Dibujar puntos con pulsación
      dotsRef.current.forEach((dot) => {
        const pulse = Math.sin(Date.now() * 0.001 * dot.pulseSpeed + dot.phase);
        const currentRadius = dot.radius * (1 + pulse * 0.3);
        
        const gradient = offscreenCtx.createRadialGradient(
          dot.x, dot.y, 0,
          dot.x, dot.y, currentRadius * 2
        );
        gradient.addColorStop(0, getColorVariant(dot.color, isDark ? "400" : "300") + "FF");
        gradient.addColorStop(1, getColorVariant(dot.color, isDark ? "600" : "500") + "00");

        offscreenCtx.beginPath();
        offscreenCtx.arc(dot.x, dot.y, currentRadius, 0, Math.PI * 2);
        offscreenCtx.fillStyle = gradient;
        offscreenCtx.globalAlpha = dot.opacity;
        offscreenCtx.fill();
      });

      offscreenCtx.filter = "none";
      offscreenCtx.globalAlpha = 1;

      // Copiar a canvas principal
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0);

      // Dibujar gota de agua mejorada
      if (mousePos.x >= 0 && mousePos.y >= 0) {
        const dripOffset = Math.sin(Date.now() / 300) * 3;
        
        ctx.save();
        
        // Crear forma de gota más realista
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, dropRadius, 0, Math.PI * 2);
        
        // Goteo inferior
        const dripHeight = 15 + Math.abs(dripOffset);
        ctx.ellipse(
          mousePos.x, 
          mousePos.y + dropRadius + dripHeight/2, 
          dropRadius * 0.3, 
          dripHeight, 
          0, 0, Math.PI * 2
        );
        
        ctx.clip();

        // Dibujar contenido magnificado
        const zoomWidth = dropRadius * 2 / magnification;
        const zoomHeight = (dropRadius + dripHeight) * 2 / magnification;
        
        ctx.drawImage(
          offscreenCanvas,
          mousePos.x - zoomWidth / 2,
          mousePos.y - zoomWidth / 2,
          zoomWidth,
          zoomHeight,
          mousePos.x - dropRadius,
          mousePos.y - dropRadius,
          dropRadius * 2,
          (dropRadius + dripHeight) * 2
        );

        ctx.restore();

        // Borde de la gota con efecto de refracción
        const gradient = ctx.createRadialGradient(
          mousePos.x, mousePos.y, dropRadius * 0.8,
          mousePos.x, mousePos.y, dropRadius * 1.2
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(1, isDark ? "rgba(200, 230, 255, 0.6)" : "rgba(0, 100, 200, 0.4)");

        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, dropRadius, 0, Math.PI * 2);
        ctx.ellipse(
          mousePos.x, 
          mousePos.y + dropRadius + (15 + Math.abs(dripOffset))/2, 
          dropRadius * 0.3, 
          15 + Math.abs(dripOffset), 
          0, 0, Math.PI * 2
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Generar gotas ocasionalmente
        if (Math.random() < 0.03) {
          dripsRef.current.push({
            x: mousePos.x + (Math.random() - 0.5) * dropRadius * 0.5,
            y: mousePos.y + dropRadius + 15,
            vy: Math.random() * 1 + 0.5,
            radius: Math.random() * 3 + 1,
            color: getColorVariant("blue", isDark ? "300" : "500"),
            life: 120,
            opacity: 0.8,
          });
        }
      }

      // Actualizar y dibujar gotas
      dripsRef.current = dripsRef.current.map((drip) => {
        drip.y += drip.vy;
        drip.vy += 0.03; // Gravedad
        drip.life -= 1;
        drip.opacity = drip.life / 120;
        return drip;
      }).filter((drip) => drip.life > 0 && drip.y < canvas.height + 50);

      dripsRef.current.forEach((drip) => {
        ctx.beginPath();
        ctx.arc(drip.x, drip.y, drip.radius, 0, Math.PI * 2);
        ctx.fillStyle = drip.color;
        ctx.globalAlpha = drip.opacity;
        ctx.fill();
      });
      
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
          ? "from-blue-900 via-cyan-900 to-teal-900"
          : "from-cyan-50 via-blue-50 to-teal-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { WaterDropLensBackground };