import React, { useState, useEffect, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 12. Aurora Boreal (Northern Lights)
// Improved Aurora Background with smoothed mouse response and light particles
const AuroraBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const wavesRef = useRef([]);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const smoothedMouse = useRef({ x: 0, y: 0 });

  // Manejar eventos del mouse
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

    // Inicializar ondas de aurora
    const initWaves = () => {
      wavesRef.current = [];
      const numWaves = 8;
      
      for (let i = 0; i < numWaves; i++) {
        const colors = ['green', 'blue', 'purple', 'pink', 'teal', 'indigo'];
        wavesRef.current.push({
          points: [],
          color: colors[Math.floor(Math.random() * colors.length)],
          intensity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.02 + 0.01,
          amplitude: Math.random() * 80 + 40,
          frequency: Math.random() * 0.008 + 0.004,
          yOffset: canvas.height * 0.3 + Math.random() * canvas.height * 0.4,
          phase: Math.random() * Math.PI * 2,
          thickness: Math.random() * 30 + 20,
          opacity: Math.random() * 0.6 + 0.3
        });
      }
    };

    initWaves();

    // Función para generar puntos de onda suaves
    const generateWavePoints = (wave, time, mouseInfluence) => {
      const points = [];
      const numPoints = 60;
      
      for (let i = 0; i <= numPoints; i++) {
        const x = (canvas.width / numPoints) * i;
        const baseY = wave.yOffset;
        
        // Onda base con múltiples frecuencias para más naturalidad
        const mainWave = Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
        const secondWave = Math.sin(x * wave.frequency * 2 + time * wave.speed * 0.7) * wave.amplitude * 0.3;
        const thirdWave = Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 1.3) * wave.amplitude * 0.5;
        
        // Influencia del mouse
        const mouseDistance = Math.sqrt((x - mousePos.x) ** 2 + (baseY - mousePos.y) ** 2);
        const mouseEffect = Math.max(0, (200 - mouseDistance) / 200) * mouseInfluence * 30;
        
        const y = baseY + mainWave + secondWave + thirdWave + mouseEffect;
        points.push({ x, y });
      }
      
      return points;
    };

    // Función para dibujar onda con gradiente
    const drawWave = (ctx, wave, points) => {
      if (points.length < 2) return;

      // Crear gradiente vertical para la aurora
      const gradient = ctx.createLinearGradient(0, wave.yOffset - wave.amplitude, 0, wave.yOffset + wave.amplitude);
      
      const baseColor = getColorVariant(wave.color, isDark ? "400" : "500");
      const lightColor = getColorVariant(wave.color, isDark ? "300" : "400");
      const darkColor = getColorVariant(wave.color, isDark ? "600" : "700");
      
      gradient.addColorStop(0, `${lightColor}00`); // Transparente arriba
      gradient.addColorStop(0.3, `${lightColor}${Math.floor(wave.opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.7, `${baseColor}${Math.floor(wave.opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${darkColor}00`); // Transparente abajo

      // Dibujar la onda principal
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      // Usar curvas cuadráticas para suavizar la línea
      for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      
      // Completar la forma para crear área filleable
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Dibujar línea brillante en el borde superior
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      
      ctx.strokeStyle = `${lightColor}${Math.floor(wave.intensity * 128).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // Animación principal
    const animate = () => {
      // Limpiar canvas con fade muy sutil
      ctx.fillStyle = isDark
        ? "rgba(5, 5, 20, 0.05)"
        : "rgba(240, 240, 255, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;
      const mouseInfluence = Math.sin(time * 2) * 0.5 + 0.5; // Oscila entre 0 y 1

      // Actualizar y dibujar ondas de aurora
      wavesRef.current.forEach((wave, index) => {
        // Variar la intensidad con el tiempo para efecto de pulsación
        wave.intensity = 0.3 + Math.sin(time * 0.5 + index) * 0.4 + 0.3;
        wave.opacity = 0.2 + Math.sin(time * 0.3 + index * 0.5) * 0.3 + 0.3;
        
        // Influencia del mouse en la intensidad
        const mouseDistance = Math.sqrt((canvas.width / 2 - mousePos.x) ** 2 + (wave.yOffset - mousePos.y) ** 2);
        const mouseIntensityBoost = Math.max(0, (300 - mouseDistance) / 300) * 0.5;
        wave.intensity += mouseIntensityBoost;
        
        // Generar puntos de onda
        const points = generateWavePoints(wave, time, mouseInfluence);
        wave.points = points;
        
        // Dibujar onda
        drawWave(ctx, wave, points);
      });

      // Añadir estrellas de fondo ocasionalmente
      if (Math.random() < 0.02) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.4; // Solo en la parte superior
        const size = Math.random() * 2 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${Math.random() * 0.8})` : `rgba(200, 200, 255, ${Math.random() * 0.6})`;
        ctx.fill();
      }

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
          ? "from-gray-900 via-blue-900 to-purple-900"
          : "from-blue-50 via-purple-50 to-pink-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { AuroraBackground };