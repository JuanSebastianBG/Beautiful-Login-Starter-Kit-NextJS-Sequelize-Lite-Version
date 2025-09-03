import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 5. Sistema Solar o Partículas Orbitales Mejorado
const OrbitalParticlesBackground = ({ isDark = false }) => {
  const [planets, setPlanets] = useState([]);
  const [stars, setStars] = useState([]); // Añadido para estrellas de fondo
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();

  // Inicializar estrellas de fondo para un efecto espacial más bonito
  const initializeStars = useCallback(() => {
    if (typeof window === "undefined") return [];

    return Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.5 + 0.5,
      twinkleSpeed: Math.random() * 0.01 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Inicializar planetas con más variedad y colores más vibrantes
  const initializePlanets = useCallback(() => {
    if (typeof window === "undefined") return [];

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    return Array.from({ length: 40 }, (_, i) => { // Aumentado a 40 para más dinamismo sin perder optimización
      const orbitRadius = 80 + Math.random() * 400; // Órbitas más amplias para belleza
      const angle = Math.random() * Math.PI * 2;
      const speed =
        (((0.1 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1)) /
          orbitRadius) *
        10; // Reducido de 50 a 10 para órbitas más lentas y realistas

      const color = getRandomColor(); // Asumiendo que getRandomColor da colores vibrantes; si no, ajustar en utils

      return {
        id: i,
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        radius: 3 + Math.random() * 8, // Planetas un poco más grandes para visibilidad
        color,
        orbitRadius,
        angle,
        speed,
        orbitEccentricity: Math.random() * 0.3, // Mayor excentricidad para órbitas más variadas
        orbitTilt: (Math.random() * Math.PI) / 4, // Mayor inclinación para 3D feel
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setStars(initializeStars());
    setPlanets(initializePlanets());

    const handleResize = () => {
      setStars(initializeStars());
      setPlanets(initializePlanets());
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
  }, [initializeStars, initializePlanets]);

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

    // Función de animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Dibujar estrellas de fondo con parpadeo para mayor belleza
      const time = Date.now() / 1000;
      stars.forEach((star) => {
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.2 + 0.8;
        const brightness = star.brightness * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${brightness})`
          : `rgba(100, 100, 255, ${brightness})`;
        ctx.fill();
      });

      // Dibujar sol central con pulso para efecto dinámico
      const pulse = Math.sin(time * 0.5) * 0.1 + 1; // Pulso sutil
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 * pulse, 0, Math.PI * 2); // Aumentado tamaño
      ctx.fillStyle = isDark ? "#FDB813" : "#FFCC33";
      ctx.globalAlpha = 0.9;
      ctx.fill();

      // Halo solar múltiple para más glow
      [40, 60].forEach((haloRadius, index) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, haloRadius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#FDB813" : "#FFCC33";
        ctx.globalAlpha = 0.3 - index * 0.1;
        ctx.fill();
      });

      // Actualizar planetas con gravedad del mouse más suave
      setPlanets((prevPlanets) => {
        return prevPlanets.map((planet) => {
          // Actualizar ángulo
          let angle = planet.angle + planet.speed;
          if (angle > Math.PI * 2) angle -= Math.PI * 2;
          if (angle < 0) angle += Math.PI * 2;

          // Calcular nueva posición en órbita elíptica
          const orbitA = planet.orbitRadius;
          const orbitB = planet.orbitRadius * (1 - planet.orbitEccentricity);

          let x = centerX + orbitA * Math.cos(angle);
          let y = centerY + orbitB * Math.sin(angle);

          // Aplicar inclinación de la órbita (para efecto 3D)
          const tiltedY =
            centerY +
            (y - centerY) * Math.cos(planet.orbitTilt) -
            (x - centerX) * Math.sin(planet.orbitTilt);

          const tiltedX =
            centerX +
            (x - centerX) * Math.cos(planet.orbitTilt) +
            (y - centerY) * Math.sin(planet.orbitTilt);

          // Influencia del mouse (gravedad más suave y realista)
          const dx = mousePos.x - tiltedX;
          const dy = mousePos.y - tiltedY;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          if (distToMouse < 200) { // Aumentado radio de influencia
            const force = 30 / (distToMouse + 1); // Fuerza ajustada
            x += dx * force * 0.005; // Reducido para movimiento más suave
            y += dy * force * 0.005;
          }

          return { ...planet, x: tiltedX, y: tiltedY, angle };
        });
      });

      // Dibujar órbitas con inclinación aproximada y fade para belleza
      planets.forEach((planet) => {
        ctx.beginPath();
        const steps = 100;
        for (let i = 0; i < steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const orbitA = planet.orbitRadius;
          const orbitB = planet.orbitRadius * (1 - planet.orbitEccentricity);

          let orbitX = centerX + orbitA * Math.cos(theta);
          let orbitY = centerY + orbitB * Math.sin(theta);

          // Aplicar tilt
          const tiltedOrbitY =
            centerY +
            (orbitY - centerY) * Math.cos(planet.orbitTilt) -
            (orbitX - centerX) * Math.sin(planet.orbitTilt);

          const tiltedOrbitX =
            centerX +
            (orbitX - centerX) * Math.cos(planet.orbitTilt) +
            (orbitY - centerY) * Math.sin(planet.orbitTilt);

          if (i === 0) {
            ctx.moveTo(tiltedOrbitX, tiltedOrbitY);
          } else {
            ctx.lineTo(tiltedOrbitX, tiltedOrbitY);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = isDark
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(100, 100, 255, 0.15)"; // Mayor opacidad para visibilidad
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Dibujar planetas con estelas más largas y suaves
      planets.forEach((planet) => {
        // Estela del planeta (más larga y con fade)
        ctx.beginPath();
        ctx.moveTo(planet.x, planet.y);
        for (let i = 1; i <= 20; i++) { // Aumentado a 20 para estela más larga
          const trailAngle = planet.angle - planet.speed * i * 3; // Espaciado ajustado
          const orbitA = planet.orbitRadius;
          const orbitB = planet.orbitRadius * (1 - planet.orbitEccentricity);

          let trailX = centerX + orbitA * Math.cos(trailAngle);
          let trailY = centerY + orbitB * Math.sin(trailAngle);

          // Aplicar tilt
          const tiltedTrailY =
            centerY +
            (trailY - centerY) * Math.cos(planet.orbitTilt) -
            (trailX - centerX) * Math.sin(planet.orbitTilt);

          const tiltedTrailX =
            centerX +
            (trailX - centerX) * Math.cos(planet.orbitTilt) +
            (trailY - centerY) * Math.sin(planet.orbitTilt);

          ctx.lineTo(tiltedTrailX, tiltedTrailY);
          ctx.globalAlpha = 0.4 * (1 - i / 20); // Fade out para belleza
          ctx.strokeStyle = getColorVariant(planet.color, isDark ? "300" : "200");
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath(); // Reiniciar para stroke por segmento con alpha
          ctx.moveTo(tiltedTrailX, tiltedTrailY);
        }
        ctx.globalAlpha = 1; // Reset alpha

        // Planeta con gradiente para más profundidad
        const planetGradient = ctx.createRadialGradient(
          planet.x - planet.radius * 0.3,
          planet.y - planet.radius * 0.3,
          0,
          planet.x,
          planet.y,
          planet.radius
        );
        planetGradient.addColorStop(0, getColorVariant(planet.color, isDark ? "300" : "400"));
        planetGradient.addColorStop(1, getColorVariant(planet.color, isDark ? "600" : "700"));

        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planetGradient;
        ctx.globalAlpha = 0.9;
        ctx.fill();

        // Brillo del planeta (highlight)
        ctx.beginPath();
        ctx.arc(
          planet.x - planet.radius * 0.4,
          planet.y - planet.radius * 0.4,
          planet.radius * 0.6,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.5;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [planets, stars, mousePos, isDark]);

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-black via-indigo-950 to-purple-950" // Gradiente más espacial y bonito
          : "from-purple-50 via-indigo-50 to-blue-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { OrbitalParticlesBackground };