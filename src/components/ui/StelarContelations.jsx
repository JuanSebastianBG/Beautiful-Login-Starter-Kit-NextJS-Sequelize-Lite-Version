import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 8. Constelaciones Estelares Mejoradas
const ConstellationsBackground = ({ isDark = false }) => {
  const [stars, setStars] = useState([]);
  const [constellations, setConstellations] = useState([]);
  const [meteors, setMeteors] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();

  // Inicializar estrellas con más cantidad y variedad de colores
  const initializeStars = useCallback(() => {
    if (typeof window === "undefined") return [];

    return Array.from({ length: 400 }, () => { // Aumentado a 400 estrellas para más densidad sin perder rendimiento
      const isColored = Math.random() < 0.1; // 10% de estrellas coloreadas para mayor belleza
      const color = isColored ? `hsl(${Math.random() * 360}, 80%, 80%)` : null;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color, // Color opcional para variedad
      };
    });
  }, []);

  // Crear constelaciones con más cantidad y conexiones más amplias
  const createConstellations = useCallback((stars) => {
    if (stars.length < 10) return [];

    const constellations = [];
    const usedStars = new Set();

    // Crear 8-12 constelaciones para mayor complejidad visual
    const numConstellations = 8 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numConstellations; i++) {
      // Encontrar una estrella no usada para iniciar la constelación
      let startIndex;
      do {
        startIndex = Math.floor(Math.random() * stars.length);
      } while (usedStars.has(startIndex));

      usedStars.add(startIndex);

      // Crear la constelación
      const constellation = {
        stars: [startIndex],
        connections: [],
      };

      // Añadir 4-8 estrellas a la constelación
      const numStars = 4 + Math.floor(Math.random() * 5);

      for (let j = 0; j < numStars; j++) {
        // Encontrar la estrella más cercana que no esté en la constelación
        const lastStarIndex = constellation.stars[constellation.stars.length - 1];
        const lastStar = stars[lastStarIndex];

        let nearestIndex = -1;
        let minDistance = Infinity;

        for (let k = 0; k < stars.length; k++) {
          if (usedStars.has(k)) continue;

          const star = stars[k];
          const dx = star.x - lastStar.x;
          const dy = star.y - lastStar.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Aumentar distancia máxima a 300 para constelaciones más grandes y conectadas
          if (distance < 300 && distance < minDistance) {
            minDistance = distance;
            nearestIndex = k;
          }
        }

        // Si encontramos una estrella cercana, la añadimos a la constelación
        if (nearestIndex !== -1) {
          usedStars.add(nearestIndex);
          constellation.stars.push(nearestIndex);
          constellation.connections.push([
            constellation.stars.length - 2,
            constellation.stars.length - 1,
          ]);
        } else {
          // No hay más estrellas cercanas disponibles
          break;
        }
      }

      // Solo añadir constelaciones con al menos 3 estrellas
      if (constellation.stars.length >= 3) {
        constellations.push(constellation);
      }
    }

    return constellations;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const newStars = initializeStars();
    setStars(newStars);
    setConstellations(createConstellations(newStars));

    const handleResize = () => {
      const newStars = initializeStars();
      setStars(newStars);
      setConstellations(createConstellations(newStars));
      setMeteors([]); // Reiniciar meteoros al redimensionar
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
  }, [initializeStars, createConstellations]);

  useEffect(() => {
    if (
      !canvasRef.current ||
      typeof window === "undefined" ||
      stars.length === 0
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ajustar tamaño del canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Función de animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo del cielo con un gradiente sutil para mayor belleza
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, isDark ? "#050314" : "#d0d8ff");
      gradient.addColorStop(1, isDark ? "#1a1a40" : "#f0f4ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar estrellas con efecto de parpadeo y colores
      const time = Date.now() / 1000;

      stars.forEach((star, index) => {
        // Calcular distancia al mouse
        const dx = mousePos.x - star.x;
        const dy = mousePos.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const mouseEffect = Math.max(0, 1 - distance / 200);

        // Efecto de parpadeo
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.2 + 0.8;

        // Brillo base + efecto del mouse + parpadeo
        const brightness = star.brightness * twinkle + mouseEffect * 0.5;

        // Color de la estrella (coloreada o predeterminada)
        let baseColor = star.color || (isDark ? "255, 255, 255" : "100, 100, 255");
        const starColor = `rgba(${baseColor}, ${brightness})`;

        // Dibujar estrella
        ctx.beginPath();
        ctx.arc(
          star.x,
          star.y,
          star.radius * (1 + mouseEffect),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = starColor;
        ctx.fill();

        // Añadir brillo si está cerca del mouse (efecto mejorado para interactividad)
        if (mouseEffect > 0.1) {
          ctx.beginPath();
          ctx.arc(
            star.x,
            star.y,
            star.radius * (2 + mouseEffect * 4), // Aumentado para más glow
            0,
            Math.PI * 2
          );
          const glowColor = star.color ? `${star.color.replace('80%', '50%')}` : (isDark ? "255, 255, 255" : "150, 150, 255");
          ctx.fillStyle = `rgba(${glowColor}, ${mouseEffect * 0.3})`; // Mayor opacidad para belleza
          ctx.fill();
        }
      });

      // Dibujar constelaciones con efecto de pulso para más interactividad y belleza
      constellations.forEach((constellation) => {
        constellation.connections.forEach(([fromIndex, toIndex]) => {
          const fromStarIndex = constellation.stars[fromIndex];
          const toStarIndex = constellation.stars[toIndex];

          const fromStar = stars[fromStarIndex];
          const toStar = stars[toStarIndex];

          // Calcular distancia promedio al mouse
          const midX = (fromStar.x + toStar.x) / 2;
          const midY = (fromStar.y + toStar.y) / 2;
          const dx = mousePos.x - midX;
          const dy = mousePos.y - midY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const mouseEffect = Math.max(0, 1 - distance / 300);

          // Efecto de pulso en las líneas
          const pulse = Math.sin(time * 0.5) * 0.1 + 0.9; // Pulso sutil

          // Dibujar línea de conexión
          ctx.beginPath();
          ctx.moveTo(fromStar.x, fromStar.y);
          ctx.lineTo(toStar.x, toStar.y);
          ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${(0.1 + mouseEffect * 0.4) * pulse})`
            : `rgba(100, 100, 255, ${(0.1 + mouseEffect * 0.3) * pulse})`;
          ctx.lineWidth = 0.5 + mouseEffect * 1.5; // Mayor grosor para visibilidad
          ctx.stroke();
        });
      });

      // Manejar meteoros para más interactividad y belleza (estrellas fugaces aleatorias)
      if (Math.random() < 0.005) { // Probabilidad baja de spawn por frame (~ cada pocos segundos)
        const newMeteor = {
          x: Math.random() * canvas.width,
          y: 0,
          speed: Math.random() * 5 + 5,
          angle: Math.random() * Math.PI / 4 + Math.PI / 6, // Dirección diagonal
          length: Math.random() * 20 + 10,
          brightness: 1,
          life: 1,
        };
        setMeteors((prev) => [...prev, newMeteor]);
      }

      // Actualizar y dibujar meteoros
      setMeteors((prevMeteors) =>
        prevMeteors
          .map((meteor) => {
            meteor.x += Math.cos(meteor.angle) * meteor.speed;
            meteor.y += Math.sin(meteor.angle) * meteor.speed;
            meteor.life -= 0.02; // Desvanecimiento
            return meteor;
          })
          .filter((meteor) => meteor.life > 0 && meteor.y < canvas.height && meteor.x < canvas.width)
      );

      meteors.forEach((meteor) => {
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(
          meteor.x - Math.cos(meteor.angle) * meteor.length,
          meteor.y - Math.sin(meteor.angle) * meteor.length
        );
        ctx.strokeStyle = isDark
          ? `rgba(255, 255, 255, ${meteor.life})`
          : `rgba(100, 100, 255, ${meteor.life})`;
        ctx.lineWidth = 2 * meteor.life;
        ctx.stroke();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [stars, constellations, mousePos, isDark, meteors]);

  return (
    <BaseBackground
      isDark={isDark}
      gradient={null} // No necesitamos gradiente aquí, el canvas lo cubre todo
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { ConstellationsBackground };