import React, { useState, useEffect, useCallback, useRef } from "react";
import { BaseBackground } from "./utils";

// Fondo de Ondas Borrosas con Colores Hermosos - Versión Mejorada
const BlurryWavesBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const wavesRef = useRef([]);

  // Paleta de colores hermosos y armoniosos
  const beautifulColors = {
    light: [
      { primary: 'rgba(255, 182, 193, 0.4)', secondary: 'rgba(255, 218, 185, 0.3)' }, // Rosa suave + Melocotón
      { primary: 'rgba(173, 216, 230, 0.4)', secondary: 'rgba(221, 160, 221, 0.3)' }, // Azul cielo + Lavanda
      { primary: 'rgba(152, 251, 152, 0.4)', secondary: 'rgba(175, 238, 238, 0.3)' }, // Verde menta + Turquesa pálido
      { primary: 'rgba(255, 228, 181, 0.4)', secondary: 'rgba(255, 192, 203, 0.3)' }, // Dorado suave + Rosa claro
      { primary: 'rgba(230, 230, 250, 0.4)', secondary: 'rgba(255, 240, 245, 0.3)' }, // Lavanda + Rosa muy suave
    ],
    dark: [
      { primary: 'rgba(72, 61, 139, 0.6)', secondary: 'rgba(123, 104, 238, 0.4)' }, // Púrpura profundo + Violeta medio
      { primary: 'rgba(25, 25, 112, 0.6)', secondary: 'rgba(65, 105, 225, 0.4)' }, // Azul medianoche + Azul real
      { primary: 'rgba(0, 100, 0, 0.6)', secondary: 'rgba(46, 139, 87, 0.4)' }, // Verde bosque + Verde mar
      { primary: 'rgba(139, 69, 19, 0.6)', secondary: 'rgba(205, 133, 63, 0.4)' }, // Marrón + Cobre
      { primary: 'rgba(75, 0, 130, 0.6)', secondary: 'rgba(138, 43, 226, 0.4)' }, // Índigo + Violeta azul
    ]
  };

  // Inicializar ondas con colores hermosos
  const initializeWaves = useCallback(() => {
    if (typeof window === "undefined") return [];

    const numWaves = 8; // Reducido para mejor rendimiento
    const newWaves = [];
    const colorPalette = isDark ? beautifulColors.dark : beautifulColors.light;

    for (let i = 0; i < numWaves; i++) {
      const colorSet = colorPalette[i % colorPalette.length];
      newWaves.push({
        amplitude: Math.random() * 30 + 15,
        frequency: Math.random() * 0.008 + 0.003,
        phase: Math.random() * Math.PI * 2,
        yOffset: (window.innerHeight / (numWaves + 1)) * (i + 1) + Math.random() * 40 - 20,
        primaryColor: colorSet.primary,
        secondaryColor: colorSet.secondary,
        speed: Math.random() * 0.008 + 0.003,
        blurAmount: Math.random() * 8 + 4,
      });
    }

    return newWaves;
  }, [isDark]);

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
      // Fade suave en lugar de clear completo
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.1)' : 'rgba(248, 250, 252, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const waves = wavesRef.current;

      // Actualizar fases de ondas
      wavesRef.current = waves.map((wave) => ({
        ...wave,
        phase: wave.phase + wave.speed,
      }));

      // Dibujar ondas con gradientes hermosos
      waves.forEach((wave, index) => {
        ctx.save();
        
        // Aplicar blur individual por onda
        ctx.filter = `blur(${wave.blurAmount}px)`;
        
        ctx.beginPath();
        ctx.moveTo(0, wave.yOffset);

        // Crear path de la onda
        for (let x = 0; x <= canvas.width; x += 2) { // Optimización: saltar píxeles
          let y = wave.yOffset + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;

          // Distorsión suave por mouse
          const dx = mousePos.x - x;
          const dy = mousePos.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 250) {
            const force = (250 - distance) / 250 * 15;
            y += Math.sin(distance * 0.03 + time * 0.08) * force;
          }

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        // Crear gradiente vertical hermoso
        const gradient = ctx.createLinearGradient(0, wave.yOffset - wave.amplitude, 0, canvas.height);
        gradient.addColorStop(0, wave.primaryColor);
        gradient.addColorStop(0.6, wave.secondaryColor);
        gradient.addColorStop(1, isDark ? 'rgba(15, 23, 42, 0.1)' : 'rgba(248, 250, 252, 0.1)');

        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.restore();
      });

      time += 0.03;
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
          ? "from-slate-900 via-purple-900 to-slate-900"
          : "from-rose-50 via-sky-50 to-teal-50"
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