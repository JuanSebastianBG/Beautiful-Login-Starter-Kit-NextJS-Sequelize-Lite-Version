import React, { useState, useEffect, useCallback, useRef } from "react";
import { getRandomColor, getColorVariant, BaseBackground } from "./utils";

const PhysicsRopeBackground = ({ isDark = false }) => {
  const [ropes, setRopes] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [grabbedSegment, setGrabbedSegment] = useState(null);
  const animationRef = useRef();
  const lastFrameTimeRef = useRef(performance.now());

  // Configuración mejorada para física más realista
  const SEGMENT_LENGTH = 30; // Segmentos más cortos para mayor flexibilidad
  const SEGMENTS_COUNT = 20; // Más segmentos para cuerdas más suaves
  const GRAVITY = 0.2; // Gravedad reducida para movimientos más fluidos
  const DAMPING = 0.98; // Mayor amortiguación para reducir oscilaciones eternas
  const AIR_RESISTANCE = 0.02; // Resistencia al aire para realismo
  const CONSTRAINT_ITERATIONS = 8; // Más iteraciones para mayor estabilidad
  const ROPE_COUNT = 10; // Menos cuerdas para mejor rendimiento
  const REPULSION_RADIUS = 60; // Radio de repulsión ajustado
  const REPULSION_STRENGTH = 0.3; // Fuerza de repulsión reducida

  // Inicializar cuerdas con variaciones más naturales
  const initializeRopes = useCallback(() => {
    if (typeof window === "undefined") return [];

    return Array.from({ length: ROPE_COUNT }, (_, ropeIndex) => {
      const x = (window.innerWidth * (ropeIndex + 1)) / (ROPE_COUNT + 1);
      const initialAngle = (Math.random() - 0.5) * Math.PI / 6; // Pequeña inclinación inicial

      return {
        id: ropeIndex,
        segments: Array.from({ length: SEGMENTS_COUNT }, (_, segmentIndex) => ({
          x: x + Math.sin(initialAngle) * segmentIndex * SEGMENT_LENGTH,
          y: Math.cos(initialAngle) * segmentIndex * SEGMENT_LENGTH,
          oldX: x + Math.sin(initialAngle) * segmentIndex * SEGMENT_LENGTH,
          oldY: Math.cos(initialAngle) * segmentIndex * SEGMENT_LENGTH,
          pinned: segmentIndex === 0,
          mass: 1.0 + segmentIndex * 0.01, // Masa creciente para efecto péndulo
        })),
        color: getRandomColor(),
        thickness: 1.5 + Math.random() * 1.5,
        stiffness: 0.95 + Math.random() * 0.05, // Mayor rigidez base
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setRopes(initializeRopes());

    // Reinicializar en resize para ajustar posiciones
    const handleResize = () => setRopes(initializeRopes());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initializeRopes]);

  // Manejo de eventos del mouse con detección mejorada
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      
      let closestSegment = null;
      let minDistance = Infinity;
      
      ropes.forEach((rope) => {
        rope.segments.forEach((segment, index) => {
          if (index === 0) return;
          
          const distance = Math.hypot(segment.x - clickX, segment.y - clickY);
          
          if (distance < 40 && distance < minDistance) { // Radio de agarre reducido
            minDistance = distance;
            closestSegment = { ropeId: rope.id, segmentIndex: index };
          }
        });
      });
      
      if (closestSegment) {
        setIsDragging(true);
        setGrabbedSegment(closestSegment);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setGrabbedSegment(null);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [ropes]);

  // Física mejorada con integración Verlet avanzada
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePhysics = (currentTime) => {
      const deltaTime = Math.min(16.67, currentTime - lastFrameTimeRef.current) / 16.67; // Normalizado a 60fps
      lastFrameTimeRef.current = currentTime;

      setRopes((prevRopes) =>
        prevRopes.map((rope) => {
          const newSegments = rope.segments.map((segment) => ({ ...segment }));

          // Aplicar fuerzas
          newSegments.forEach((segment, index) => {
            if (segment.pinned) return;

            let velocityX = (segment.x - segment.oldX) * DAMPING;
            let velocityY = (segment.y - segment.oldY) * DAMPING;

            // Resistencia al aire proporcional a velocidad
            const speed = Math.hypot(velocityX, velocityY);
            if (speed > 0) {
              const drag = AIR_RESISTANCE * speed;
              velocityX -= (velocityX / speed) * drag;
              velocityY -= (velocityY / speed) * drag;
            }

            segment.oldX = segment.x;
            segment.oldY = segment.y;

            segment.x += velocityX * deltaTime;
            segment.y += (velocityY + GRAVITY) * deltaTime;

            // Arrastrado suave
            if (isDragging && grabbedSegment?.ropeId === rope.id && grabbedSegment.segmentIndex === index) {
              const dx = mousePos.x - segment.x;
              const dy = mousePos.y - segment.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 0) {
                const pullForce = Math.min(1, dist / 100) * 0.5;
                segment.x += dx * pullForce;
                segment.y += dy * pullForce;
              }
            }

            // Repulsión suave y limitada para evitar jitter
            if (!isDragging) {
              const dx = segment.x - mousePos.x;
              const dy = segment.y - mousePos.y;
              const distance = Math.hypot(dx, dy);
              
              if (distance < REPULSION_RADIUS && distance > 0) {
                const force = (REPULSION_RADIUS - distance) / REPULSION_RADIUS * REPULSION_STRENGTH;
                segment.x += (dx / distance) * force * deltaTime;
                segment.y += (dy / distance) * force * deltaTime;
              }
            }
          });

          // Resolver restricciones con relajación mejorada
          for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration++) {
            for (let i = 0; i < newSegments.length - 1; i++) {
              const segmentA = newSegments[i];
              const segmentB = newSegments[i + 1];

              const dx = segmentB.x - segmentA.x;
              const dy = segmentB.y - segmentA.y;
              const distance = Math.hypot(dx, dy);
              if (distance === 0) continue;

              const difference = (SEGMENT_LENGTH - distance) / distance;
              const offsetX = dx * difference * 0.5 * rope.stiffness;
              const offsetY = dy * difference * 0.5 * rope.stiffness;

              const totalMass = segmentA.mass + segmentB.mass;
              const aRatio = segmentB.mass / totalMass;
              const bRatio = segmentA.mass / totalMass;

              if (!segmentA.pinned) {
                segmentA.x -= offsetX * aRatio;
                segmentA.y -= offsetY * aRatio;
              }
              if (!segmentB.pinned) {
                segmentB.x += offsetX * bRatio;
                segmentB.y += offsetY * bRatio;
              }
            }
          }

          // Límites de pantalla con rebote suave
          newSegments.forEach((segment) => {
            if (segment.x < 0) {
              segment.x = 0;
              segment.oldX = segment.x + (segment.x - segment.oldX) * -0.5; // Rebote
            }
            if (segment.x > window.innerWidth) {
              segment.x = window.innerWidth;
              segment.oldX = segment.x + (segment.x - segment.oldX) * -0.5;
            }
            if (segment.y > window.innerHeight) {
              segment.y = window.innerHeight;
              segment.oldY = segment.y + (segment.y - segment.oldY) * -0.5;
            }
            if (segment.y < 0) segment.y = 0;
          });

          return { ...rope, segments: newSegments };
        })
      );

      animationRef.current = requestAnimationFrame(updatePhysics);
    };

    animationRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos, isDragging, grabbedSegment]);

  // Curvas más suaves usando Catmull-Rom spline aproximado
  const createSmoothPath = (segments) => {
    if (segments.length < 2) return "";

    let path = `M ${segments[0].x} ${segments[0].y}`;
    
    for (let i = 1; i < segments.length - 1; i++) {
      const prev = segments[i - 1];
      const curr = segments[i];
      const next = segments[i + 1];

      const cp1x = curr.x - (next.x - prev.x) / 6;
      const cp1y = curr.y - (next.y - prev.y) / 6;
      const cp2x = curr.x + (next.x - prev.x) / 6;
      const cp2y = curr.y + (next.y - prev.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    
    return path;
  };

  return (
    <BaseBackground
      isDark={isDark}
      gradient={
        isDark
          ? "from-indigo-950 via-purple-950 to-black opacity-90"
          : "from-indigo-50 via-purple-50 to-blue-50 opacity-90"
      }
    >
      <div className="absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing overflow-hidden">
        <svg className="w-full h-full">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.2"/>
            </filter>
          </defs>

          {ropes.map((rope) => {
            const pathData = createSmoothPath(rope.segments);
            const isGrabbed = grabbedSegment?.ropeId === rope.id && isDragging;

            return (
              <g key={rope.id} filter="url(#shadow)">
                <path
                  d={pathData}
                  stroke={getColorVariant(rope.color, isDark ? "600" : "300")}
                  strokeWidth={rope.thickness + 1}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.3"
                />
                
                <path
                  d={pathData}
                  stroke={getColorVariant(rope.color, isDark ? "400" : "500")}
                  strokeWidth={rope.thickness}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-150 ease-out"
                  style={{
                    filter: isGrabbed ? "url(#glow)" : "none",
                  }}
                />

                {rope.segments.map((segment, index) => {
                  if (index === 0) {
                    return (
                      <circle
                        key={index}
                        cx={segment.x}
                        cy={segment.y}
                        r={3}
                        fill={getColorVariant(rope.color, isDark ? "200" : "700")}
                        stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                        strokeWidth={0.5}
                      />
                    );
                  }

                  const isGrabbedSegment = grabbedSegment?.ropeId === rope.id && grabbedSegment?.segmentIndex === index;

                  return (
                    <circle
                      key={index}
                      cx={segment.x}
                      cy={segment.y}
                      r={isGrabbedSegment ? 5 : 2}
                      fill={getColorVariant(rope.color, isDark ? "300" : "400")}
                      className="cursor-grab transition-all duration-150"
                      style={{
                        opacity: 0.6 - (index / SEGMENTS_COUNT) * 0.3,
                        filter: isGrabbedSegment ? "url(#glow)" : "none",
                      }}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Partículas mejoradas con más variedad */}
      {[...Array(25)].map((_, i) => {
        const colors = ["purple", "blue", "pink", "cyan", "indigo", "violet"];
        const color = colors[i % colors.length];
        
        return (
          <div
            key={i}
            className="absolute rounded-full blur-sm"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 4}px`,
              height: `${1 + Math.random() * 4}px`,
              backgroundColor: getColorVariant(color, isDark ? "500" : "300"),
              opacity: 0.3 + Math.random() * 0.4,
              animation: `float ${4 + Math.random() * 6}s ease-in-out infinite alternate`,
              animationDelay: `-${Math.random() * 5}s`,
            }}
          />
        );
      })}

      {/* Instrucciones actualizadas */}
      <div className={`absolute top-4 left-4 ${isDark ? 'text-gray-300' : 'text-gray-600'} text-xs opacity-60 pointer-events-none select-none`}>
        Drag rope segments for realistic interaction
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>
    </BaseBackground>
  );
};

export { PhysicsRopeBackground };