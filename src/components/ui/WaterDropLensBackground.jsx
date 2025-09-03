import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// Fondo de Lupa de Gota de Agua Súper Optimizado y Mejorado
const WaterDropLensBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const dotsRef = useRef([]);
  const dripsRef = useRef([]);
  const lastMouseUpdateRef = useRef(0);
  const isVisibleRef = useRef(true);
  const backgroundNeedsUpdateRef = useRef(true);

  // Inicializar puntos optimizado
  const initializeDots = useCallback(() => {
    if (typeof window === "undefined") return [];

    const density = Math.min(200, Math.floor((window.innerWidth * window.innerHeight) / 10000));
    const newDots = [];

    for (let i = 0; i < density; i++) {
      newDots.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 3 + 1.5,
        color: getRandomColor(),
        opacity: Math.random() * 0.4 + 0.3,
        pulseSpeed: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        baseRadius: 0,
      });
    }

    newDots.forEach(dot => {
      dot.baseRadius = dot.radius;
    });

    return newDots;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    dotsRef.current = initializeDots();
    dripsRef.current = [];
    backgroundNeedsUpdateRef.current = true;

    const handleResize = () => {
      dotsRef.current = initializeDots();
      backgroundNeedsUpdateRef.current = true;
    };

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMouseUpdateRef.current > 20) {
        setMousePos({ x: e.clientX, y: e.clientY });
        lastMouseUpdateRef.current = now;
      }
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initializeDots]);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined" || dotsRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Canvas de fondo estático
    if (!backgroundCanvasRef.current) {
      backgroundCanvasRef.current = document.createElement("canvas");
    }
    const bgCanvas = backgroundCanvasRef.current;
    const bgCtx = bgCanvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      backgroundNeedsUpdateRef.current = true;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const dropRadius = 70;
    const magnification = 2.2;
    let frameCount = 0;

    const animate = () => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      frameCount++;
      const currentTime = Date.now() * 0.001;

      // Actualizar fondo solo cuando sea necesario
      if (backgroundNeedsUpdateRef.current || frameCount % 3 === 0) {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        // Dibujar puntos con pulsación optimizada
        dotsRef.current.forEach((dot) => {
          const pulse = Math.sin(currentTime * dot.pulseSpeed + dot.phase) * 0.2 + 1;
          dot.radius = dot.baseRadius * pulse;
          
          const gradient = bgCtx.createRadialGradient(
            dot.x, dot.y, 0,
            dot.x, dot.y, dot.radius * 2.5
          );
          
          const color = getColorVariant(dot.color, isDark ? "300" : "400");
          gradient.addColorStop(0, color + "CC");
          gradient.addColorStop(0.7, color + "44");
          gradient.addColorStop(1, color + "00");

          bgCtx.beginPath();
          bgCtx.arc(dot.x, dot.y, dot.radius * 2, 0, Math.PI * 2);
          bgCtx.fillStyle = gradient;
          bgCtx.fill();
        });
        
        backgroundNeedsUpdateRef.current = false;
      }

      // Copiar fondo al canvas principal
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bgCanvas, 0, 0);

      // Dibujar gota de agua mejorada y más realista
      if (mousePos.x >= 0 && mousePos.y >= 0) {
        const wobble = Math.sin(currentTime * 3) * 2;
        const dripLength = 20 + Math.abs(Math.sin(currentTime * 2)) * 8;

        // Definir parámetros de la forma de lágrima más realista
        const baseWidth = dropRadius * 0.7;
        const totalHeight = dropRadius * 1.5 + dripLength;
        const dropX = mousePos.x + wobble * 0.5;
        const dropTop = mousePos.y - dropRadius * 0.6;
        const dropBottom = dropTop + totalHeight;
        const dropMid = dropTop + totalHeight * 0.55; // Ligeramente sesgado para bulbo superior

        // Crear máscara de gota con curvas bezier para forma de lágrima
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(dropX, dropBottom); // Punta inferior
        ctx.quadraticCurveTo(dropX - baseWidth, dropBottom, dropX - baseWidth, dropMid); // Lado izquierdo inferior
        ctx.quadraticCurveTo(dropX - baseWidth, dropTop, dropX, dropTop); // Lado izquierdo superior a la cima
        ctx.quadraticCurveTo(dropX + baseWidth, dropTop, dropX + baseWidth, dropMid); // Lado derecho superior a medio
        ctx.quadraticCurveTo(dropX + baseWidth, dropBottom, dropX, dropBottom); // Lado derecho inferior a punta
        ctx.closePath();
        ctx.clip();

        // Contenido magnificado con efecto de refracción sutil (filtro)
        const sourceWidth = (baseWidth * 2) / magnification;
        const sourceHeight = totalHeight / magnification;
        const targetWidth = baseWidth * 2;
        const targetHeight = totalHeight;

        ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.2)';
        ctx.drawImage(
          bgCanvas,
          mousePos.x - sourceWidth / 2,
          mousePos.y - sourceHeight / 2,
          sourceWidth,
          sourceHeight,
          dropX - baseWidth,
          dropTop,
          targetWidth,
          targetHeight
        );
        ctx.filter = 'none';

        ctx.restore();

        // Borde de la gota con efecto 3D mejorado
        const borderGradient = ctx.createRadialGradient(
          dropX - baseWidth * 0.3, dropTop + totalHeight * 0.2, 0,
          dropX, mousePos.y, baseWidth * 1.1
        );
        
        if (isDark) {
          borderGradient.addColorStop(0, "rgba(200, 240, 255, 0.95)");
          borderGradient.addColorStop(0.6, "rgba(100, 200, 255, 0.7)");
          borderGradient.addColorStop(1, "rgba(50, 150, 255, 0.4)");
        } else {
          borderGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          borderGradient.addColorStop(0.6, "rgba(0, 150, 255, 0.6)");
          borderGradient.addColorStop(1, "rgba(0, 100, 200, 0.4)");
        }

        ctx.beginPath();
        ctx.moveTo(dropX, dropBottom);
        ctx.quadraticCurveTo(dropX - baseWidth, dropBottom, dropX - baseWidth, dropMid);
        ctx.quadraticCurveTo(dropX - baseWidth, dropTop, dropX, dropTop);
        ctx.quadraticCurveTo(dropX + baseWidth, dropTop, dropX + baseWidth, dropMid);
        ctx.quadraticCurveTo(dropX + baseWidth, dropBottom, dropX, dropBottom);
        ctx.closePath();
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Brillo superior mejorado
        const highlightGradient = ctx.createRadialGradient(
          dropX - baseWidth * 0.4, dropTop + totalHeight * 0.15, 0,
          dropX - baseWidth * 0.4, dropTop + totalHeight * 0.15, baseWidth * 0.6
        );
        highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.85)");
        highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.beginPath();
        ctx.arc(dropX - baseWidth * 0.4, dropTop + totalHeight * 0.15, baseWidth * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = highlightGradient;
        ctx.fill();

        // Brillo inferior pequeño para realismo
        const bottomHighlightGradient = ctx.createRadialGradient(
          dropX, dropBottom - totalHeight * 0.3, 0,
          dropX, dropBottom - totalHeight * 0.3, baseWidth * 0.3
        );
        bottomHighlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        bottomHighlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.beginPath();
        ctx.arc(dropX, dropBottom - totalHeight * 0.3, baseWidth * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = bottomHighlightGradient;
        ctx.fill();

        // Generar gotas ocasionalmente
        if (Math.random() < 0.02 && dripsRef.current.length < 5) {
          dripsRef.current.push({
            x: dropX + (Math.random() - 0.5) * baseWidth * 0.1,
            y: dropBottom,
            vy: Math.random() * 0.5 + 0.3,
            radius: Math.random() * 2 + 1,
            color: getColorVariant("blue", isDark ? "200" : "600"),
            life: 180,
            opacity: 0.9,
          });
        }
      }

      // Actualizar y dibujar gotas cayendo
      dripsRef.current = dripsRef.current.map((drip) => {
        drip.y += drip.vy;
        drip.vy += 0.02; // Gravedad
        drip.life -= 1;
        drip.opacity = Math.max(0, drip.life / 180);
        return drip;
      }).filter((drip) => drip.life > 0 && drip.y < canvas.height + 20);

      dripsRef.current.forEach((drip) => {
        const gradient = ctx.createRadialGradient(
          drip.x, drip.y, 0,
          drip.x, drip.y, drip.radius * 2
        );
        gradient.addColorStop(0, drip.color + "FF");
        gradient.addColorStop(1, drip.color + "00");
        
        ctx.beginPath();
        ctx.arc(drip.x, drip.y, drip.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
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
          ? "from-cyan-900 via-blue-900 to-indigo-900"
          : "from-cyan-50 via-blue-50 to-indigo-50"
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