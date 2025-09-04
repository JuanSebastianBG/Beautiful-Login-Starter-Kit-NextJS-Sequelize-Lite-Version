import React, { useState, useRef, useEffect, useCallback } from 'react';

const MinimalCirclesBackground = ({ isDark = true, children }) => {
  // Estados para el mouse (mismo método que LiquidBackground)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const containerRef = useRef(null);
  const moveTimeoutRef = useRef(null);
  
  const [circles, setCircles] = useState([]);
  const [clickedCircles, setClickedCircles] = useState(new Set());
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Función para manejar movimiento del mouse (mismo método optimizado)
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    setIsMoving(true);
    
    clearTimeout(moveTimeoutRef.current);
    moveTimeoutRef.current = setTimeout(() => {
      setIsMoving(false);
    }, 150);
  }, []);

  // Inicializar círculos con colores más claros y visibles
  const initializeCircles = useCallback(() => {
    const newCircles = [];
    const colors = [
      { hue: 200, sat: 80, light: 70 }, // Azul claro
      { hue: 280, sat: 75, light: 75 }, // Púrpura claro
      { hue: 180, sat: 70, light: 65 }, // Cyan claro
      { hue: 320, sat: 85, light: 70 }, // Rosa claro
      { hue: 60, sat: 80, light: 75 },  // Amarillo claro
      { hue: 120, sat: 70, light: 70 }, // Verde claro
    ];
    
    for (let i = 0; i < 12; i++) {
      const color = colors[i % colors.length];
      newCircles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 120 + 100, // Tamaños entre 100px y 220px
        speedX: (Math.random() - 0.5) * 0.5, // Velocidad más notable
        speedY: (Math.random() - 0.5) * 0.5,
        hue: color.hue,
        saturation: color.sat,
        lightness: color.light,
        opacity: Math.random() * 0.3 + 0.4, // Más opacidad (0.4-0.7)
        blur: Math.random() * 20 + 25, // Menos blur para más visibilidad (25-45px)
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
    setCircles(newCircles);
  }, []);

  // Animar círculos con movimiento fluido
  const animateCircles = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 16) { // 60fps
      animationRef.current = requestAnimationFrame(animateCircles);
      return;
    }
    lastUpdateRef.current = now;
    
    setCircles(prev => prev.map(circle => {
      let newX = circle.x + circle.speedX;
      let newY = circle.y + circle.speedY;
      let newSpeedX = circle.speedX;
      let newSpeedY = circle.speedY;

      // Rebote suave en bordes
      if (newX <= -5 || newX >= 105) {
        newSpeedX = -newSpeedX * 0.8; // Amortiguación
        newX = Math.max(-5, Math.min(105, newX));
      }
      if (newY <= -5 || newY >= 105) {
        newSpeedY = -newSpeedY * 0.8;
        newY = Math.max(-5, Math.min(105, newY));
      }

      // Efecto de pulsación sutil
      const pulse = Math.sin(now * circle.pulseSpeed) * 0.1 + 1;

      return {
        ...circle,
        x: newX,
        y: newY,
        speedX: newSpeedX,
        speedY: newSpeedY,
        currentPulse: pulse
      };
    }));

    animationRef.current = requestAnimationFrame(animateCircles);
  }, []);

  // Manejar click en círculos con transición automática
  const handleCircleClick = useCallback((circleId, e) => {
    e.stopPropagation();
    
    setClickedCircles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(circleId)) {
        newSet.delete(circleId);
      } else {
        newSet.add(circleId);
      }
      return newSet;
    });
    
    // Auto-desactivar después de 3 segundos
    setTimeout(() => {
      setClickedCircles(prev => {
        const newSet = new Set(prev);
        newSet.delete(circleId);
        return newSet;
      });
    }, 3000);
  }, []);

  // Inicializar y animar
  useEffect(() => {
    initializeCircles();
    animateCircles();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeCircles, animateCircles]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden cursor-none bg-gradient-to-br from-slate-900 via-gray-900 to-black"
      onMouseMove={handleMouseMove}
    >
      {/* Círculos flotantes con colores claros y visibles */}
      {circles.map((circle) => {
        const isClicked = clickedCircles.has(circle.id);
        const currentSize = circle.size * (circle.currentPulse || 1);
        
        return (
          <div
            key={circle.id}
            className="absolute rounded-full cursor-pointer"
            style={{
              left: `${circle.x}%`,
              top: `${circle.y}%`,
              width: `${currentSize}px`,
              height: `${currentSize}px`,
              background: `radial-gradient(circle at 30% 30%, 
                hsla(${circle.hue}, ${circle.saturation}%, ${circle.lightness}%, ${circle.opacity}), 
                hsla(${circle.hue}, ${circle.saturation - 10}%, ${circle.lightness - 10}%, ${circle.opacity * 0.8}), 
                hsla(${circle.hue}, ${circle.saturation - 20}%, ${circle.lightness - 20}%, ${circle.opacity * 0.5}), 
                transparent)`,
              transform: `translate(-50%, -50%) scale(${isClicked ? 1.5 : 1})`,
              filter: `blur(${isClicked ? circle.blur * 0.5 : circle.blur}px) brightness(${isClicked ? 1.3 : 1})`,
              opacity: isClicked ? 0.9 : 1,
              zIndex: isClicked ? 10 : 1,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isClicked 
                ? `0 0 40px hsla(${circle.hue}, ${circle.saturation}%, ${circle.lightness}%, 0.6), 0 0 80px hsla(${circle.hue}, ${circle.saturation}%, ${circle.lightness}%, 0.3)`
                : `0 0 20px hsla(${circle.hue}, ${circle.saturation}%, ${circle.lightness}%, 0.3)`
            }}
            onClick={(e) => handleCircleClick(circle.id, e)}
          />
        );
      })}

      {/* Mouse Tracker - Bolita más visible */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: `${mousePos.x - 15}px`,
          top: `${mousePos.y - 15}px`,
          width: '30px',
          height: '30px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.3) 80%, transparent 100%)',
          borderRadius: '50%',
          transition: isMoving ? 'none' : 'transform 0.2s ease-out',
          filter: 'blur(0.5px)',
          boxShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)',
          transform: isMoving ? 'scale(1.4)' : 'scale(1)',
          willChange: 'transform, left, top'
        }}
      />

      {/* Contenido */}
      {children}
    </div>
  );
};

export { MinimalCirclesBackground };