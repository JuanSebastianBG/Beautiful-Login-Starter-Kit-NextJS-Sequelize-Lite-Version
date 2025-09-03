import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 10. Texto o Logo Líquido/Elástico (Optimizado)
const ElasticLogoBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const pointsRef = useRef([]);
  const [text] = useState("NEXT.JS");
  const isInitializedRef = useRef(false);

  // Inicializar puntos para el texto elástico - Optimizado
  const initializePoints = useCallback(() => {
    if (typeof window === "undefined") return [];

    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");

    offscreenCanvas.width = window.innerWidth;
    offscreenCanvas.height = window.innerHeight;

    const fontSize = Math.min(window.innerWidth / 5, 200);
    offscreenCtx.font = `bold ${fontSize}px sans-serif`;
    offscreenCtx.textAlign = "center";
    offscreenCtx.textBaseline = "middle";

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    offscreenCtx.fillStyle = "white";
    offscreenCtx.fillText(text, centerX, centerY);

    const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    const data = imageData.data;
    const points = [];

    // Muestreo más eficiente
    const step = 8;
    for (let y = 0; y < offscreenCanvas.height; y += step) {
      for (let x = 0; x < offscreenCanvas.width; x += step) {
        const index = (y * offscreenCanvas.width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 128 && Math.random() < 0.3) {
          points.push({
            x,
            y,
            originalX: x,
            originalY: y,
            vx: 0,
            vy: 0,
            color: getRandomColor(),
          });
        }
      }
    }

    return points;
  }, [text]); // Solo depende de text

  // Inicialización única
  useEffect(() => {
    if (typeof window === "undefined" || isInitializedRef.current) return;
    
    pointsRef.current = initializePoints();
    isInitializedRef.current = true;

    const handleResize = () => {
      pointsRef.current = initializePoints();
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
  }, []); // Sin dependencias problemáticas

  // Animación separada
  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined" || pointsRef.current.length === 0) return;

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

      const points = pointsRef.current;

      // Actualizar puntos sin modificar el array original
      points.forEach((point) => {
        const dx = mousePos.x - point.x;
        const dy = mousePos.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          point.vx += Math.cos(angle) * force * 0.3;
          point.vy += Math.sin(angle) * force * 0.3;
        }

        // Fuerza de retorno
        const returnForceX = (point.originalX - point.x) * 0.05;
        const returnForceY = (point.originalY - point.y) * 0.05;
        point.vx += returnForceX;
        point.vy += returnForceY;

        // Aplicar fricción
        point.vx *= 0.9;
        point.vy *= 0.9;

        // Actualizar posición
        point.x += point.vx;
        point.y += point.vy;
      });

      // Dibujar conexiones
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1;

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 40) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.globalAlpha = (40 - dist) / 40 * 0.6;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      // Dibujar puntos
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = getColorVariant(point.color, isDark ? "300" : "600");
        ctx.fill();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = getColorVariant(point.color, isDark ? "500" : "400");
        ctx.globalAlpha = 0.4;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos, isDark]); // Dependencias controladas

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-gray-900 via-purple-900 to-blue-900"
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

export { ElasticLogoBackground };