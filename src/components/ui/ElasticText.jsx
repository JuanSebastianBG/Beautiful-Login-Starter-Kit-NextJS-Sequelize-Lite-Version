import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 10. Texto o Logo Líquido/Elástico (Mejorado)
const ElasticLogoBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const pointsRef = useRef([]);  // Puntos como ref
  const [text] = useState("NEXT.JS");

  // Inicializar puntos para el texto elástico - Ahora como partículas dentro del texto
  const initializePoints = useCallback(() => {
    if (typeof window === "undefined") return [];

    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");

    offscreenCanvas.width = window.innerWidth;
    offscreenCanvas.height = window.innerHeight;

    // Configurar el texto
    const fontSize = Math.min(window.innerWidth / 5, 200);  // Aumentado para mayor impacto visual
    offscreenCtx.font = `bold ${fontSize}px sans-serif`;
    offscreenCtx.textAlign = "center";
    offscreenCtx.textBaseline = "middle";

    // Medir el texto
    const textMetrics = offscreenCtx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;  // Aproximación

    // Posición central
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Dibujar el texto en el offscreen canvas
    offscreenCtx.fillStyle = "white";
    offscreenCtx.fillText(text, centerX, centerY);

    // Obtener datos de imagen
    const imageData = offscreenCtx.getImageData(
      centerX - textWidth / 2 - 20,
      centerY - textHeight / 2 - 20,
      textWidth + 40,
      textHeight + 40
    );

    // Crear puntos donde el píxel es opaco
    const newPoints = [];
    const spacing = 8;  // Espaciado para controlar el número de puntos (ajustado para rendimiento)
    const areaWidth = textWidth + 40;
    const areaHeight = textHeight + 40;
    const offsetX = centerX - textWidth / 2 - 20;
    const offsetY = centerY - textHeight / 2 - 20;

    for (let y = 0; y < areaHeight; y += spacing) {
      for (let x = 0; x < areaWidth; x += spacing) {
        const index = (y * areaWidth + x) * 4 + 3;  // Canal alpha
        if (imageData.data[index] > 128) {
          const pointX = offsetX + x + (Math.random() - 0.5) * (spacing / 2);  // Jitter ligero
          const pointY = offsetY + y + (Math.random() - 0.5) * (spacing / 2);
          newPoints.push({
            x: pointX,
            y: pointY,
            originX: pointX,
            originY: pointY,
            color: getRandomColor(),
          });
        }
      }
    }

    return newPoints;
  }, [text]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    pointsRef.current = initializePoints();

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
  }, [initializePoints]);

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

      const points = pointsRef.current;  // Alias para simplicidad

      // Actualizar puntos
      pointsRef.current = points.map((point) => {
        const dx = mousePos.x - point.x;
        const dy = mousePos.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let targetX = point.originX;
        let targetY = point.originY;

        if (distance < 300) {  // Aumentado radio de influencia para más interacción
          const force = (300 - distance) / 300 * 1.2;  // Aumentada fuerza para efecto más pronunciado
          targetX -= (dx / distance) * force * 50;  // Repulsión direccional más fuerte
          targetY -= (dy / distance) * force * 50;
        }

        const vx = (targetX - point.x) * 0.15;  // Aumentado coeficiente para respuesta más rápida
        const vy = (targetY - point.y) * 0.15;

        return {
          ...point,
          x: point.x + vx,
          y: point.y + vy,
        };
      });

      // Dibujar conexiones entre puntos cercanos
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(100, 100, 255, 0.4)";
      ctx.lineWidth = 1;

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 40) {  // Umbral para conexiones
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.globalAlpha = (40 - dist) / 40 * 0.6;  // Alpha ajustado para mejor visibilidad
            ctx.stroke();
          }
        }
      }

      // Reset alpha
      ctx.globalAlpha = 1;

      // Dibujar puntos
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);  // Aumentado radio para mejor visibilidad
        ctx.fillStyle = getColorVariant(point.color, isDark ? "300" : "600");  // Colores más vibrantes
        ctx.fill();

        // Halo para efecto glow
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = getColorVariant(point.color, isDark ? "500" : "400");
        ctx.globalAlpha = 0.4;  // Aumentado para más glow
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos, text, isDark]);

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