import React, { useState, useRef, useEffect, useCallback } from 'react';

const InteractiveShapesBackground = ({ isDark = true, children }) => {
  const containerRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [draggedShape, setDraggedShape] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Colores vibrantes e interactivos
  const colors = {
    background: 'from-slate-900 via-purple-900/50 to-slate-900',
    shapes: [
      '#4dd0e1', '#f48fb1', '#aed581', '#ffb74d', '#ce93d8',
      '#90caf9', '#fff176', '#81c784', '#ffab91', '#b39ddb'
    ]
  };

  // Inicializar figuras
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

  // Seguimiento del mouse INTERACTIVO
  const handleBackgroundMouseMove = useCallback((e) => {
    if (draggedShape) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePos(prev => ({
      x: prev.x + (x - prev.x) * 0.02,
      y: prev.y + (y - prev.y) * 0.02
    }));
  }, [draggedShape]);

  // ... resto del código igual que el original ...

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden bg-gradient-to-br ${colors.background} cursor-default`}
      style={{ userSelect: 'none' }}
      onMouseMove={handleBackgroundMouseMove}
    >
      {/* FONDO COMPLETAMENTE INTERACTIVO */}
      
      {/* Gradiente que sigue al mouse */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, 
            #4dd0e1 0%, #f48fb1 20%, #ce93d8 40%, #90caf9 60%, #aed581 80%, transparent 100%)`,
          transition: 'background 2s ease-out'
        }}
      />
      
      {/* Ondas que siguen al mouse */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border opacity-10"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              width: `${(i + 1) * 80}px`,
              height: `${(i + 1) * 80}px`,
              borderColor: colors.shapes[i * 3],
              transform: 'translate(-50%, -50%)',
              animation: `slowPulse ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1}s`
            }}
          />
        ))}
      </div>
      
      {/* Rayos que siguen al mouse */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `conic-gradient(from ${mousePos.x * 1.8}deg at ${mousePos.x}% ${mousePos.y}%, 
            transparent 0deg, #4dd0e1 90deg, transparent 180deg, #f48fb1 270deg, transparent 360deg)`,
          transition: 'background 3s ease-out'
        }}
      />
      {children}
    </div>
  );
};

export { InteractiveShapesBackground };