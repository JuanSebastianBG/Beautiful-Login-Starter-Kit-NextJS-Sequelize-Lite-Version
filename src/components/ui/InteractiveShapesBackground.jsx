import React, { useState, useRef, useEffect, useCallback } from 'react';

const InteractiveShapesBackground = ({ isDark = true, children }) => {
  const containerRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [draggedShape, setDraggedShape] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [targetMousePos, setTargetMousePos] = useState({ x: 50, y: 50 });
  const animationFrameRef = useRef();

  // Colores más hermosos y vibrantes
  const colors = {
    background: 'from-slate-950 via-purple-950/70 to-indigo-950/80',
    shapes: [
      '#00f5ff', // Cyan brillante
      '#ff6b9d', // Rosa vibrante
      '#4ade80', // Verde esmeralda
      '#fbbf24', // Dorado
      '#a78bfa', // Púrpura suave
      '#60a5fa', // Azul cielo
      '#fde047', // Amarillo brillante
      '#34d399', // Verde menta
      '#fb7185', // Rosa coral
      '#c084fc'  // Lavanda brillante
    ]
  };

  // Inicializar figuras con mejor distribución
  useEffect(() => {
    const initialShapes = [
      { id: 1, type: 'circle', x: 15, y: 20, size: 120, color: colors.shapes[0], deformed: false, deformLevel: 0 },
      { id: 2, type: 'triangle', x: 70, y: 15, size: 100, color: colors.shapes[1], deformed: false, deformLevel: 0 },
      { id: 3, type: 'rectangle', x: 25, y: 65, size: 90, color: colors.shapes[2], deformed: false, deformLevel: 0 },
      { id: 4, type: 'square', x: 75, y: 70, size: 80, color: colors.shapes[3], deformed: false, deformLevel: 0 },
      { id: 5, type: 'hexagon', x: 45, y: 40, size: 110, color: colors.shapes[4], deformed: false, deformLevel: 0 },
      { id: 6, type: 'star', x: 85, y: 25, size: 95, color: colors.shapes[5], deformed: false, deformLevel: 0 },
      { id: 7, type: 'diamond', x: 20, y: 85, size: 85, color: colors.shapes[6], deformed: false, deformLevel: 0 },
      { id: 8, type: 'octagon', x: 60, y: 80, size: 100, color: colors.shapes[7], deformed: false, deformLevel: 0 },
      { id: 9, type: 'pentagon', x: 10, y: 50, size: 90, color: colors.shapes[8], deformed: false, deformLevel: 0 },
      { id: 10, type: 'cross', x: 90, y: 60, size: 85, color: colors.shapes[9], deformed: false, deformLevel: 0 }
    ];
    setShapes(initialShapes);
  }, []);

  // Seguimiento del mouse que ALCANZA la posición objetivo
  const handleBackgroundMouseMove = useCallback((e) => {
    if (draggedShape) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Actualizar posición objetivo
    setTargetMousePos({ x, y });
  }, [draggedShape]);

  // Animación suave que persigue y alcanza el mouse
  useEffect(() => {
    const animateMouseFollow = () => {
      setMousePos(prev => {
        const deltaX = targetMousePos.x - prev.x;
        const deltaY = targetMousePos.y - prev.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Velocidad adaptativa: más rápido cuando está lejos, más lento cuando está cerca
        const baseSpeed = 0.08;
        const adaptiveSpeed = Math.min(baseSpeed + (distance * 0.002), 0.25);
        
        // Si está muy cerca, alcanzar directamente
        if (distance < 0.5) {
          return targetMousePos;
        }
        
        return {
          x: prev.x + deltaX * adaptiveSpeed,
          y: prev.y + deltaY * adaptiveSpeed
        };
      });
      
      animationFrameRef.current = requestAnimationFrame(animateMouseFollow);
    };
    
    animateMouseFollow();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetMousePos]);

  // Manejar inicio de arrastre
  const handleMouseDown = useCallback((e, shape) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDraggedShape(shape.id);
    setDragOffset({
      x: x - shape.x,
      y: y - shape.y
    });
  }, []);

  // Manejar movimiento durante arrastre
  const handleMouseMove = useCallback((e) => {
    if (!draggedShape) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setShapes(prev => prev.map(shape => 
      shape.id === draggedShape 
        ? { 
            ...shape, 
            x: Math.max(5, Math.min(95, x - dragOffset.x)),
            y: Math.max(5, Math.min(95, y - dragOffset.y))
          }
        : shape
    ));
  }, [draggedShape, dragOffset]);

  // Manejar fin de arrastre
  const handleMouseUp = useCallback(() => {
    setDraggedShape(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Manejar click en figura (deformación)
  const handleShapeClick = useCallback((e, shapeId) => {
    e.stopPropagation();
    
    setShapes(prev => prev.map(shape => 
      shape.id === shapeId 
        ? { 
            ...shape, 
            deformed: !shape.deformed,
            deformLevel: shape.deformed ? 0 : Math.random() * 0.4 + 0.3
          }
        : shape
    ));
    
    // Auto-desactivar después de 4 segundos
    setTimeout(() => {
      setShapes(prev => prev.map(shape => 
        shape.id === shapeId 
          ? { ...shape, deformed: false, deformLevel: 0 }
          : shape
      ));
    }, 4000);
  }, []);

  // Agregar event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Función para generar paths de figuras geométricas (igual que antes)
  const getShapePath = (shape) => {
    const { type, size, deformLevel } = shape;
    const deform = deformLevel || 0;
    
    switch (type) {
      case 'circle':
        const circleR = size / 2;
        const d1 = deform * 12;
        const d2 = deform * 8;
        return `M ${circleR + d1} ${circleR} 
                A ${circleR + d1} ${circleR + d2} 0 0 1 ${circleR} ${circleR + d1} 
                A ${circleR + d2} ${circleR + d1} 0 0 1 ${circleR - d1} ${circleR} 
                A ${circleR + d1} ${circleR + d2} 0 0 1 ${circleR} ${circleR - d1} 
                A ${circleR + d2} ${circleR + d1} 0 0 1 ${circleR + d1} ${circleR} Z`;
      
      // ... resto de casos igual que antes ...
      
      default:
        return '';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden bg-gradient-to-br ${colors.background} cursor-default`}
      style={{ userSelect: 'none' }}
      onMouseMove={handleBackgroundMouseMove}
    >
      {/* FONDO COMPLETAMENTE INTERACTIVO Y HERMOSO */}
      
      {/* Gradiente que ALCANZA al mouse */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, 
            #00f5ff 0%, 
            #ff6b9d 15%, 
            #4ade80 30%, 
            #a78bfa 45%, 
            #fbbf24 60%, 
            #60a5fa 75%, 
            transparent 100%)`,
          transition: 'none' // Sin transición para seguimiento fluido
        }}
      />
      
      {/* Ondas que SIGUEN al mouse de cerca */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 opacity-20"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              width: `${(i + 1) * 60}px`,
              height: `${(i + 1) * 60}px`,
              borderColor: colors.shapes[i * 2],
              transform: 'translate(-50%, -50%)',
              animation: `beautifulPulse ${6 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: `0 0 20px ${colors.shapes[i * 2]}40`
            }}
          />
        ))}
      </div>
      
      {/* Partículas que orbitan alrededor del mouse */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 80 + (i % 3) * 30;
          const orbitX = mousePos.x + Math.cos(angle + Date.now() * 0.001) * (radius / window.innerWidth * 100);
          const orbitY = mousePos.y + Math.sin(angle + Date.now() * 0.001) * (radius / window.innerHeight * 100);
          
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${orbitX}%`,
                top: `${orbitY}%`,
                width: `${3 + (i % 3)}px`,
                height: `${3 + (i % 3)}px`,
                background: colors.shapes[i % colors.shapes.length],
                boxShadow: `0 0 15px ${colors.shapes[i % colors.shapes.length]}`,
                transform: 'translate(-50%, -50%)',
                animation: `beautifulFloat ${10 + (i % 5) * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.6
              }}
            />
          );
        })}
      </div>
      
      {/* Rayos que SIGUEN al mouse */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          background: `conic-gradient(from ${mousePos.x * 2}deg at ${mousePos.x}% ${mousePos.y}%, 
            transparent 0deg, 
            #00f5ff 60deg, 
            transparent 120deg, 
            #ff6b9d 180deg, 
            transparent 240deg, 
            #4ade80 300deg, 
            transparent 360deg)`,
          transition: 'none' // Sin transición para seguimiento fluido
        }}
      />
      
      {/* Figuras geométricas mejoradas */}
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute transition-all duration-500 ease-out"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            transform: 'translate(-50%, -50%)',
            cursor: draggedShape === shape.id ? 'grabbing' : 'grab',
            filter: `blur(${shape.deformed ? '4px' : '1px'}) drop-shadow(0 0 25px ${shape.color}) brightness(1.3) saturate(1.2)`,
            zIndex: draggedShape === shape.id ? 50 : 10
          }}
          onMouseDown={(e) => handleMouseDown(e, shape)}
          onClick={(e) => handleShapeClick(e, shape.id)}
        >
          <svg
            width={shape.type === 'rectangle' ? shape.size * 1.5 : shape.size}
            height={shape.size}
            className="transition-all duration-500 ease-out"
            style={{
              transform: `scale(${draggedShape === shape.id ? 1.15 : shape.deformed ? 1.1 : 1}) rotate(${shape.deformed ? shape.deformLevel * 45 : 0}deg)`,
              opacity: shape.deformed ? 0.9 : 0.8
            }}
          >
            <defs>
              <filter id={`beautifulGlow-${shape.id}`}>
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
              <radialGradient id={`beautifulRadial-${shape.id}`} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="40%" stopColor={shape.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={shape.color} stopOpacity="0.4" />
              </radialGradient>
            </defs>
            
            <path
              d={getShapePath(shape)}
              fill={`url(#beautifulRadial-${shape.id})`}
              stroke={shape.color}
              strokeWidth="2.5"
              filter={`url(#beautifulGlow-${shape.id})`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          
          {/* Efectos de deformación mejorados */}
          {shape.deformed && (
            <>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${shape.color}40 0%, transparent 70%)`,
                  transform: 'translate(-25%, -25%) scale(2)',
                  animation: 'beautifulPing 2s ease-out infinite'
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${shape.color}20 0%, transparent 50%)`,
                  transform: 'translate(-50%, -50%) scale(3)',
                  animation: 'beautifulPulse 3s ease-in-out infinite'
                }}
              />
            </>
          )}
        </div>
      ))}
      
      {/* Contenido */}
      {children}
      
      {/* Estilos CSS mejorados */}
      <style jsx>{`
        @keyframes beautifulPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.1; }
        }
        
        @keyframes beautifulPing {
          0% { transform: translate(-25%, -25%) scale(1); opacity: 0.4; }
          100% { transform: translate(-25%, -25%) scale(2.5); opacity: 0; }
        }
        
        @keyframes beautifulFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-8px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-4px) rotate(180deg) scale(0.9); }
          75% { transform: translateY(-12px) rotate(270deg) scale(1.05); }
        }
        
        svg:hover {
          filter: brightness(1.5) drop-shadow(0 0 35px currentColor) saturate(1.4) !important;
          transform: scale(1.08) !important;
          transition: all 0.3s ease-out !important;
        }
      `}</style>
    </div>
  );
};

export { InteractiveShapesBackground };