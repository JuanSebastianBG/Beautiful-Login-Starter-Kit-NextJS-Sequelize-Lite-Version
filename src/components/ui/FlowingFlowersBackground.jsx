import React, { useState, useEffect, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 11. Flores o Hojas que Fluyen - Versión mejorada
const FlowingFlowersBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const flowersRef = useRef([]);
  const windRef = useRef({ x: 0, y: 0 });
  const lastWindUpdateRef = useRef(0);

  // Manejar eventos del mouse
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Crear corrientes de aire suaves basadas en el movimiento del mouse
      const now = Date.now();
      if (now - lastWindUpdateRef.current > 50) { // Limitar actualizaciones
        windRef.current.x = (e.clientX - window.innerWidth / 2) * 0.0005;
        windRef.current.y = (e.clientY - window.innerHeight / 2) * 0.0005;
        lastWindUpdateRef.current = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Inicializar flores y animación
  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Definición de tipos de flores
    const flowerTypes = [
      'daisy',
      'rose',
      'tulip',
      'sunflower',
      'cherry_blossom',
      'maple_leaf',
      'oak_leaf'
    ];

    // Función para dibujar un pétalo
    const drawPetal = (ctx, type, size, color, secondaryColor, angle = 0) => {
      // Asegurarse de que el tamaño sea siempre positivo
      const safeSize = Math.max(0.1, size);
      
      ctx.save();
      ctx.rotate(angle);
      
      switch (type) {
        case 'oval':
          ctx.beginPath();
          // Usar valores absolutos para los radios
          ctx.ellipse(0, -safeSize/2, Math.abs(safeSize/3), Math.abs(safeSize/1.5), 0, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          break;
        case 'pointed':
          ctx.beginPath();
          ctx.moveTo(0, -safeSize);
          ctx.bezierCurveTo(safeSize/2, -safeSize/2, safeSize/2, -safeSize/3, 0, 0);
          ctx.bezierCurveTo(-safeSize/2, -safeSize/3, -safeSize/2, -safeSize/2, 0, -safeSize);
          ctx.fillStyle = color;
          ctx.fill();
          break;
        case 'round':
          ctx.beginPath();
          ctx.arc(0, -safeSize/2, Math.abs(safeSize/2), 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          break;
        default:
          ctx.beginPath();
          ctx.ellipse(0, -safeSize/2, Math.abs(safeSize/3), Math.abs(safeSize/1.5), 0, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
      }
      
      ctx.restore();
    };

    // Función para dibujar diferentes formas de flores
    const drawFlower = (ctx, flower) => {
      ctx.save();
      ctx.translate(flower.x, flower.y);
      ctx.rotate(flower.rotation);
      ctx.globalAlpha = flower.alpha;

      const color = getColorVariant(flower.color, isDark ? "400" : "500");
      const secondaryColor = getColorVariant(flower.color, isDark ? "300" : "400");
      const centerColor = getColorVariant(flower.color, isDark ? "600" : "700");
      
      // Factor de crecimiento basado en la posición vertical
      const growth = Math.min(1, (flower.y / canvas.height) * 3);
      const size = flower.size * growth;

      switch (flower.type) {
        case 'daisy':
          // Pétalos
          for (let i = 0; i < 12; i++) {
            drawPetal(ctx, 'oval', size, color, secondaryColor, (i * Math.PI * 2) / 12);
          }
          // Centro
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = centerColor;
          ctx.fill();
          break;
          
        case 'rose':
          // Pétalos en espiral
          for (let i = 0; i < 9; i++) {
            const scale = 0.6 + (i * 0.05);
            const angle = i * 0.5;
            ctx.save();
            ctx.rotate(angle);
            ctx.scale(scale, scale);
            drawPetal(ctx, 'pointed', size, color, secondaryColor);
            ctx.restore();
          }
          break;
          
        case 'tulip':
          // Pétalos
          for (let i = 0; i < 6; i++) {
            drawPetal(ctx, 'pointed', size, color, secondaryColor, (i * Math.PI * 2) / 6);
          }
          break;
          
        case 'sunflower':
          // Pétalos
          for (let i = 0; i < 20; i++) {
            drawPetal(ctx, 'pointed', size * 1.2, color, secondaryColor, (i * Math.PI * 2) / 20);
          }
          // Centro
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = centerColor;
          ctx.fill();
          break;
          
        case 'cherry_blossom':
          // Pétalos redondeados
          for (let i = 0; i < 5; i++) {
            drawPetal(ctx, 'round', size * 0.8, color, secondaryColor, (i * Math.PI * 2) / 5);
          }
          // Centro
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = centerColor;
          ctx.fill();
          break;
          
        case 'maple_leaf':
          // Dibujar hoja de arce
          ctx.beginPath();
          ctx.moveTo(0, -size);
          
          // Lóbulos superiores
          ctx.bezierCurveTo(size * 0.3, -size * 0.8, size * 0.7, -size * 0.8, size * 0.5, -size * 0.5);
          ctx.bezierCurveTo(size * 0.7, -size * 0.3, size * 0.5, -size * 0.2, size * 0.5, 0);
          
          // Lóbulos laterales
          ctx.bezierCurveTo(size * 0.5, size * 0.2, size * 0.3, size * 0.3, 0, size * 0.5);
          ctx.bezierCurveTo(-size * 0.3, size * 0.3, -size * 0.5, size * 0.2, -size * 0.5, 0);
          
          // Lóbulos superiores del otro lado
          ctx.bezierCurveTo(-size * 0.5, -size * 0.2, -size * 0.7, -size * 0.3, -size * 0.5, -size * 0.5);
          ctx.bezierCurveTo(-size * 0.7, -size * 0.8, -size * 0.3, -size * 0.8, 0, -size);
          
          ctx.fillStyle = color;
          ctx.fill();
          
          // Nervaduras
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(0, size * 0.5);
          ctx.moveTo(0, 0);
          ctx.lineTo(size * 0.5, 0);
          ctx.lineTo(size * 0.5, -size * 0.5);
          ctx.moveTo(0, 0);
          ctx.lineTo(-size * 0.5, 0);
          ctx.lineTo(-size * 0.5, -size * 0.5);
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
          
        case 'oak_leaf':
          // Dibujar hoja de roble
          ctx.beginPath();
          ctx.moveTo(0, -size * 0.8);
          
          // Crear lóbulos ondulados
          for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI + Math.PI / 2;
            const radius = size * (0.6 + Math.sin(i * 2) * 0.2);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const cp1x = Math.cos(angle - 0.2) * radius * 1.2;
            const cp1y = Math.sin(angle - 0.2) * radius * 1.2;
            const cp2x = Math.cos(angle + 0.2) * radius * 1.2;
            const cp2y = Math.sin(angle + 0.2) * radius * 1.2;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          }
          
          // Completar la forma
          ctx.bezierCurveTo(-size * 0.3, size * 0.5, -size * 0.3, -size * 0.5, 0, -size * 0.8);
          
          ctx.fillStyle = color;
          ctx.fill();
          
          // Nervadura central
          ctx.beginPath();
          ctx.moveTo(0, -size * 0.8);
          ctx.lineTo(0, size * 0.8);
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
          
        default:
          // Flor simple por defecto
          for (let i = 0; i < 5; i++) {
            drawPetal(ctx, 'oval', size, color, secondaryColor, (i * Math.PI * 2) / 5);
          }
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = centerColor;
          ctx.fill();
      }

      ctx.restore();
    };

    // Inicializar flores
    const initFlowers = () => {
      flowersRef.current = [];
      const numFlowers = Math.min(50, Math.max(20, (canvas.width * canvas.height) / 30000));
      
      for (let i = 0; i < numFlowers; i++) {
        const colors = ['rose', 'pink', 'purple', 'indigo', 'blue', 'teal', 'green', 'yellow', 'orange', 'red'];
        
        flowersRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 1.5 - canvas.height * 0.5, // Algunas fuera de pantalla
          vx: (Math.random() - 0.5) * 0.5,
          vy: Math.random() * 1 + 0.5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          size: Math.random() * 20 + 15,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: flowerTypes[Math.floor(Math.random() * flowerTypes.length)],
          sway: Math.random() * 0.01 + 0.005,
          swayOffset: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.6 + 0.4,
          fallSpeed: Math.random() * 0.3 + 0.2,
          growthState: 0, // Para animación de crecimiento
          growthSpeed: Math.random() * 0.01 + 0.005
        });
      }
    };

    // Ajustar tamaño del canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFlowers(); // Reinicializar flores cuando cambie el tamaño
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Animación principal
    const animate = () => {
      // Limpiar canvas con fade suave
      ctx.fillStyle = isDark
        ? "rgba(5, 5, 20, 0.05)"
        : "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Actualizar viento natural
      const time = Date.now() * 0.001;
      const naturalWindX = Math.sin(time * 0.3) * 0.2;
      
      // Actualizar y dibujar flores
      flowersRef.current.forEach((flower, index) => {
        // Aplicar viento natural y viento del mouse
        const naturalWind = Math.sin(time + flower.swayOffset) * flower.sway;
        
        // Movimiento de caída con viento
        flower.vx += naturalWind + naturalWindX + windRef.current.x;
        flower.vy += flower.fallSpeed + windRef.current.y;
        
        // Aplicar fricción
        flower.vx *= 0.99;
        flower.vy *= 0.99;
        
        // Actualizar posición
        flower.x += flower.vx;
        flower.y += flower.vy;
        
        // Rotación
        flower.rotation += flower.rotationSpeed;
        
        // Animación de crecimiento
        if (flower.growthState < 1) {
          flower.growthState += flower.growthSpeed;
        }
        
        // Resetear flor si sale de la pantalla
        if (flower.y > canvas.height + 50) {
          flower.x = Math.random() * canvas.width;
          flower.y = -50;
          flower.vx = (Math.random() - 0.5) * 0.5;
          flower.vy = Math.random() * 1 + 0.5;
          flower.growthState = 0;
          flower.type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        }
        
        if (flower.x < -50) {
          flower.x = canvas.width + 50;
        } else if (flower.x > canvas.width + 50) {
          flower.x = -50;
        }

        // Dibujar la flor
        drawFlower(ctx, flower);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDark]);

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-green-900 via-teal-900 to-blue-900"
          : "from-green-50 via-teal-50 to-blue-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { FlowingFlowersBackground };