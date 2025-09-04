import React, { useState, useEffect, useCallback, useRef } from "react";
import { BaseBackground } from "./utils";

// Fondo de Ondas Borrosas Mejorado con Efectos Visuales Espectaculares
const BlurryWavesBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const wavesRef = useRef([]);
  const particlesRef = useRef([]);

  // Paletas de colores mejoradas y más vibrantes
  const colorPalettes = {
    light: {
      waves: [
        { primary: 'rgba(255, 107, 107, 0.4)', secondary: 'rgba(255, 159, 67, 0.3)', accent: 'rgba(255, 206, 84, 0.2)' },
        { primary: 'rgba(72, 219, 251, 0.4)', secondary: 'rgba(116, 185, 255, 0.3)', accent: 'rgba(162, 155, 254, 0.2)' },
        { primary: 'rgba(129, 236, 236, 0.4)', secondary: 'rgba(116, 185, 255, 0.3)', accent: 'rgba(255, 107, 107, 0.2)' },
        { primary: 'rgba(255, 159, 243, 0.4)', secondary: 'rgba(255, 107, 107, 0.3)', accent: 'rgba(255, 206, 84, 0.2)' },
        { primary: 'rgba(161, 255, 206, 0.4)', secondary: 'rgba(129, 236, 236, 0.3)', accent: 'rgba(116, 185, 255, 0.2)' },
        { primary: 'rgba(255, 206, 84, 0.4)', secondary: 'rgba(255, 159, 243, 0.3)', accent: 'rgba(161, 255, 206, 0.2)' }
      ],
      particles: 'rgba(255, 255, 255, 0.6)',
      background: ['rgba(255, 245, 245, 0.1)', 'rgba(245, 255, 250, 0.1)', 'rgba(245, 250, 255, 0.1)']
    },
    dark: {
      waves: [
        { primary: 'rgba(139, 69, 19, 0.6)', secondary: 'rgba(255, 140, 0, 0.4)', accent: 'rgba(255, 215, 0, 0.3)' },
        { primary: 'rgba(25, 25, 112, 0.6)', secondary: 'rgba(65, 105, 225, 0.4)', accent: 'rgba(138, 43, 226, 0.3)' },
        { primary: 'rgba(0, 100, 0, 0.6)', secondary: 'rgba(50, 205, 50, 0.4)', accent: 'rgba(0, 255, 127, 0.3)' },
        { primary: 'rgba(220, 20, 60, 0.6)', secondary: 'rgba(255, 20, 147, 0.4)', accent: 'rgba(255, 105, 180, 0.3)' },
        { primary: 'rgba(75, 0, 130, 0.6)', secondary: 'rgba(138, 43, 226, 0.4)', accent: 'rgba(186, 85, 211, 0.3)' },
        { primary: 'rgba(0, 139, 139, 0.6)', secondary: 'rgba(0, 206, 209, 0.4)', accent: 'rgba(64, 224, 208, 0.3)' }
      ],
      particles: 'rgba(255, 255, 255, 0.8)',
      background: ['rgba(15, 23, 42, 0.1)', 'rgba(30, 41, 59, 0.1)', 'rgba(51, 65, 85, 0.1)']
    }
  };

  const initializeWaves = useCallback(() => {
    if (typeof window === "undefined") return [];

    const numWaves = 10;
    const newWaves = [];
    const palette = isDark ? colorPalettes.dark : colorPalettes.light;

    for (let i = 0; i < numWaves; i++) {
      const colorSet = palette.waves[i % palette.waves.length];
      newWaves.push({
        amplitude: Math.random() * 40 + 20,
        frequency: Math.random() * 0.012 + 0.004,
        phase: Math.random() * Math.PI * 2,
        yOffset: (window.innerHeight / (numWaves + 1)) * (i + 1) + Math.random() * 60 - 30,
        primaryColor: colorSet.primary,
        secondaryColor: colorSet.secondary,
        accentColor: colorSet.accent,
        speed: Math.random() * 0.012 + 0.004,
        blurAmount: Math.random() * 12 + 6,
        opacity: Math.random() * 0.3 + 0.4,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }

    return newWaves;
  }, [isDark]);

  const initializeParticles = useCallback(() => {
    if (typeof window === "undefined") return [];

    const particles = [];
    const numParticles = 50;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    return particles;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    wavesRef.current = initializeWaves();
    particlesRef.current = initializeParticles();

    const handleResize = () => {
      wavesRef.current = initializeWaves();
      particlesRef.current = initializeParticles();
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
  }, [initializeWaves, initializeParticles]);

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
    const palette = isDark ? colorPalettes.dark : colorPalettes.light;

    const animate = () => {
      // Fondo con gradiente dinámico
      const bgGradient = ctx.createRadialGradient(
        mousePos.x, mousePos.y, 0,
        mousePos.x, mousePos.y, Math.max(canvas.width, canvas.height) * 0.8
      );
      bgGradient.addColorStop(0, palette.background[0]);
      bgGradient.addColorStop(0.5, palette.background[1]);
      bgGradient.addColorStop(1, palette.background[2]);
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Actualizar y dibujar partículas flotantes
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Rebote en bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Efecto de pulsación
        const pulse = Math.sin(time * particle.pulseSpeed + particle.pulseOffset) * 0.3 + 0.7;
        const currentOpacity = particle.opacity * pulse;

        // Dibujar partícula con halo
        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        particleGradient.addColorStop(0, palette.particles.replace('0.8', currentOpacity.toString()));
        particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();
      });

      const waves = wavesRef.current;

      // Actualizar fases de ondas
      wavesRef.current = waves.map((wave) => ({
        ...wave,
        phase: wave.phase + wave.speed,
      }));

      // Dibujar ondas con efectos mejorados
      waves.forEach((wave, index) => {
        ctx.save();
        
        // Blur dinámico
        const dynamicBlur = wave.blurAmount + Math.sin(time * wave.pulseSpeed) * 3;
        ctx.filter = `blur(${dynamicBlur}px)`;
        
        ctx.beginPath();
        ctx.moveTo(0, wave.yOffset);

        // Crear path de la onda con más detalle
        for (let x = 0; x <= canvas.width; x += 1) {
          let y = wave.yOffset + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;

          // Múltiples capas de distorsión
          const secondaryWave = Math.sin(x * wave.frequency * 2 + wave.phase * 1.5) * (wave.amplitude * 0.3);
          const tertiaryWave = Math.sin(x * wave.frequency * 0.5 + wave.phase * 0.8) * (wave.amplitude * 0.2);
          y += secondaryWave + tertiaryWave;

          // Distorsión por mouse más suave y extendida
          const dx = mousePos.x - x;
          const dy = mousePos.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 400) {
            const force = (400 - distance) / 400 * 25;
            const angle = Math.atan2(dy, dx);
            y += Math.sin(distance * 0.02 + time * 0.1) * force * Math.sin(angle);
          }

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        // Gradiente complejo con tres colores
        const complexGradient = ctx.createLinearGradient(0, wave.yOffset - wave.amplitude, 0, canvas.height);
        
        // Pulsación de opacidad
        const pulse = Math.sin(time * wave.pulseSpeed) * 0.2 + 0.8;
        const currentOpacity = wave.opacity * pulse;
        
        complexGradient.addColorStop(0, wave.primaryColor.replace(/[\d\.]+\)$/, `${currentOpacity})`));
        complexGradient.addColorStop(0.4, wave.secondaryColor.replace(/[\d\.]+\)$/, `${currentOpacity * 0.8})`));
        complexGradient.addColorStop(0.7, wave.accentColor.replace(/[\d\.]+\)$/, `${currentOpacity * 0.6})`));
        complexGradient.addColorStop(1, isDark ? 'rgba(15, 23, 42, 0.05)' : 'rgba(248, 250, 252, 0.05)');

        ctx.fillStyle = complexGradient;
        ctx.fill();
        
        // Borde superior brillante
        ctx.strokeStyle = wave.primaryColor.replace(/[\d\.]+\)$/, `${currentOpacity * 0.6})`);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
      });

      // Efectos de luz adicionales
      if (mousePos.x > 0 && mousePos.y > 0) {
        const lightGradient = ctx.createRadialGradient(
          mousePos.x, mousePos.y, 0,
          mousePos.x, mousePos.y, 200
        );
        lightGradient.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)');
        lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      time += 0.02;
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