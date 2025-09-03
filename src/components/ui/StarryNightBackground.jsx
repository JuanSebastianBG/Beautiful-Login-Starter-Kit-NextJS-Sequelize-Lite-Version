import React, { useState, useEffect, useRef } from "react";
import { BaseBackground } from "./utils";

// Fondo de Noche Estrellada con Constelaciones y Cometas - Corregido
const StarryNightBackground = ({ isDark = true }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 }); // Usar ref en lugar de state
  const [hoveredStar, setHoveredStar] = useState(null);
  const starsRef = useRef([]);
  const constellationsRef = useRef([]);
  const cometsRef = useRef([]);
  const rotationRef = useRef(0);

  // Constelaciones famosas (simplificadas)
  const constellationPatterns = [
    // Osa Mayor
    [
      { x: 0.2, y: 0.3 }, { x: 0.25, y: 0.28 }, { x: 0.3, y: 0.26 },
      { x: 0.35, y: 0.28 }, { x: 0.32, y: 0.35 }, { x: 0.27, y: 0.37 }, { x: 0.22, y: 0.35 }
    ],
    // Orión
    [
      { x: 0.7, y: 0.4 }, { x: 0.72, y: 0.35 }, { x: 0.74, y: 0.3 },
      { x: 0.68, y: 0.45 }, { x: 0.76, y: 0.45 }, { x: 0.7, y: 0.5 }, { x: 0.74, y: 0.52 }
    ],
    // Casiopea
    [
      { x: 0.5, y: 0.15 }, { x: 0.52, y: 0.12 }, { x: 0.55, y: 0.14 },
      { x: 0.58, y: 0.11 }, { x: 0.61, y: 0.13 }
    ],
    // Cruz del Sur
    [
      { x: 0.8, y: 0.7 }, { x: 0.82, y: 0.65 }, { x: 0.84, y: 0.75 },
      { x: 0.78, y: 0.72 }, { x: 0.86, y: 0.68 }
    ]
  ];

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Manejar mouse move directamente en el canvas
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars();
    };

    const initializeStars = () => {
      starsRef.current = [];
      constellationsRef.current = [];
      cometsRef.current = [];

      // Crear estrellas de fondo aleatorias
      const numStars = 200;
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          brightness: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
          isConstellation: false
        });
      }

      // Crear constelaciones
      constellationPatterns.forEach((pattern, constellationIndex) => {
        const constellation = [];
        pattern.forEach((point, starIndex) => {
          const star = {
            x: point.x * canvas.width,
            y: point.y * canvas.height,
            size: Math.random() * 3 + 2,
            brightness: Math.random() * 0.3 + 0.7,
            twinkleSpeed: Math.random() * 0.015 + 0.008,
            twinkleOffset: Math.random() * Math.PI * 2,
            isConstellation: true,
            constellationIndex,
            starIndex
          };
          constellation.push(star);
          starsRef.current.push(star);
        });
        constellationsRef.current.push(constellation);
      });

      // Crear cometas iniciales
      for (let i = 0; i < 3; i++) {
        createComet();
      }
    };

    const createComet = () => {
      const side = Math.floor(Math.random() * 4);
      let startX, startY, endX, endY;

      switch (side) {
        case 0: // Desde arriba
          startX = Math.random() * canvas.width;
          startY = -50;
          endX = Math.random() * canvas.width;
          endY = canvas.height + 50;
          break;
        case 1: // Desde derecha
          startX = canvas.width + 50;
          startY = Math.random() * canvas.height;
          endX = -50;
          endY = Math.random() * canvas.height;
          break;
        case 2: // Desde abajo
          startX = Math.random() * canvas.width;
          startY = canvas.height + 50;
          endX = Math.random() * canvas.width;
          endY = -50;
          break;
        case 3: // Desde izquierda
          startX = -50;
          startY = Math.random() * canvas.height;
          endX = canvas.width + 50;
          endY = Math.random() * canvas.height;
          break;
      }

      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = Math.random() * 2 + 1;

      cometsRef.current.push({
        x: startX,
        y: startY,
        vx: (dx / distance) * speed,
        vy: (dy / distance) * speed,
        size: Math.random() * 3 + 2,
        tail: [],
        life: 1,
        decay: 0.002 + Math.random() * 0.003
      });
    };

    const drawStar = (ctx, star, time) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
      const brightness = star.brightness * twinkle;
      
      // Verificar hover usando mouseRef
      const dx = mouseRef.current.x - star.x;
      const dy = mouseRef.current.y - star.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isHovered = distance < 20;
      
      if (isHovered && star.isConstellation) {
        setHoveredStar(star);
      }

      const size = star.size * (isHovered ? 1.5 : 1);
      const alpha = brightness * (isHovered ? 1 : 0.8);

      // Dibujar halo
      const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3);
      gradient.addColorStop(0, `rgba(255, 255, 150, ${alpha * 0.8})`);
      gradient.addColorStop(0.3, `rgba(255, 255, 100, ${alpha * 0.4})`);
      gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
      
      ctx.beginPath();
      ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Dibujar estrella principal
      ctx.beginPath();
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 150, ${alpha})`;
      ctx.fill();

      // Dibujar rayos de luz para estrellas más grandes
      if (star.size > 1.5 || isHovered) {
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.strokeStyle = `rgba(255, 255, 200, ${alpha * 0.6})`;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(0, -size * 2);
          ctx.lineTo(0, size * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    const drawConstellation = (ctx, constellation) => {
      if (hoveredStar && constellation.some(star => 
        star.constellationIndex === hoveredStar.constellationIndex
      )) {
        ctx.strokeStyle = 'rgba(255, 255, 150, 0.4)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < constellation.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(constellation[i].x, constellation[i].y);
          ctx.lineTo(constellation[i + 1].x, constellation[i + 1].y);
          ctx.stroke();
        }
      }
    };

    const drawComet = (ctx, comet) => {
      // Actualizar posición
      comet.x += comet.vx;
      comet.y += comet.vy;
      comet.life -= comet.decay;

      // Agregar punto a la cola
      comet.tail.push({ x: comet.x, y: comet.y, life: comet.life });
      
      // Mantener cola de tamaño limitado
      if (comet.tail.length > 20) {
        comet.tail.shift();
      }

      // Dibujar cola
      for (let i = 0; i < comet.tail.length - 1; i++) {
        const segment = comet.tail[i];
        const nextSegment = comet.tail[i + 1];
        const alpha = (segment.life * (i / comet.tail.length)) * 0.8;
        
        if (alpha > 0) {
          ctx.strokeStyle = `rgba(255, 255, 200, ${alpha})`;
          ctx.lineWidth = (comet.size * (i / comet.tail.length)) + 0.5;
          ctx.beginPath();
          ctx.moveTo(segment.x, segment.y);
          ctx.lineTo(nextSegment.x, nextSegment.y);
          ctx.stroke();
        }
      }

      // Dibujar cabeza del cometa
      const gradient = ctx.createRadialGradient(
        comet.x, comet.y, 0,
        comet.x, comet.y, comet.size * 2
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${comet.life})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 150, ${comet.life * 0.8})`);
      gradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
      
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, comet.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let time = 0;

    const animate = () => {
      // Fondo estrellado oscuro
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, 'rgba(5, 5, 25, 1)');
      gradient.addColorStop(0.5, 'rgba(10, 10, 40, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 15, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Aplicar rotación sutil (como órbita terrestre)
      rotationRef.current += 0.0002; // Muy lenta
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotationRef.current);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Resetear hover
      setHoveredStar(null);

      // Dibujar estrellas
      starsRef.current.forEach(star => {
        drawStar(ctx, star, time);
      });

      // Dibujar líneas de constelaciones
      constellationsRef.current.forEach(constellation => {
        drawConstellation(ctx, constellation);
      });

      ctx.restore();

      // Dibujar cometas (sin rotación para que se muevan libremente)
      cometsRef.current = cometsRef.current.filter(comet => {
        drawComet(ctx, comet);
        return comet.life > 0 && 
               comet.x > -100 && comet.x < canvas.width + 100 &&
               comet.y > -100 && comet.y < canvas.height + 100;
      });

      // Crear nuevos cometas aleatoriamente
      if (Math.random() < 0.003 && cometsRef.current.length < 5) {
        createComet();
      }

      time += 0.016;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []); // Sin dependencias para evitar re-renderizados

  return (
    <BaseBackground
      isDark={true}
      gradient="from-slate-900 via-blue-900 to-indigo-900"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-crosshair"
      />
      
      {/* Información de constelación en hover */}
      {hoveredStar && (
        <div 
          className="absolute pointer-events-none z-10 bg-black/80 text-yellow-200 px-3 py-2 rounded-lg text-sm backdrop-blur-sm border border-yellow-400/30"
          style={{
            left: mouseRef.current.x + 15,
            top: mouseRef.current.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          {hoveredStar.constellationIndex === 0 && 'Osa Mayor'}
          {hoveredStar.constellationIndex === 1 && 'Orión'}
          {hoveredStar.constellationIndex === 2 && 'Casiopea'}
          {hoveredStar.constellationIndex === 3 && 'Cruz del Sur'}
        </div>
      )}
    </BaseBackground>
  );
};

export { StarryNightBackground };