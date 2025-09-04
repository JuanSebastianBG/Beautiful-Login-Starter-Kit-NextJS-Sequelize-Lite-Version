import React, { useState, useRef, useEffect, useCallback } from 'react';

const LiquidBackground = ({ isDark = true, children }) => {
  // Estados para el mouse
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const containerRef = useRef(null);
  const moveTimeoutRef = useRef(null);
  
  const [droplets, setDroplets] = useState([]);
  const [ripples, setRipples] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  // Configuración de colores según el tema - Más colores
  const colors = isDark ? {
    background: 'from-slate-900 via-slate-800 to-slate-900',
    primary: '#3b82f6',
    secondary: '#8b5cf6', 
    accent: '#06b6d4',
    pink: '#ec4899',
    orange: '#f97316',
    green: '#10b981',
    yellow: '#eab308',
    red: '#ef4444',
    cursor: 'rgba(255,255,255,0.95)'
  } : {
    background: 'from-blue-50 via-indigo-50 to-purple-50',
    primary: '#60a5fa',
    secondary: '#a78bfa',
    accent: '#22d3ee',
    pink: '#f472b6',
    orange: '#fb923c',
    green: '#34d399',
    yellow: '#fbbf24',
    red: '#f87171',
    cursor: 'rgba(59,130,246,0.8)'
  };

  // Función para manejar movimiento del mouse - OPTIMIZADA
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    if (!isMoving) {
      setIsMoving(true);
    }
    
    // Crear gota ocasionalmente (reducir frecuencia para mejor performance)
    if (Math.random() < 0.08) {
      const newDroplet = {
        id: Date.now() + Math.random(),
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        size: Math.random() * 6 + 3,
        opacity: 0.5,
        life: 0
      };
      
      setDroplets(prev => [...prev.slice(-3), newDroplet]);
    }
    
    clearTimeout(moveTimeoutRef.current);
    moveTimeoutRef.current = setTimeout(() => {
      setIsMoving(false);
    }, 100);
  }, [isMoving]);

  // Crear ondas de fondo suaves
  const drawBackgroundWaves = useCallback((ctx, canvas) => {
    const { width, height } = canvas;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Ondas de fondo más elaboradas
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      
      for (let x = 0; x <= width; x += 10) {
        const y = height / 2 + 
          Math.sin((x * 0.006) + (timeRef.current * 0.002) + (i * Math.PI / 2)) * 30 +
          Math.sin((x * 0.002) + (timeRef.current * 0.001) + (i * Math.PI / 3)) * 15;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      const opacity = 0.06 + (i * 0.015);
      gradient.addColorStop(0, `${colors.primary}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.5, `${colors.secondary}${Math.floor(opacity * 0.7 * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${colors.accent}${Math.floor(opacity * 0.5 * 255).toString(16).padStart(2, '0')}`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, [colors]);

  // Animar el canvas
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    timeRef.current += 1;
    
    drawBackgroundWaves(ctx, canvas);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [drawBackgroundWaves]);

  // Manejar click para crear ondas
  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: 0,
      maxSize: Math.random() * 120 + 60,
      opacity: 0.4
    };
    
    setRipples(prev => [...prev.slice(-2), newRipple]);
  }, []);

  // Configurar canvas y animación
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Limpiar gotas viejas
  useEffect(() => {
    const interval = setInterval(() => {
      setDroplets(prev => prev.filter(droplet => droplet.life < 80));
      setRipples(prev => prev.filter(ripple => ripple.size < ripple.maxSize));
    }, 120);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden cursor-none bg-gradient-to-br ${colors.background}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Canvas para ondas de fondo */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.5 }}
      />
      
      {/* Múltiples círculos flotantes con más colores */}
      <div className="absolute inset-0">
        {/* Círculo 1 - Azul Eléctrico */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${colors.primary} 0%, ${colors.primary}70 50%, transparent 80%)`,
            opacity: 0.3,
            animation: 'float1 20s ease-in-out infinite'
          }}
        />
        
        {/* Círculo 2 - Púrpura Vibrante */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 60% 40%, ${colors.secondary} 0%, ${colors.secondary}80 40%, transparent 70%)`,
            opacity: 0.35,
            animation: 'float2 25s ease-in-out infinite'
          }}
        />
        
        {/* Círculo 3 - Cyan Brillante */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${colors.accent} 0%, ${colors.accent}60 60%, transparent 85%)`,
            opacity: 0.32,
            animation: 'float3 22s ease-in-out infinite'
          }}
        />
        
        {/* Círculo 4 - Rosa Vibrante */}
        <div 
          className="absolute w-[380px] h-[380px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 40% 70%, ${colors.pink} 0%, ${colors.pink}75 45%, transparent 75%)`,
            opacity: 0.28,
            animation: 'float4 28s ease-in-out infinite'
          }}
        />
        
        {/* Círculo 5 - Naranja Cálido */}
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${colors.orange} 0%, ${colors.orange}65 55%, transparent 80%)`,
            opacity: 0.25,
            animation: 'float5 24s ease-in-out infinite'
          }}
        />
        
        {/* Círculo 6 - Verde Esmeralda */}
        <div 
          className="absolute w-[320px] h-[320px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${colors.green} 0%, ${colors.green}70 50%, transparent 75%)`,
            opacity: 0.27,
            animation: 'float6 26s ease-in-out infinite'
          }}
        />
        
        {/* Círculo 7 - Amarillo Dorado */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 80% 80%, ${colors.yellow} 0%, ${colors.yellow}60 60%, transparent 85%)`,
            opacity: 0.22,
            animation: 'float7 30s ease-in-out infinite'
          }}
        />
        
        {/* Círculo 8 - Rojo Coral */}
        <div 
          className="absolute w-[280px] h-[280px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 10% 20%, ${colors.red} 0%, ${colors.red}80 40%, transparent 70%)`,
            opacity: 0.24,
            animation: 'float8 27s ease-in-out infinite'
          }}
        />
      </div>

      {/* Mouse Tracker optimizado - SIN LAG */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: `${mousePos.x - 15}px`,
          top: `${mousePos.y - 15}px`,
          width: '30px',
          height: '30px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.2) 70%, transparent 100%)',
          borderRadius: '50%',
          transition: isMoving ? 'none' : 'transform 0.2s ease-out',
          filter: 'blur(0.5px)',
          boxShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)',
          transform: isMoving ? 'scale(1.2)' : 'scale(1)',
          willChange: 'transform, left, top'
        }}
      />

      {/* Gotas que siguen el mouse */}
      {droplets.map((droplet) => (
        <div
          key={droplet.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${droplet.x}%`,
            top: `${droplet.y}%`,
            width: `${droplet.size}px`,
            height: `${droplet.size}px`,
            background: `radial-gradient(circle, ${colors.cursor} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            opacity: droplet.opacity,
            animation: 'liquidDrop 2s ease-out forwards',
            filter: 'blur(1px)'
          }}
        />
      ))}

      {/* Ondas expansivas al hacer click */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none border-2"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
            borderColor: `${colors.accent}50`,
            transform: 'translate(-50%, -50%)',
            animation: 'rippleExpand 1.8s ease-out forwards'
          }}
        />
      ))}

      {/* Contenido */}
      {children}

      {/* Estilos CSS optimizados */}
      <style jsx>{`
        @keyframes liquidDrop {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.4);
          }
          40% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.8);
          }
        }

        @keyframes rippleExpand {
          0% {
            width: 0px;
            height: 0px;
            opacity: 0.4;
            border-width: 2px;
          }
          100% {
            width: 150px;
            height: 150px;
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes float1 {
          0%, 100% { transform: translate(-10%, 10%) rotate(0deg) scale(1); }
          25% { transform: translate(60%, -20%) rotate(90deg) scale(1.1); }
          50% { transform: translate(110%, 70%) rotate(180deg) scale(0.9); }
          75% { transform: translate(20%, 110%) rotate(270deg) scale(1.15); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(80%, 20%) rotate(0deg) scale(1); }
          20% { transform: translate(10%, 60%) rotate(72deg) scale(0.85); }
          40% { transform: translate(-20%, 30%) rotate(144deg) scale(1.25); }
          60% { transform: translate(100%, -10%) rotate(216deg) scale(0.95); }
          80% { transform: translate(40%, 90%) rotate(288deg) scale(1.05); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(30%, 80%) rotate(0deg) scale(1); }
          33% { transform: translate(90%, 10%) rotate(120deg) scale(1.15); }
          66% { transform: translate(-10%, 40%) rotate(240deg) scale(0.85); }
        }

        @keyframes float4 {
          0%, 100% { transform: translate(70%, 5%) rotate(0deg) scale(1); }
          25% { transform: translate(5%, 75%) rotate(90deg) scale(1.2); }
          50% { transform: translate(85%, 95%) rotate(180deg) scale(0.8); }
          75% { transform: translate(120%, 25%) rotate(270deg) scale(1.1); }
        }

        @keyframes float5 {
          0%, 100% { transform: translate(15%, 60%) rotate(0deg) scale(1); }
          30% { transform: translate(75%, 15%) rotate(108deg) scale(0.9); }
          60% { transform: translate(105%, 85%) rotate(216deg) scale(1.3); }
          90% { transform: translate(45%, 105%) rotate(324deg) scale(0.95); }
        }

        @keyframes float6 {
          0%, 100% { transform: translate(95%, 45%) rotate(0deg) scale(1); }
          40% { transform: translate(25%, 5%) rotate(144deg) scale(1.15); }
          80% { transform: translate(-5%, 80%) rotate(288deg) scale(0.9); }
        }

        @keyframes float7 {
          0%, 100% { transform: translate(50%, 25%) rotate(0deg) scale(1); }
          35% { transform: translate(110%, 65%) rotate(126deg) scale(1.25); }
          70% { transform: translate(0%, 100%) rotate(252deg) scale(0.85); }
        }

        @keyframes float8 {
          0%, 100% { transform: translate(25%, 90%) rotate(0deg) scale(1); }
          50% { transform: translate(85%, 35%) rotate(180deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export { LiquidBackground };