import React, { useState, useRef, useEffect, useCallback } from 'react';

const DeformableShapesBackground = ({ isDark = true, children }) => {
  const containerRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [draggedShape, setDraggedShape] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Colores más suaves y relajados
  const colors = {
    background: 'from-slate-900 via-purple-900/50 to-slate-900',
    shapes: [
      '#4dd0e1', // Cyan suave
      '#f48fb1', // Rosa suave
      '#aed581', // Verde suave
      '#ffb74d', // Naranja suave
      '#ce93d8', // Púrpura suave
      '#90caf9', // Azul suave
      '#fff176', // Amarillo suave
      '#81c784', // Verde menta suave
      '#ffab91', // Coral suave
      '#b39ddb'  // Lavanda suave
    ]
  };

  // Inicializar 10 figuras geométricas diferentes
  useEffect(() => {
    const initialShapes = [
      {
        id: 1,
        type: 'circle',
        x: 15,
        y: 20,
        size: 120,
        color: colors.shapes[0],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 2,
        type: 'triangle',
        x: 70,
        y: 15,
        size: 100,
        color: colors.shapes[1],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 3,
        type: 'rectangle',
        x: 25,
        y: 65,
        size: 90,
        color: colors.shapes[2],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 4,
        type: 'square',
        x: 75,
        y: 70,
        size: 80,
        color: colors.shapes[3],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 5,
        type: 'hexagon',
        x: 45,
        y: 40,
        size: 110,
        color: colors.shapes[4],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 6,
        type: 'star',
        x: 85,
        y: 25,
        size: 95,
        color: colors.shapes[5],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 7,
        type: 'diamond',
        x: 20,
        y: 85,
        size: 85,
        color: colors.shapes[6],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 8,
        type: 'octagon',
        x: 60,
        y: 80,
        size: 100,
        color: colors.shapes[7],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 9,
        type: 'pentagon',
        x: 10,
        y: 50,
        size: 90,
        color: colors.shapes[8],
        deformed: false,
        deformLevel: 0
      },
      {
        id: 10,
        type: 'cross',
        x: 90,
        y: 60,
        size: 85,
        color: colors.shapes[9],
        deformed: false,
        deformLevel: 0
      }
    ];
    setShapes(initialShapes);
  }, []);

  // Manejar movimiento del mouse (MUY LENTO Y SUAVE)
  const handleBackgroundMouseMove = useCallback((e) => {
    if (draggedShape) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Transición muy lenta y suave
    setMousePos(prev => ({
      x: prev.x + (x - prev.x) * 0.02, // Muy lento
      y: prev.y + (y - prev.y) * 0.02
    }));
  }, [draggedShape]);

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
            deformLevel: shape.deformed ? 0 : Math.random() * 0.3 + 0.2
          }
        : shape
    ));
    
    // Auto-desactivar después de 5 segundos
    setTimeout(() => {
      setShapes(prev => prev.map(shape => 
        shape.id === shapeId 
          ? { ...shape, deformed: false, deformLevel: 0 }
          : shape
      ));
    }, 5000);
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

  // Función para generar paths de figuras geométricas
  const getShapePath = (shape) => {
    const { type, size, deformLevel } = shape;
    const deform = deformLevel || 0;
    
    switch (type) {
      case 'circle':
        const circleR = size / 2;
        const d1 = deform * 8;
        const d2 = deform * 6;
        return `M ${circleR + d1} ${circleR} 
                A ${circleR + d1} ${circleR + d2} 0 0 1 ${circleR} ${circleR + d1} 
                A ${circleR + d2} ${circleR + d1} 0 0 1 ${circleR - d1} ${circleR} 
                A ${circleR + d1} ${circleR + d2} 0 0 1 ${circleR} ${circleR - d1} 
                A ${circleR + d2} ${circleR + d1} 0 0 1 ${circleR + d1} ${circleR} Z`;
      
      case 'triangle':
        const tSize = size;
        const td = deform * 10;
        return `M ${tSize/2 + td} ${10 - td} 
                L ${tSize - 10 + td} ${tSize - 10 + td} 
                L ${10 - td} ${tSize - 10 - td} Z`;
      
      case 'rectangle':
        const rWidth = size * 1.5;
        const rHeight = size;
        const rd = deform * 8;
        return `M ${10 + rd} ${10 - rd} 
                L ${rWidth - 10 - rd} ${10 + rd} 
                L ${rWidth - 10 + rd} ${rHeight - 10 + rd} 
                L ${10 - rd} ${rHeight - 10 - rd} Z`;
      
      case 'square':
        const sSize = size;
        const sd = deform * 8;
        return `M ${10 + sd} ${10 - sd} 
                L ${sSize - 10 - sd} ${10 + sd} 
                L ${sSize - 10 + sd} ${sSize - 10 + sd} 
                L ${10 - sd} ${sSize - 10 - sd} Z`;
      
      case 'hexagon':
        const hexR = size / 2;
        const hexCx = hexR;
        const hexCy = hexR;
        const hd = deform * 8;
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = hexCx + (hexR + (i % 2 === 0 ? hd : -hd)) * Math.cos(angle);
          const y = hexCy + (hexR + (i % 2 === 0 ? -hd : hd)) * Math.sin(angle);
          points.push(`${x} ${y}`);
        }
        return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`;
      
      case 'star':
        const outerR = size / 2;
        const innerR = outerR * 0.4;
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? outerR + deform * 8 : innerR - deform * 5;
          const x = outerR + radius * Math.cos(angle - Math.PI / 2);
          const y = outerR + radius * Math.sin(angle - Math.PI / 2);
          starPoints.push(`${x} ${y}`);
        }
        return `M ${starPoints[0]} L ${starPoints.slice(1).join(' L ')} Z`;
      
      case 'diamond':
        const dSize = size;
        const dd = deform * 12;
        return `M ${dSize/2 + dd} ${10 - dd} 
                L ${dSize - 10 + dd} ${dSize/2 + dd} 
                L ${dSize/2 - dd} ${dSize - 10 + dd} 
                L ${10 - dd} ${dSize/2 - dd} Z`;
      
      case 'octagon':
        const octR = size / 2;
        const octCx = octR;
        const octCy = octR;
        const octD = deform * 6;
        const octPoints = [];
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x = octCx + (octR + (i % 2 === 0 ? octD : -octD)) * Math.cos(angle);
          const y = octCy + (octR + (i % 2 === 0 ? -octD : octD)) * Math.sin(angle);
          octPoints.push(`${x} ${y}`);
        }
        return `M ${octPoints[0]} L ${octPoints.slice(1).join(' L ')} Z`;
      
      case 'pentagon':
        const pentR = size / 2;
        const pentCx = pentR;
        const pentCy = pentR;
        const pentD = deform * 8;
        const pentPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = pentCx + (pentR + (i % 2 === 0 ? pentD : -pentD)) * Math.cos(angle);
          const y = pentCy + (pentR + (i % 2 === 0 ? -pentD : pentD)) * Math.sin(angle);
          pentPoints.push(`${x} ${y}`);
        }
        return `M ${pentPoints[0]} L ${pentPoints.slice(1).join(' L ')} Z`;
      
      case 'cross':
        const cSize = size;
        const thickness = cSize * 0.3;
        const cd = deform * 10;
        return `M ${cSize/2 - thickness/2 + cd} ${10 - cd}
                L ${cSize/2 + thickness/2 - cd} ${10 + cd}
                L ${cSize/2 + thickness/2 + cd} ${cSize/2 - thickness/2 - cd}
                L ${cSize - 10 + cd} ${cSize/2 - thickness/2 + cd}
                L ${cSize - 10 - cd} ${cSize/2 + thickness/2 - cd}
                L ${cSize/2 + thickness/2 - cd} ${cSize/2 + thickness/2 + cd}
                L ${cSize/2 + thickness/2 + cd} ${cSize - 10 - cd}
                L ${cSize/2 - thickness/2 - cd} ${cSize - 10 + cd}
                L ${cSize/2 - thickness/2 + cd} ${cSize/2 + thickness/2 - cd}
                L ${10 - cd} ${cSize/2 + thickness/2 + cd}
                L ${10 + cd} ${cSize/2 - thickness/2 - cd}
                L ${cSize/2 - thickness/2 - cd} ${cSize/2 - thickness/2 + cd} Z`;
      
      default:
        return '';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden bg-gradient-to-br ${colors.background} cursor-default`}
      style={{ userSelect: 'none' }}
    >
      {/* FONDO ESTÁTICO - SIN MOVIMIENTO DEL MOUSE */}
      
      {/* Gradiente de fondo fijo */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            #4dd0e1 0%, 
            #f48fb1 20%, 
            #ce93d8 40%, 
            #90caf9 60%, 
            #aed581 80%, 
            transparent 100%)`
        }}
      />
      
      {/* Ondas de energía estáticas */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border opacity-10"
            style={{
              left: '50%',
              top: '50%',
              width: `${(i + 1) * 80}px`,
              height: `${(i + 1) * 80}px`,
              borderColor: colors.shapes[i * 3],
              transform: 'translate(-50%, -50%)',
              animation: `staticPulse ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1}s`
            }}
          />
        ))}
      </div>
      
      {/* Partículas flotantes estáticas */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: colors.shapes[i % colors.shapes.length],
              boxShadow: `0 0 10px ${colors.shapes[i % colors.shapes.length]}`,
              animation: `staticFloat ${15 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3
            }}
          />
        ))}
      </div>
      
      {/* Rayos de luz estáticos */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, 
            transparent 0deg, 
            #4dd0e1 90deg, 
            transparent 180deg, 
            #f48fb1 270deg, 
            transparent 360deg)`
        }}
      />
      
      {/* Figuras geométricas deformables y arrastrables */}
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute transition-all duration-1000 ease-out"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            transform: 'translate(-50%, -50%)',
            cursor: draggedShape === shape.id ? 'grabbing' : 'grab',
            filter: `blur(${shape.deformed ? '6px' : '2px'}) drop-shadow(0 0 15px ${shape.color}) brightness(1.1)`,
            zIndex: draggedShape === shape.id ? 50 : 10
          }}
          onMouseDown={(e) => handleMouseDown(e, shape)}
          onClick={(e) => handleShapeClick(e, shape.id)}
        >
          <svg
            width={shape.type === 'rectangle' ? shape.size * 1.5 : shape.size}
            height={shape.size}
            className="transition-all duration-1000 ease-out" // MUY LENTO
            style={{
              transform: `scale(${draggedShape === shape.id ? 1.1 : 1}) rotate(${shape.deformed ? shape.deformLevel * 30 : 0}deg)`, // Menos rotación
              opacity: shape.deformed ? 0.8 : 0.6
            }}
          >
            <defs>
              <filter id={`glow-${shape.id}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/> {/* Menos blur */}
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
              <radialGradient id={`radial-${shape.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={shape.color} stopOpacity="0.8" />
                <stop offset="70%" stopColor={shape.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={shape.color} stopOpacity="0.2" />
              </radialGradient>
            </defs>
            
            <path
              d={getShapePath(shape)}
              fill={`url(#radial-${shape.id})`}
              stroke={shape.color}
              strokeWidth="2" // Más delgado
              filter={`url(#glow-${shape.id})`}
              className="transition-all duration-1000 ease-out" // MUY LENTO
            />
          </svg>
          
          {/* Efecto de ondas expansivas LENTAS al hacer click */}
          {shape.deformed && (
            <>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${shape.color}30 0%, transparent 70%)`,
                  transform: 'translate(-25%, -25%) scale(1.5)', // Menos escala
                  animation: 'slowPing 3s ease-out infinite' // MUY LENTO
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${shape.color}20 0%, transparent 50%)`,
                  transform: 'translate(-50%, -50%) scale(2)',
                  animation: 'slowPulse 4s ease-in-out infinite' // MUY LENTO
                }}
              />
            </>
          )}
        </div>
      ))}
      
      {/* Contenido */}
      {children}
      
      {/* Estilos CSS estáticos */}
      <style jsx>{`
        @keyframes staticPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.05; }
        }
        
        @keyframes staticFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(45deg); }
          50% { transform: translateY(-5px) rotate(90deg); }
          75% { transform: translateY(-15px) rotate(135deg); }
        }
        
        @keyframes deformPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(2deg); }
        }
        
        .deformed {
          animation: deformPulse 4s ease-in-out infinite;
        }
        
        svg {
          transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        svg:hover {
          filter: brightness(1.2) drop-shadow(0 0 20px currentColor) saturate(1.2);
          transform: scale(1.02) !important;
          transition: all 2s ease-out;
        }
      `}</style>
    </div>
  );
};

export { DeformableShapesBackground };