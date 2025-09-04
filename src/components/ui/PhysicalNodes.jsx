import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

// Fondo de Nodos con Física de Red (Completamente Mejorado)
const NetworkNodesBackground = ({ isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const nodesRef = useRef([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const lastMouseUpdateRef = useRef(0);
  const isVisibleRef = useRef(true);

  // Inicializar nodos con menos cantidad
  const initializeNodes = useCallback(() => {
    if (typeof window === "undefined") return [];

    // Reducimos significativamente la cantidad de nodos
    const nodeCount = Math.min(25, Math.floor((window.innerWidth * window.innerHeight) / 25000));
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 3 + 2.5,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        color: getRandomColor(),
        mass: Math.random() * 8 + 5,
        energy: Math.random() * 0.5 + 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    return nodes;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    nodesRef.current = initializeNodes();

    const handleResize = () => {
      nodesRef.current = initializeNodes();
    };

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMouseUpdateRef.current > 16) {
        setMousePos({ x: e.clientX, y: e.clientY });
        lastMouseUpdateRef.current = now;
      }
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initializeNodes]);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const animate = () => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentTime = Date.now() * 0.001;
      const nodes = nodesRef.current;

      // Actualizar física de nodos
      nodes.forEach((node, i) => {
        let fx = 0;
        let fy = 0;

        // Fuerza del mouse (atracción/repulsión)
        const dx = mousePos.x - node.x;
        const dy = mousePos.y - node.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < 250) {
          const force = (160 / (distToMouse + 1)) * 0.07;
          fx += dx * force;
          fy += dy * force;
        }

        // Fuerzas entre nodos
        nodes.forEach((otherNode, j) => {
          if (i === j) return;

          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            // Repulsión
            const force = -0.028 / (distance + 1);
            fx += dx * force;
            fy += dy * force;
          }
        });

        // Fuerza hacia el centro
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dxCenter = centerX - node.x;
        const dyCenter = centerY - node.y;
        const distToCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

        fx += dxCenter * 0.00007 * distToCenter;
        fy += dyCenter * 0.00007 * distToCenter;

        // Actualizar velocidad y posición
        node.vx = (node.vx + fx / node.mass) * 0.99;
        node.vy = (node.vy + fy / node.mass) * 0.99;

        node.x += node.vx;
        node.y += node.vy;

        // Rebote en bordes
        if (node.x < 0 || node.x > canvas.width) {
          node.vx *= -0.8;
          node.x = Math.max(0, Math.min(canvas.width, node.x));
        }
        if (node.y < 0 || node.y > canvas.height) {
          node.vy *= -0.8;
          node.y = Math.max(0, Math.min(canvas.height, node.y));
        }
      });

      // Dibujar conexiones nítidas
      ctx.lineWidth = 1.5;
      
      for (let i = 0; i < nodes.length; i++) {
        const node1 = nodes[i];
        
        for (let j = i + 1; j < nodes.length; j++) {
          const node2 = nodes[j];
          const dx = node1.x - node2.x;
          const dy = node1.y - node2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            const alpha = ((200 - distance) / 200) * 0.6;
            
            ctx.beginPath();
            ctx.moveTo(node1.x, node1.y);
            ctx.lineTo(node2.x, node2.y);
            
            // Gradiente en la línea
            const gradient = ctx.createLinearGradient(node1.x, node1.y, node2.x, node2.y);
            const color1 = getColorVariant(node1.color, isDark ? "400" : "500");
            const color2 = getColorVariant(node2.color, isDark ? "400" : "500");
            
            gradient.addColorStop(0, color1 + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, color2 + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            
            ctx.strokeStyle = gradient;
            ctx.stroke();
          }
        }
      }

      // Dibujar nodos nítidos con efectos
      nodes.forEach((node) => {
        const pulse = Math.sin(currentTime * 2 + node.pulsePhase) * 0.25 + 1;
        const currentRadius = node.radius * pulse;
        
        // Halo exterior
        const haloGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, currentRadius * 4
        );
        const haloColor = getColorVariant(node.color, isDark ? "300" : "400");
        haloGradient.addColorStop(0, haloColor + "70");
        haloGradient.addColorStop(0.6, haloColor + "20");
        haloGradient.addColorStop(1, haloColor + "00");
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * 4, 0, Math.PI * 2);
        ctx.fillStyle = haloGradient;
        ctx.fill();
        
        // Nodo principal
        const nodeGradient = ctx.createRadialGradient(
          node.x - currentRadius * 0.3, node.y - currentRadius * 0.3, 0,
          node.x, node.y, currentRadius
        );
        const nodeColor = getColorVariant(node.color, isDark ? "200" : "600");
        const nodeDarkColor = getColorVariant(node.color, isDark ? "500" : "800");
        
        nodeGradient.addColorStop(0, nodeColor);
        nodeGradient.addColorStop(1, nodeDarkColor);
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeGradient;
        ctx.fill();
        
        // Brillo central nítido
        const highlightGradient = ctx.createRadialGradient(
          node.x - currentRadius * 0.4, node.y - currentRadius * 0.4, 0,
          node.x - currentRadius * 0.4, node.y - currentRadius * 0.4, currentRadius * 0.5
        );
        highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.beginPath();
        ctx.arc(node.x - currentRadius * 0.4, node.y - currentRadius * 0.4, currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = highlightGradient;
        ctx.fill();
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
          ? "from-slate-900 via-blue-900 to-indigo-900"
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