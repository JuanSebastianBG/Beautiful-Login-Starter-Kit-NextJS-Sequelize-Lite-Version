import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// 4. Fondo de Nodos con Física de Red (Mejorado)
const NetworkNodesBackground = ({ isDark = false }) => {
  const [nodes, setNodes] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();

  // Inicializar nodos - Aumentamos el número de nodos para más densidad
  const initializeNodes = useCallback(() => {
    if (typeof window === "undefined") return [];

    return Array.from({ length: 100 }, () => ({  // Aumentado de 50 a 100
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 4 + 3,  // Radio ligeramente mayor para mejor visibilidad
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: getRandomColor(),
      mass: Math.random() * 10 + 5,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setNodes(initializeNodes());

    const handleResize = () => {
      setNodes(initializeNodes());
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
  }, [initializeNodes]);

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

      // Actualizar nodos
      setNodes((prevNodes) => {
        const updatedNodes = prevNodes.map((node) => {
          // Calcular fuerzas entre nodos
          let fx = 0;
          let fy = 0;

          // Fuerza del mouse - Aumentamos el radio de influencia
          const dx = mousePos.x - node.x;
          const dy = mousePos.y - node.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          if (distToMouse < 200) {  // Aumentado de 150 a 200
            // Repulsión del mouse - Fuerza más fuerte
            const force = (-200 / (distToMouse + 1)) * 0.1;  // Aumentado de 0.05 a 0.1
            fx += dx * force;
            fy += dy * force;
          }

          // Fuerzas entre nodos - Ajustamos para más interacción
          prevNodes.forEach((otherNode) => {
            if (node === otherNode) return;

            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {  // Aumentado de 150 a 200
              // Repulsión entre nodos - Fuerza ajustada
              const force = -0.02 / (distance + 1);  // Aumentado de -0.01 a -0.02
              fx += dx * force;
              fy += dy * force;
            }
          });

          // Fuerza hacia el centro - Ligeramente más fuerte
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const dxCenter = centerX - node.x;
          const dyCenter = centerY - node.y;
          const distToCenter = Math.sqrt(
            dxCenter * dxCenter + dyCenter * dyCenter
          );

          fx += dxCenter * 0.0001 * distToCenter;  // Aumentado de 0.00005 a 0.0001
          fy += dyCenter * 0.0001 * distToCenter;

          // Actualizar velocidad
          let vx = (node.vx + fx / node.mass) * 0.98; // Fricción
          let vy = (node.vy + fy / node.mass) * 0.98;

          // Actualizar posición
          let x = node.x + vx;
          let y = node.y + vy;

          // Mantener dentro de los límites
          if (x < 0) {
            x = 0;
            vx *= -0.5;
          }
          if (x > canvas.width) {
            x = canvas.width;
            vx *= -0.5;
          }
          if (y < 0) {
            y = 0;
            vy *= -0.5;
          }
          if (y > canvas.height) {
            y = canvas.height;
            vy *= -0.5;
          }

          return { ...node, x, y, vx, vy };
        });

        // Dibujar conexiones - Mejoramos visibilidad
        ctx.strokeStyle = isDark
          ? "rgba(255, 255, 255, 0.3)"  // Aumentado alpha de 0.1 a 0.3
          : "rgba(100, 100, 255, 0.4)";  // Aumentado alpha de 0.1 a 0.4 y más opaco en light mode
        ctx.lineWidth = 1;  // Aumentado de 0.5 a 1 para líneas más gruesas

        for (let i = 0; i < updatedNodes.length; i++) {
          const node1 = updatedNodes[i];

          for (let j = i + 1; j < updatedNodes.length; j++) {
            const node2 = updatedNodes[j];
            const dx = node1.x - node2.x;
            const dy = node1.y - node2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {  // Aumentado umbral de 150 a 200 para más conexiones
              ctx.beginPath();
              ctx.moveTo(node1.x, node1.y);
              ctx.lineTo(node2.x, node2.y);
              ctx.globalAlpha = ((200 - distance) / 200) * 0.8;  // Aumentado alpha máx de 0.5 a 0.8
              ctx.stroke();
            }
          }
        }

        // Reset alpha para nodos
        ctx.globalAlpha = 1;

        // Dibujar nodos - Mejoramos visibilidad
        updatedNodes.forEach((node) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = getColorVariant(node.color, isDark ? "300" : "600");  // Colores más vibrantes/oscuros en light mode
          ctx.globalAlpha = 1;  // Opacidad completa para nodos
          ctx.fill();

          // Halo alrededor del nodo - Más visible
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);  // Halo más grande
          ctx.fillStyle = getColorVariant(node.color, isDark ? "500" : "400");
          ctx.globalAlpha = 0.3;  // Aumentado de 0.1 a 0.3
          ctx.fill();
        });

        return updatedNodes;
      });

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
          ? "from-gray-900 via-indigo-900 to-black"
          : "from-blue-50 via-indigo-50 to-purple-50"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
      />
    </BaseBackground>
  );
};

export { NetworkNodesBackground };