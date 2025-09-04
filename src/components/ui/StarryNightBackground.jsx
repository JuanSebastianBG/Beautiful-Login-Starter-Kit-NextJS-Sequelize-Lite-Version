import React, { useState, useEffect, useRef } from "react";
import { BaseBackground } from "./utils";

// Fondo de Noche Estrellada Mejorado con Transiciones Fluidas
const StarryNightBackground = ({ isDark = true }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hoveredStar, setHoveredStar] = useState(null);
  const starsRef = useRef([]);
  const constellationsRef = useRef([]);
  const cometsRef = useRef([]);
  const rotationRef = useRef(0);
  const sparklesRef = useRef([]);
  const hoverTransitionsRef = useRef(new Map()); // Para transiciones suaves

  // Constelaciones famosas
  const constellationPatterns = [
    // Osa Mayor
    {
      name: 'Osa Mayor',
      stars: [
        { x: 0.2, y: 0.3 }, { x: 0.25, y: 0.28 }, { x: 0.3, y: 0.26 },
        { x: 0.35, y: 0.28 }, { x: 0.32, y: 0.35 }, { x: 0.27, y: 0.37 }, { x: 0.22, y: 0.35 }
      ]
    },
    // Orión
    {
      name: 'Orión',
      stars: [
        { x: 0.7, y: 0.4 }, { x: 0.72, y: 0.35 }, { x: 0.74, y: 0.3 },
        { x: 0.68, y: 0.45 }, { x: 0.76, y: 0.45 }, { x: 0.7, y: 0.5 }, { x: 0.74, y: 0.52 }
      ]
    },
    // Casiopea
    {
      name: 'Casiopea',
      stars: [
        { x: 0.5, y: 0.15 }, { x: 0.52, y: 0.12 }, { x: 0.55, y: 0.14 },
        { x: 0.58, y: 0.11 }, { x: 0.61, y: 0.13 }
      ]
    },
    // Cruz del Sur
    {
      name: 'Cruz del Sur',
      stars: [
        { x: 0.8, y: 0.7 }, { x: 0.82, y: 0.65 }, { x: 0.84, y: 0.75 },
        { x: 0.78, y: 0.72 }, { x: 0.86, y: 0.68 }
      ]
    },
    // Leo
    {
      name: 'Leo',
      stars: [
        { x: 0.15, y: 0.6 }, { x: 0.18, y: 0.58 }, { x: 0.22, y: 0.62 },
        { x: 0.25, y: 0.59 }, { x: 0.28, y: 0.65 }, { x: 0.24, y: 0.68 }
      ]
    },
    // Escorpión
    {
      name: 'Escorpión',
      stars: [
        { x: 0.6, y: 0.75 }, { x: 0.62, y: 0.72 }, { x: 0.65, y: 0.78 },
        { x: 0.68, y: 0.76 }, { x: 0.71, y: 0.8 }, { x: 0.74, y: 0.83 }
      ]
    },
    // Cisne
    {
      name: 'Cisne',
      stars: [
        { x: 0.4, y: 0.25 }, { x: 0.42, y: 0.22 }, { x: 0.45, y: 0.28 },
        { x: 0.47, y: 0.25 }, { x: 0.5, y: 0.3 }
      ]
    },
    // Andrómeda
    {
      name: 'Andrómeda',
      stars: [
        { x: 0.85, y: 0.2 }, { x: 0.87, y: 0.18 }, { x: 0.9, y: 0.22 },
        { x: 0.88, y: 0.25 }, { x: 0.92, y: 0.27 }
      ]
    }
  ];

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

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
      sparklesRef.current = [];
      hoverTransitionsRef.current.clear();

      // Crear estrellas de fondo más pequeñas
      const numStars = 250;
      for (let i = 0; i < numStars; i++) {
        const starId = `star-${i}`;
        starsRef.current.push({
          id: starId,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.2, // Más pequeñas
          brightness: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          twinkleOffset: Math.random() * Math.PI * 2,
          isConstellation: false,
          color: `hsl(${45 + Math.random() * 25}, 75%, ${65 + Math.random() * 25}%)`
        });
        
        // Inicializar transición
        hoverTransitionsRef.current.set(starId, {
          hoverProgress: 0,
          targetHover: 0,
          lastUpdate: Date.now()
        });
      }

      // Crear constelaciones más pequeñas
      constellationPatterns.forEach((pattern, constellationIndex) => {
        const constellation = [];
        pattern.stars.forEach((point, starIndex) => {
          const starId = `constellation-${constellationIndex}-${starIndex}`;
          const star = {
            id: starId,
            x: point.x * canvas.width,
            y: point.y * canvas.height,
            size: Math.random() * 2.5 + 1.5, // Más pequeñas
            brightness: Math.random() * 0.3 + 0.7,
            twinkleSpeed: Math.random() * 0.015 + 0.008,
            twinkleOffset: Math.random() * Math.PI * 2,
            isConstellation: true,
            constellationIndex,
            starIndex,
            name: pattern.name,
            color: `hsl(${50 + Math.random() * 15}, 85%, ${75 + Math.random() * 20}%)`
          };
          constellation.push(star);
          starsRef.current.push(star);
          
          // Inicializar transición
          hoverTransitionsRef.current.set(starId, {
            hoverProgress: 0,
            targetHover: 0,
            lastUpdate: Date.now()
          });
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
        case 0:
          startX = Math.random() * canvas.width;
          startY = -50;
          endX = Math.random() * canvas.width;
          endY = canvas.height + 50;
          break;
        case 1:
          startX = canvas.width + 50;
          startY = Math.random() * canvas.height;
          endX = -50;
          endY = Math.random() * canvas.height;
          break;
        case 2:
          startX = Math.random() * canvas.width;
          startY = canvas.height + 50;
          endX = Math.random() * canvas.width;
          endY = -50;
          break;
        case 3:
          startX = -50;
          startY = Math.random() * canvas.height;
          endX = canvas.width + 50;
          endY = Math.random() * canvas.height;
          break;
        default:
          startX = 0;
          startY = 0;
          endX = 0;
          endY = 0;
      }

      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = Math.random() * 2.5 + 1;

      cometsRef.current.push({
        x: startX,
        y: startY,
        vx: (dx / distance) * speed,
        vy: (dy / distance) * speed,
        size: Math.random() * 2.5 + 1.5, // Más pequeños
        tail: [],
        life: 1,
        decay: 0.0008 + Math.random() * 0.0015
      });
    };

    const createSparkle = (x, y) => {
      for (let i = 0; i < 5; i++) { // Menos destellos
        sparklesRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          life: 1,
          decay: 0.015 + Math.random() * 0.015,
          size: Math.random() * 2 + 0.5 // Más pequeños
        });
      }
    };

    const updateHoverTransition = (starId, isHovered) => {
      const transition = hoverTransitionsRef.current.get(starId);
      if (!transition) return 0;

      const now = Date.now();
      const deltaTime = (now - transition.lastUpdate) / 1000; // en segundos
      transition.lastUpdate = now;

      // Velocidad de transición (0.5s = 2 unidades por segundo)
      const transitionSpeed = 2;
      transition.targetHover = isHovered ? 1 : 0;

      // Interpolar suavemente hacia el objetivo
      const diff = transition.targetHover - transition.hoverProgress;
      transition.hoverProgress += diff * transitionSpeed * deltaTime;
      
      // Clamp entre 0 y 1
      transition.hoverProgress = Math.max(0, Math.min(1, transition.hoverProgress));
      
      return transition.hoverProgress;
    };

    const drawStarShape = (ctx, x, y, outerRadius, innerRadius) => {
      const points = 5;
      const angle = Math.PI / points;
      
      ctx.beginPath();
      for (let i = 0; i < 2 * points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const currentAngle = i * angle;
        const px = x + Math.cos(currentAngle - Math.PI / 2) * radius;
        const py = y + Math.sin(currentAngle - Math.PI / 2) * radius;
        
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
    };

    const drawStar = (ctx, star, time) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
      const brightness = star.brightness * twinkle;
      
      const dx = mouseRef.current.x - star.x;
      const dy = mouseRef.current.y - star.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isHovered = distance < 25;
      
      // Actualizar transición suave
      const hoverProgress = updateHoverTransition(star.id, isHovered);
      
      if (isHovered && star.isConstellation) {
        setHoveredStar(star);
        // Crear destellos con menos frecuencia
        if (Math.random() < 0.15) {
          createSparkle(star.x, star.y);
        }
      }

      // Aplicar efectos basados en la transición suave
      const hoverMultiplier = 1 + (hoverProgress * 1.8);
      const size = star.size * hoverMultiplier;
      const alpha = brightness * (0.8 + hoverProgress * 0.2);

      // Solo las estrellas más grandes o de constelación tienen forma de estrella
      const isStarShape = star.size > 1.2 || star.isConstellation || hoverProgress > 0.3;
      
      if (isStarShape) {
        // Halo exterior brillante
        const outerGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 6);
        outerGradient.addColorStop(0, star.color.replace('hsl', 'hsla').replace(')', `, ${0.4 + hoverProgress * 0.4})`));
        outerGradient.addColorStop(0.3, star.color.replace('hsl', 'hsla').replace(')', `, ${0.2 + hoverProgress * 0.3})`));
        outerGradient.addColorStop(0.7, star.color.replace('hsl', 'hsla').replace(')', `, ${0.05 + hoverProgress * 0.15})`));
        outerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 6, 0, Math.PI * 2);
        ctx.fill();

        // Estrella principal con forma de estrella
        const outerRadius = size * 2;
        const innerRadius = size * 0.8;
        
        // Sombra/resplandor de la estrella
        ctx.save();
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 8 + hoverProgress * 12;
        
        // Gradiente para la estrella
        const starGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, outerRadius);
        starGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        starGradient.addColorStop(0.3, star.color.replace('hsl', 'hsla').replace(')', `, ${alpha * 0.9})`));
        starGradient.addColorStop(0.8, star.color.replace('hsl', 'hsla').replace(')', `, ${alpha * 0.6})`));
        starGradient.addColorStop(1, star.color.replace('hsl', 'hsla').replace(')', `, ${alpha * 0.3})`));
        
        ctx.fillStyle = starGradient;
        drawStarShape(ctx, star.x, star.y, outerRadius, innerRadius);
        ctx.fill();

        // Núcleo brillante
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        drawStarShape(ctx, star.x, star.y, outerRadius * 0.6, innerRadius * 0.6);
        ctx.fill();

        // Centro súper brillante
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // Rayos de luz para estrellas especiales
        if (star.isConstellation || hoverProgress > 0.5) {
          ctx.save();
          ctx.translate(star.x, star.y);
          ctx.rotate(time * 0.1 + star.twinkleOffset);
          
          const rayColor = star.color.replace('hsl', 'hsla').replace(')', `, ${alpha * 0.4})`);
          ctx.strokeStyle = rayColor;
          ctx.lineWidth = 1 + hoverProgress * 2;
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 5 + hoverProgress * 10;
          
          const rayLength = size * (3 + hoverProgress * 2);
          
          // Rayos principales (4)
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, -rayLength);
            ctx.lineTo(0, rayLength);
            ctx.stroke();
          }
          
          // Rayos secundarios más cortos
          ctx.rotate(Math.PI / 4);
          ctx.lineWidth = (1 + hoverProgress * 2) * 0.6;
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, -rayLength * 0.7);
            ctx.lineTo(0, rayLength * 0.7);
            ctx.stroke();
          }
          
          ctx.restore();
        }
      } else {
        // Estrellas pequeñas como puntos brillantes
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.4, star.color.replace('hsl', 'hsla').replace(')', `, ${alpha * 0.8})`));
        gradient.addColorStop(0.8, star.color.replace('hsl', 'hsla').replace(')', `, ${alpha * 0.3})`));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Punto central
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
    };

    const drawSparkles = (ctx) => {
      sparklesRef.current = sparklesRef.current.filter(sparkle => {
        sparkle.x += sparkle.vx;
        sparkle.y += sparkle.vy;
        sparkle.life -= sparkle.decay;
        sparkle.vx *= 0.98;
        sparkle.vy *= 0.98;

        if (sparkle.life > 0) {
          ctx.save();
          ctx.globalAlpha = sparkle.life;
          ctx.fillStyle = `hsl(${45 + Math.random() * 25}, 85%, 85%)`;
          ctx.shadowColor = 'white';
          ctx.shadowBlur = 6;
          
          ctx.beginPath();
          ctx.arc(sparkle.x, sparkle.y, sparkle.size * sparkle.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return true;
        }
        return false;
      });
    };

    const drawConstellation = (ctx, constellation) => {
      if (hoveredStar && constellation.some(star => 
        star.constellationIndex === hoveredStar.constellationIndex
      )) {
        ctx.strokeStyle = hoveredStar.color.replace('hsl', 'hsla').replace(')', ', 0.6)');
        ctx.lineWidth = 1.5;
        ctx.shadowColor = hoveredStar.color;
        ctx.shadowBlur = 8;
        
        for (let i = 0; i < constellation.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(constellation[i].x, constellation[i].y);
          ctx.lineTo(constellation[i + 1].x, constellation[i + 1].y);
          ctx.stroke();
        }
      }
    };

    const drawComet = (ctx, comet) => {
      comet.x += comet.vx;
      comet.y += comet.vy;
      comet.life -= comet.decay;

      comet.tail.push({ x: comet.x, y: comet.y, life: comet.life });
      
      if (comet.tail.length > 20) {
        comet.tail.shift();
      }

      // Cola más sutil
      for (let i = 0; i < comet.tail.length - 1; i++) {
        const segment = comet.tail[i];
        const nextSegment = comet.tail[i + 1];
        const alpha = (segment.life * (i / comet.tail.length)) * 0.7;
        
        if (alpha > 0) {
          ctx.strokeStyle = `rgba(255, 255, 200, ${alpha})`;
          ctx.lineWidth = (comet.size * (i / comet.tail.length)) * 0.8;
          ctx.shadowColor = 'rgba(255, 255, 200, 0.6)';
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.moveTo(segment.x, segment.y);
          ctx.lineTo(nextSegment.x, nextSegment.y);
          ctx.stroke();
        }
      }

      // Cabeza del cometa más sutil
      const gradient = ctx.createRadialGradient(
        comet.x, comet.y, 0,
        comet.x, comet.y, comet.size * 2.5
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${comet.life})`);
      gradient.addColorStop(0.4, `rgba(255, 255, 150, ${comet.life * 0.8})`);
      gradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
      
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, comet.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let time = 0;

    const animate = () => {
      // Fondo con gradiente más sutil
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, 'rgba(5, 5, 20, 1)');
      gradient.addColorStop(0.4, 'rgba(8, 8, 35, 1)');
      gradient.addColorStop(0.8, 'rgba(12, 12, 50, 1)');
      gradient.addColorStop(1, 'rgba(2, 2, 15, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationRef.current += 0.00008; // Rotación más lenta
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotationRef.current);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

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

      // Dibujar destellos
      drawSparkles(ctx);

      // Dibujar cometas
      cometsRef.current = cometsRef.current.filter(comet => {
        drawComet(ctx, comet);
        return comet.life > 0 && 
               comet.x > -100 && comet.x < canvas.width + 100 &&
               comet.y > -100 && comet.y < canvas.height + 100;
      });

      // Crear nuevos cometas con menos frecuencia
      if (Math.random() < 0.003 && cometsRef.current.length < 4) {
        createComet();
      }

      time += 0.016;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <BaseBackground
      isDark={true}
      gradient="from-slate-900 via-blue-900 to-indigo-900"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-crosshair"
      />
      
      {/* Información de constelación mejorada */}
      {hoveredStar && (
        <div 
          className="absolute pointer-events-none z-10 bg-gradient-to-r from-yellow-900/90 to-amber-900/90 text-yellow-100 px-3 py-2 rounded-lg text-sm backdrop-blur-md border border-yellow-400/40 shadow-xl shadow-yellow-500/20 transition-all duration-300 ease-out"
          style={{
            left: mouseRef.current.x + 15,
            top: mouseRef.current.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="font-semibold text-yellow-200 text-xs">{hoveredStar.name}</div>
          <div className="text-xs text-yellow-300/70 mt-0.5">Constelación</div>
        </div>
      )}
    </BaseBackground>
  );
};

export { StarryNightBackground };