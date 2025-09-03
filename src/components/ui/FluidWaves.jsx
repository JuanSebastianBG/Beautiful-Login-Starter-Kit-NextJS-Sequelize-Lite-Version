import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 3. Background de Ondas (Fluid Waves) Mejorado
const FluidWavesBackground = ({ isDark = false }) => {
  const [waves, setWaves] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [bubbles, setBubbles] = useState([]); // Añadido para burbujas ascendentes
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const lastRippleTimeRef = useRef(0);

  // Inicializar ondas con más variedad
  const initializeWaves = useCallback(() => {
    return Array.from({ length: 7 }, (_, i) => ({ // Aumentado a 7 para más capas y profundidad
      id: i,
      amplitude: 15 + i * 4, // Amplitud ajustada para ondas más suaves
      frequency: 0.004 + i * 0.0015, // Frecuencia reducida para movimiento más fluido
      speed: 0.03 + i * 0.008, // Velocidad reducida para animación más relajante
      phase: Math.random() * Math.PI * 2,
      color: ["cyan", "teal", "blue", "purple", "indigo", "violet", "pink"][i % 7], // Más colores para variedad
      opacity: 0.6 - i * 0.07, // Opacidad ajustada para mejor blending
      direction: Math.random() > 0.5 ? 1 : -1, // Dirección aleatoria para dinamismo
    }));
  }, []);

  useEffect(() => {
    setWaves(initializeWaves());
  }, [initializeWaves]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Crear ondas al mover el mouse (con límite de frecuencia)
      const now = Date.now();
      if (now - lastRippleTimeRef.current > 200) { // Reducido a 200ms para más interactividad
        setRipples((prev) =>
          [
            ...prev,
            {
              id: now,
              x: e.clientX,
              y: e.clientY,
              radius: 0,
              maxRadius: 120 + Math.random() * 60,
              speed: 2.5 + Math.random() * 1.5, // Velocidad ajustada para expansión más suave
              opacity: 0.7,
              color: getRandomColor(),
            },
          ].slice(-15) // Aumentado a 15 para más ripples visibles
        );

        // Crear burbujas al mover el mouse
        if (Math.random() < 0.2) { // Probabilidad para no sobrecargar
          setBubbles((prev) =>
            [
              ...prev,
              {
                id: now,
                x: e.clientX + (Math.random() - 0.5) * 20,
                y: e.clientY + (Math.random() - 0.5) * 20,
                radius: 3 + Math.random() * 5,
                speed: 1 + Math.random() * 2,
                opacity: 0.6 + Math.random() * 0.3,
                color: getRandomColor(),
                sway: Math.random() * 0.05, // Movimiento lateral para realismo
              },
            ].slice(-50) // Mantener hasta 50 burbujas
          );
        }

        lastRippleTimeRef.current = now;
      }
    };

    const handleClick = (e) => {
      // Crear una onda más grande al hacer clic
      setRipples((prev) =>
        [
          ...prev,
          {
            id: Date.now(),
            x: e.clientX,
            y: e.clientY,
            radius: 0,
            maxRadius: 250 + Math.random() * 150,
            speed: 4 + Math.random() * 2,
            opacity: 0.9,
            color: getRandomColor(),
          },
        ].slice(-20)
      );

      // Crear múltiples burbujas al clic para efecto de splash
      for (let i = 0; i < 5; i++) {
        setBubbles((prev) =>
          [
            ...prev,
            {
              id: Date.now() + i,
              x: e.clientX + (Math.random() - 0.5) * 30,
              y: e.clientY + (Math.random() - 0.5) * 30,
              radius: 4 + Math.random() * 6,
              speed: 2 + Math.random() * 3,
              opacity: 0.7 + Math.random() * 0.2,
              color: getRandomColor(),
              sway: Math.random() * 0.1,
            },
          ].slice(-50)
        );
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

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

      // Actualizar y dibujar ondas
      setWaves((prevWaves) =>
        prevWaves.map((wave) => ({
          ...wave,
          phase: wave.phase + wave.speed * wave.direction, // Aplicar dirección
        }))
      );

      // Dibujar ondas con mejor gradiente y sombra
      waves.forEach((wave) => {
        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 4) { // Paso reducido para líneas más suaves
          const y = Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;

          // Calcular posición vertical base según la onda
          const baseY = canvas.height * 0.4 + wave.id * (canvas.height * 0.08); // Ajustado para mejor distribución

          if (x === 0) {
            ctx.moveTo(x, baseY + y);
          } else {
            ctx.lineTo(x, baseY + y);
          }
        }

        // Completar el path hasta el fondo del canvas
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        // Crear gradiente más rico
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(
          0,
          getColorVariant(wave.color, isDark ? "500" : "100") + "00" // Más vibrante arriba
        );
        gradient.addColorStop(
          0.4,
          getColorVariant(wave.color, isDark ? "400" : "200") + "90"
        );
        gradient.addColorStop(
          0.7,
          getColorVariant(wave.color, isDark ? "600" : "300") + "70"
        );
        gradient.addColorStop(
          1,
          getColorVariant(wave.color, isDark ? "800" : "400") + "30" // Menos opaco abajo
        );

        ctx.fillStyle = gradient;
        ctx.globalAlpha = wave.opacity;
        ctx.fill();

        // Añadir sombra sutil para profundidad
        ctx.shadowColor = isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
      });

      // Reset shadow después de dibujar ondas
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Actualizar y dibujar ripples con glow
      setRipples((prevRipples) =>
        prevRipples
          .map((ripple) => {
            const newRadius = ripple.radius + ripple.speed;
            const newOpacity =
              ripple.opacity * (1 - newRadius / ripple.maxRadius);

            return {
              ...ripple,
              radius: newRadius,
              opacity: newOpacity,
            };
          })
          .filter((ripple) => ripple.opacity > 0.01)
      );

      // Dibujar ripples con efecto de glow
      ripples.forEach((ripple) => {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = getColorVariant(ripple.color, isDark ? "300" : "400");
        ctx.lineWidth = 3; // Grosor aumentado para visibilidad
        ctx.globalAlpha = ripple.opacity * 0.8;
        ctx.stroke();

        // Glow exterior
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = getColorVariant(ripple.color, isDark ? "200" : "300");
        ctx.lineWidth = 5;
        ctx.globalAlpha = ripple.opacity * 0.3;
        ctx.stroke();
      });

      // Actualizar y dibujar burbujas
      setBubbles((prevBubbles) =>
        prevBubbles
          .map((bubble) => {
            const newY = bubble.y - bubble.speed;
            const newX = bubble.x + Math.sin(newY * bubble.sway) * 2; // Movimiento lateral sinusoidal
            const newOpacity = bubble.opacity * (newY > 0 ? 1 : 0);

            return {
              ...bubble,
              x: newX,
              y: newY,
              opacity: newOpacity,
            };
          })
          .filter((bubble) => bubble.y > -bubble.radius && bubble.opacity > 0.01)
      );

      // Dibujar burbujas con gradiente y brillo
      bubbles.forEach((bubble) => {
        const bubbleGradient = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.2,
          bubble.y - bubble.radius * 0.2,
          0,
          bubble.x,
          bubble.y,
          bubble.radius
        );
        bubbleGradient.addColorStop(0, "rgba(255,255,255,0.8)");
        bubbleGradient.addColorStop(1, getColorVariant(bubble.color, isDark ? "400" : "500") + "60");

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubbleGradient;
        ctx.globalAlpha = bubble.opacity;
        ctx.fill();

        // Brillo en la burbuja
        ctx.beginPath();
        ctx.arc(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          bubble.radius * 0.4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.globalAlpha = bubble.opacity * 0.5;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [waves, ripples, bubbles, isDark]);

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-black via-blue-950 to-indigo-950" // Gradiente más profundo y bonito
          : "from-cyan-50 via-blue-50 to-violet-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { FluidWavesBackground };