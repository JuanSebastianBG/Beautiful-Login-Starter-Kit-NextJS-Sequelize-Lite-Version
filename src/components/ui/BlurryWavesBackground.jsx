import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// Fondo de Ondas Borrosas Interactivas (Nuevo y Creativo: Ondas que se distorsionan con el mouse como agua)
const BlurryWavesBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const wavesRef = useRef([]);  // Ondas como ref

  // Inicializar ondas sinusoidales
  const initializeWaves = useCallback(() => {
    if (typeof window === "undefined") return [];

    const numWaves = 10;  // Pocas ondas para minimalismo y bajo rendimiento
    const newWaves = [];

    for (let i = 0; i < numWaves; i++) {
      newWaves.push({
        amplitude: Math.random() * 20 + 10,  // Amplitud variada
        frequency: Math.random() * 0.01 + 0.005,  // Frecuencia baja para movimiento suave
        phase: Math.random() * Math.PI * 2,  // Fase aleatoria
        yOffset: (window.innerHeight / numWaves) * i + Math.random() * 50 - 25,  // Posiciones verticales espaciadas
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,  // Velocidad de fase lenta
      });
    }

    return newWaves;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    wavesRef.current = initializeWaves();

    const handleResize = () => {
      wavesRef.current = initializeWaves();
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
  }, [initializeWaves]);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined" || wavesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aplicar blur para efecto suave y etéreo
      ctx.filter = "blur(10px)";  // Blur más pronunciado para ondas dreamy

      const waves = wavesRef.current;

      // Actualizar fases de ondas
      wavesRef.current = waves.map((wave) => ({
        ...wave,
        phase: wave.phase + wave.speed,
      }));

      // Dibujar ondas
      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, wave.yOffset);

        for (let x = 0; x < canvas.width; x++) {
          let y = wave.yOffset + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;

          // Distorsión por mouse: como ripple en agua
          const dx = mousePos.x - x;
          const dy = mousePos.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 300) {
            const force = (300 - distance) / 300 * 20;  // Distorsión suave
            y += Math.sin(distance * 0.05 + time * 0.1) * force;  // Efecto ondulante interactivo
          }

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        ctx.fillStyle = getColorVariant(wave.color, isDark ? "500" : "400");  // Colores vibrantes pero suaves
        ctx.globalAlpha = 0.3;  // Transparencia para layering minimalista
        ctx.fill();
      });

      // Reset filtros
      ctx.filter = "none";
      ctx.globalAlpha = 1;

      time += 0.05;  // Incremento de tiempo para animación

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
          ? "from-blue-900 via-teal-900 to-green-900"
          : "from-teal-50 via-blue-50 to-cyan-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { BlurryWavesBackground };