import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 7. Perlin Noise (Patrones Orgánicos)
const PerlinNoiseBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [time, setTime] = useState(0);

  // Implementación simple de ruido Perlin
  const noise = (x, y) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const topRight = ((X + 1 + (Y + 1) * 57) % 256) / 255.0;
    const topLeft = ((X + Y * 57) % 256) / 255.0;
    const bottomRight = ((X + 1 + Y * 57) % 256) / 255.0;
    const bottomLeft = ((X + (Y + 1) * 57) % 256) / 255.0;

    const u = xf * xf * (3 - 2 * xf);

    const lerp1 = topLeft + u * (topRight - topLeft);
    const lerp2 = bottomLeft + u * (bottomRight - bottomLeft);

    const v = yf * yf * (3 - 2 * yf);

    return lerp1 + v * (lerp2 - lerp1);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Incrementar el tiempo para la animación
    const interval = setInterval(() => {
      setTime((t) => t + 0.01);
    }, 50);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
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

      // Crear imagen de datos para manipular píxeles directamente
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Escala del ruido
      const scale = 0.005;

      // Colores base según el tema
      const baseColors = isDark
        ? [
            [100, 50, 150], // Púrpura oscuro
            [50, 50, 100], // Azul oscuro
            [20, 20, 50], // Casi negro
          ]
        : [
            [200, 220, 255], // Azul claro
            [230, 230, 250], // Lavanda
            [240, 240, 255], // Casi blanco
          ];

      // Influencia del mouse
      const mouseInfluence = {
        x: mousePos.x / canvas.width,
        y: mousePos.y / canvas.height,
      };

      // Generar el patrón de ruido
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          // Calcular distancia al mouse
          const dx = x - mousePos.x;
          const dy = y - mousePos.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          const mouseEffect = Math.max(0, 1 - distToMouse / 300);

          // Generar múltiples capas de ruido
          let noiseVal = 0;

          // Primera capa - base
          noiseVal += noise(x * scale, y * scale + time) * 0.5;

          // Segunda capa - detalle
          noiseVal += noise(x * scale * 2 + time, y * scale * 2) * 0.25;

          // Tercera capa - más detalle
          noiseVal +=
            noise(x * scale * 4 + time * 0.5, y * scale * 4 - time * 0.5) *
            0.125;

          // Ajustar con la influencia del mouse
          noiseVal += mouseEffect * 0.3;

          // Limitar el valor
          noiseVal = Math.max(0, Math.min(1, noiseVal));

          // Interpolar entre colores base
          let color;
          if (noiseVal < 0.33) {
            const t = noiseVal / 0.33;
            color = [
              baseColors[0][0] * (1 - t) + baseColors[1][0] * t,
              baseColors[0][1] * (1 - t) + baseColors[1][1] * t,
              baseColors[0][2] * (1 - t) + baseColors[1][2] * t,
            ];
          } else if (noiseVal < 0.66) {
            const t = (noiseVal - 0.33) / 0.33;
            color = [
              baseColors[1][0] * (1 - t) + baseColors[2][0] * t,
              baseColors[1][1] * (1 - t) + baseColors[2][1] * t,
              baseColors[1][2] * (1 - t) + baseColors[2][2] * t,
            ];
          } else {
            color = baseColors[2];
          }

          // Añadir efecto de color basado en la posición del mouse
          if (mouseEffect > 0.1) {
            const hue = (mouseInfluence.x * 360) % 360;
            const saturation = 0.5 + mouseInfluence.y * 0.5;

            // Convertir HSL a RGB
            const c = saturation;
            const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
            const m = 0.5 - c / 2;

            let r, g, b;
            if (hue < 60) {
              r = c;
              g = x;
              b = 0;
            } else if (hue < 120) {
              r = x;
              g = c;
              b = 0;
            } else if (hue < 180) {
              r = 0;
              g = c;
              b = x;
            } else if (hue < 240) {
              r = 0;
              g = x;
              b = c;
            } else if (hue < 300) {
              r = x;
              g = 0;
              b = c;
            } else {
              r = c;
              g = 0;
              b = x;
            }

            // Mezclar con el color base
            color[0] =
              color[0] * (1 - mouseEffect) + (r + m) * 255 * mouseEffect;
            color[1] =
              color[1] * (1 - mouseEffect) + (g + m) * 255 * mouseEffect;
            color[2] =
              color[2] * (1 - mouseEffect) + (b + m) * 255 * mouseEffect;
          }

          // Establecer el color del píxel
          const pixelIndex = (y * canvas.width + x) * 4;
          data[pixelIndex] = color[0];
          data[pixelIndex + 1] = color[1];
          data[pixelIndex + 2] = color[2];
          data[pixelIndex + 3] = 255;
        }
      }

      // Dibujar la imagen
      ctx.putImageData(imageData, 0, 0);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [time, mousePos, isDark]);

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

export {PerlinNoiseBackground};