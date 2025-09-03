import React, { useState, useEffect, useRef } from "react";
import { BaseBackground } from "./utils";

// Fondo Líquido Minimalista - Recreado
const InteractiveFluidBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const dropletsRef = useRef([]);
  const ripples = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePos({ 
          x: e.clientX - rect.left, 
          y: e.clientY - rect.top 
        });
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastMouse = { x: 0, y: 0 };
    let time = 0;

    const animate = () => {
      // Fade suave para persistencia
      ctx.fillStyle = isDark 
        ? 'rgba(15, 23, 42, 0.05)' 
        : 'rgba(248, 250, 252, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Crear ondas al mover el mouse
      const dx = mousePos.x - lastMouse.x;
      const dy = mousePos.y - lastMouse.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);

      if (velocity > 2) {
        // Crear gotas líquidas
        for (let i = 0; i < Math.min(3, Math.floor(velocity / 5)); i++) {
          dropletsRef.current.push({
            x: mousePos.x + (Math.random() - 0.5) * 20,
            y: mousePos.y + (Math.random() - 0.5) * 20,
            vx: dx * 0.1 + (Math.random() - 0.5) * 2,
            vy: dy * 0.1 + (Math.random() - 0.5) * 2,
            size: Math.random() * 8 + 4,
            life: 1,
            decay: 0.005 + Math.random() * 0.01
          });
        }

        // Crear ondas expansivas
        if (isPressed) {
          ripples.current.push({
            x: mousePos.x,
            y: mousePos.y,
            radius: 0,
            maxRadius: 80 + velocity * 2,
            life: 1,
            decay: 0.02
          });
        }
      }

      // Actualizar y dibujar gotas
      dropletsRef.current = dropletsRef.current.filter(droplet => {
        droplet.x += droplet.vx;
        droplet.y += droplet.vy;
        droplet.vx *= 0.98; // Fricción
        droplet.vy *= 0.98;
        droplet.life -= droplet.decay;

        if (droplet.life > 0) {
          const alpha = droplet.life;
          const gradient = ctx.createRadialGradient(
            droplet.x, droplet.y, 0,
            droplet.x, droplet.y, droplet.size
          );
          
          if (isDark) {
            gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha * 0.8})`);
            gradient.addColorStop(0.5, `rgba(147, 51, 234, ${alpha * 0.4})`);
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          } else {
            gradient.addColorStop(0, `rgba(56, 189, 248, ${alpha * 0.6})`);
            gradient.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 0.3})`);
            gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
          }

          ctx.beginPath();
          ctx.arc(droplet.x, droplet.y, droplet.size, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          return true;
        }
        return false;
      });

      // Actualizar y dibujar ondas
      ripples.current = ripples.current.filter(ripple => {
        ripple.radius += (ripple.maxRadius - ripple.radius) * 0.1;
        ripple.life -= ripple.decay;

        if (ripple.life > 0) {
          const alpha = ripple.life * 0.5;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = isDark 
            ? `rgba(99, 102, 241, ${alpha})` 
            : `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          return true;
        }
        return false;
      });

      // Efecto de ondas de fondo suaves
      const waveTime = time * 0.01;
      for (let i = 0; i < 3; i++) {
        const waveY = canvas.height * (0.3 + i * 0.2) + Math.sin(waveTime + i) * 20;
        const gradient = ctx.createLinearGradient(0, waveY - 30, 0, waveY + 30);
        
        if (isDark) {
          gradient.addColorStop(0, 'rgba(30, 41, 59, 0)');
          gradient.addColorStop(0.5, 'rgba(51, 65, 85, 0.1)');
          gradient.addColorStop(1, 'rgba(30, 41, 59, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(241, 245, 249, 0)');
          gradient.addColorStop(0.5, 'rgba(226, 232, 240, 0.1)');
          gradient.addColorStop(1, 'rgba(241, 245, 249, 0)');
        }

        ctx.beginPath();
        ctx.moveTo(0, waveY);
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = waveY + Math.sin((x * 0.01) + waveTime + i) * 15;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      lastMouse = { ...mousePos };
      time++;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos, isPressed, isDark]);

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-slate-900 via-blue-900 to-indigo-900"
          : "from-blue-50 via-sky-50 to-indigo-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-pointer"
      />
    </BaseBackground>
  );
};

export { InteractiveFluidBackground };