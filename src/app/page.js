"use client";
import { useState, useMemo, useCallback } from "react";
import * as InteractiveBg from "../components/ui/InteractiveBackgrounds";

export default function Home() {
  const [currentBackground, setCurrentBackground] = useState("Elastic Logo");

  // Optimized background categories
  const backgroundCategories = useMemo(() => ({
    "Interactive Backgrounds": [
      { name: "Physics Rope", displayName: "Interactive Ropes" },
      { name: "Reactive Particles", displayName: "Reactive Particles" },
      { name: "Node Network", displayName: "Network Physics" },
      { name: "Orbital Particles", displayName: "Solar System" },
      { name: "Interactive Shapes", displayName: "Interactive Shapes" },
      { name: "Aurora", displayName: "Aurora" },
      { name: "Water Drop Lens", displayName: "Water Drop Lens" },
    ],
    "Advanced Effects": [
      { name: "Blurry Particles", displayName: "Blurry Particles" },
      { name: "Blurry Waves", displayName: "Blurry Waves" },
      { name: "Pulsating Circles", displayName: "Pulsating Circles" },
      { name: "Starry Night", displayName: "Starry Night" },
      { name: "Minimal Circles", displayName: "Minimal Circles" },
      { name: "Deformable Shapes", displayName: "Deformable Shapes" },
      { name: "Perlin Noise", displayName: "Organic Patterns" },
      { name: "Constellations", displayName: "Stellar Constellations" },
      { name: "Interactive Fluid", displayName: "Liquid Background" },
      { name: "Elastic Logo", displayName: "Elastic Text" },
    ]
  }), []);

  const allBackgrounds = useMemo(() => 
    Object.values(backgroundCategories).flat()
  , [backgroundCategories]);

  const handleBackgroundChange = useCallback((backgroundName) => {
    setCurrentBackground(backgroundName);
  }, []);

  const currentBgInfo = useMemo(() => 
    allBackgrounds.find(bg => bg.name === currentBackground)
  , [allBackgrounds, currentBackground]);

  // Optimized background renderer with error boundaries
  const RenderBackground = useMemo(() => {
    const BackgroundComponent = () => {
      try {
        switch (currentBackground) {
          case "Physics Rope":
            return <InteractiveBg.PhysicsRopeBackground />;
          case "Reactive Particles":
            return <InteractiveBg.ReactiveParticlesBackground />;
          case "Node Network":
            return <InteractiveBg.NetworkNodesBackground />;
          case "Orbital Particles":
            return <InteractiveBg.OrbitalParticlesBackground />;
          case "Water Drop Lens":
            return <InteractiveBg.WaterDropLensBackground />;
          case "Blurry Waves":
            return <InteractiveBg.BlurryWavesBackground />;
          case "Pulsating Circles":
            return <InteractiveBg.PulsatingCirclesBackground />;
          case "Starry Night":
            return <InteractiveBg.StarryNightBackground />;
          case "Perlin Noise":
            return <InteractiveBg.PerlinNoiseBackground />;
          case "Constellations":
            return <InteractiveBg.ConstellationsBackground />;
          case "Deformable Shapes":
            return <InteractiveBg.DeformableShapesBackground />;
          case "Interactive Shapes":
            return <InteractiveBg.InteractiveShapesBackground />;
          case "Interactive Fluid":
            return <InteractiveBg.LiquidBackground />;
          case "Elastic Logo":
            return <InteractiveBg.ElasticLogoBackground />;
          case "Aurora":
            return <InteractiveBg.AuroraBackground />;
          case "Blurry Particles":
            return <InteractiveBg.BlurryParticlesBackground />;
          case "Minimal Circles":
            return <InteractiveBg.MinimalCirclesBackground />;
          default:
            return <InteractiveBg.ElasticLogoBackground />;
        }
      } catch (error) {
        console.error('Error rendering background:', error);
        return <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />;
      }
    };
    return BackgroundComponent;
  }, [currentBackground]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 sm:p-8 pb-20 gap-8 sm:gap-16 relative">
      <RenderBackground />
      
      {/* Resto del contenido optimizado... */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start z-10 relative">
        {/* Contenido simplificado para mejor rendimiento */}
        <div className="w-full max-w-5xl p-6 bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Background Gallery
            </h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-medium shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              {currentBgInfo?.displayName || currentBackground}
            </div>
          </div>
          
          <div className="space-y-6">
            {Object.entries(backgroundCategories).map(([category, backgrounds]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => handleBackgroundChange(bg.name)}
                      className={`
                        relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${currentBackground === bg.name 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' 
                          : 'bg-white/50 hover:bg-white/70 text-gray-700 hover:text-gray-900 shadow hover:shadow-md'}
                        border border-white/50 backdrop-blur-sm
                      `}
                    >
                      {bg.displayName}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

