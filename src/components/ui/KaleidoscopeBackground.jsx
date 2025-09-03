import React, { useState, useEffect, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// Improved Kaleidoscope Background with better visibility, spread, and dynamic effects
const KaleidoscopeBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const patternsRef = useRef([]);
  const rotationRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const initPatterns = () => {
      patternsRef.current = [];
      const numLayers = 8;
      for (let i = 0; i < numLayers; i++) {
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'];
        patternsRef.current.push({
          shapes: [],
          color: colors[Math.floor(Math.random() * colors.length)],
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          scale: Math.random() * 0.6 + 0.4,
          segments: 8 + Math.floor(Math.random() * 4),
          radius: Math.min(canvas.width, canvas.height) / 2,
          centerOffset: Math.random() * 100,
          opacity: Math.random() * 0.7 + 0.3,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2
        });

        const numShapes = Math.floor(Math.random() * 10) + 6;
        for (let j = 0; j < numShapes; j++) {
          patternsRef.current[i].shapes.push({
            type: ['triangle', 'circle', 'square', 'diamond', 'star'][Math.floor(Math.random() * 5)],
            x: Math.random() * canvas.width - canvas.width / 2,
            y: Math.random() * canvas.height - canvas.height / 2,
            size: Math.random() * 30 + 10,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05
          });
        }
      }
    };

    initPatterns();

    const drawShape = (ctx, shape, color, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      switch (shape.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;

        case 'triangle':
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            const x = Math.cos(angle) * shape.size;
            const y = Math.sin(angle) * shape.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;

        case 'square':
          ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
          ctx.strokeRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
          break;

        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size, 0);
          ctx.lineTo(0, shape.size);
          ctx.lineTo(-shape.size, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'star':
          ctx.beginPath();
          for (let k = 0; k < 10; k++) {
            const angle = (k * Math.PI) / 5;
            const r = k % 2 === 0 ? shape.size : shape.size / 2;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          ctx.stroke();
      }

      ctx.restore();
    };

    const drawKaleidoscopeSegment = (ctx, pattern, time, mouseInfluence) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Rotación influenciada por el mouse
      const mouseRotation = (mousePos.x / canvas.width) * Math.PI * 2 * mouseInfluence;
      const baseRotation = time * pattern.rotationSpeed;
      ctx.rotate(baseRotation + mouseRotation);

      // Pulsación basada en el tiempo
      const pulse = Math.sin(time * pattern.pulseSpeed + pattern.pulsePhase) * 0.3 + 0.7;
      const scale = pattern.scale * pulse;
      ctx.scale(scale, scale);

      // Crear clipping path para el segmento
      const segmentAngle = (Math.PI * 2) / pattern.segments;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, pattern.radius * 2, 0, segmentAngle);
      ctx.closePath();
      ctx.clip();

      // Dibujar las formas en este segmento
      pattern.shapes.forEach(shape => {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation + time * shape.rotationSpeed);

        const color = getColorVariant(pattern.color, isDark ? "400" : "600");
        const opacity = pattern.opacity * pulse * (0.5 + mouseInfluence * 0.5);

        drawShape(ctx, shape, color, opacity);
        ctx.restore();
      });

      ctx.restore();
    };

    const drawKaleidoscope = (ctx, pattern, time, mouseInfluence) => {
      // Dibujar todos los segmentos rotados
      for (let i = 0; i < pattern.segments; i++) {
        ctx.save();
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.translate(centerX, centerY);
        
        const segmentAngle = (Math.PI * 2 / pattern.segments) * i;
        ctx.rotate(segmentAngle);
        
        // Alternar la reflexión para crear efecto kaleidoscópico
        if (i % 2 === 1) {
          ctx.scale(1, -1);
        }
        
        ctx.translate(-centerX, -centerY);
        
        drawKaleidoscopeSegment(ctx, pattern, time, mouseInfluence);
        ctx.restore();
      }
    };

    const animate = () => {
      ctx.fillStyle = isDark ? "rgba(5, 5, 20, 0.05)" : "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const mouseDistance = Math.sqrt((mousePos.x - centerX) ** 2 + (mousePos.y - centerY) ** 2);
      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
      const mouseInfluence = Math.min(1, mouseDistance / maxDistance);

      rotationRef.current += 0.002 + mouseInfluence * 0.005;

      patternsRef.current.forEach((pattern, index) => {
        pattern.shapes.forEach(shape => {
          shape.rotation += shape.rotationSpeed;
        });
        drawKaleidoscope(ctx, pattern, time + index * 0.3, mouseInfluence);
      });

      // Added dynamic gradient overlay for better visibility
      const overlayGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxDistance);
      overlayGradient.addColorStop(0, 'transparent');
      overlayGradient.addColorStop(1, isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)');
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
          ? "from-purple-900 via-pink-900 to-red-900"
          : "from-purple-50 via-pink-50 to-red-50"
      }
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto" />
    </BaseBackground>
  );
};

export { KaleidoscopeBackground };