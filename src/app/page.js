"use client";
import Image from "next/image";
import { useState, useMemo } from "react";
import * as InteractiveBg from "../components/ui/InteractiveBackgrounds";// Asumiendo que existe este componente para los fondos originales

export default function Home() {
  const [currentBackground, setCurrentBackground] = useState("Circles Light");

  // Organized and optimized background options
  const backgroundCategories = useMemo(() => ({
    "Interactive Backgrounds": [
      { name: "Physics Rope", displayName: "Interactive Ropes" },
      { name: "Reactive Particles", displayName: "Reactive Particles" },
      { name: "Fluid Waves", displayName: "Fluid Waves" },
      { name: "Node Network", displayName: "Network Physics" },
      { name: "Orbital Particles", displayName: "Solar System" },
      { name: "Aurora", displayName: "Aurora" },
    ],
    "Advanced Effects": [
      { name: "Pulsating Circles", displayName: "Pulsating Circles" },
      { name: "Perlin Noise", displayName: "Organic Patterns" },
      { name: "Constellations", displayName: "Stellar Constellations" },
      { name: "Interactive Fluid", displayName: "Liquid Background" },
      { name: "Elastic Logo", displayName: "Elastic Text" },
      { name: "Flowing Flowers", displayName: "Flowing Flowers" },
      { name: "Kaleidoscope", displayName: "Kaleidoscope" },
    ]
  }), []);

  // Flatten all options for easy access
  const allBackgrounds = useMemo(() => 
    Object.values(backgroundCategories).flat()
  , [backgroundCategories]);

  const handleBackgroundChange = (backgroundName) => {
    setCurrentBackground(backgroundName);
  };

  // Get current background info
  const currentBgInfo = allBackgrounds.find(bg => bg.name === currentBackground);

  // Componente para renderizar el fondo seleccionado
  const RenderBackground = () => {

    // Nuevos fondos interactivos
    switch (currentBackground) {
      case "Physics Rope":
        return <InteractiveBg.PhysicsRopeBackground />;
      case "Reactive Particles":
        return <InteractiveBg.ReactiveParticlesBackground />;
      case "Fluid Waves":
        return <InteractiveBg.FluidWavesBackground />;
      case "Node Network":
        return <InteractiveBg.NetworkNodesBackground />;
      case "Orbital Particles":
        return <InteractiveBg.OrbitalParticlesBackground />;
      case "Pulsating Circles":
        return <InteractiveBg.PulsatingCirclesBackground />; // Corregido el nombre
      case "Perlin Noise":
        return <InteractiveBg.PerlinNoiseBackground />;
      case "Constellations":
        return <InteractiveBg.ConstellationsBackground />;
      case "Interactive Fluid":
        return <InteractiveBg.InteractiveFluidBackground />;
      case "Elastic Logo":
        return <InteractiveBg.ElasticLogoBackground />;
      case "Aurora":
        return <InteractiveBg.AuroraBackground />;
      case "Flowing Flowers":
        return <InteractiveBg.FlowingFlowersBackground />;
      case "Kaleidoscope":
        return <InteractiveBg.KaleidoscopeBackground />;
      default:
        return <InteractiveBg.ElasticLogoBackground />;
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 sm:p-8 pb-20 gap-8 sm:gap-16 relative">
      {/* Renderizar el fondo seleccionado */}
      <RenderBackground />
      
      {/* Main Content */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start z-10 relative">
        {/* Logo */}
        <div className="flex flex-col items-center sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center sm:text-left">
            Enhanced Background Showcase
          </p>
        </div>
        
        {/* Instructions */}
        <ol className="font-mono list-inside list-decimal text-sm leading-6 text-center sm:text-left max-w-md">
          <li className="mb-2 tracking-tight">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded text-xs">
              src/app/page.js
            </code>
          </li>
          <li className="tracking-tight">
            Save and see your changes instantly.
          </li>
          <li className="mt-2 tracking-tight text-purple-600 dark:text-purple-400">
            Click backgrounds below to see the magic! ✨
          </li>
        </ol>

        {/* Enhanced Background Selector */}
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
          
          {/* Categorized Background Options */}
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
                      {currentBackground === bg.name && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Currently Displaying Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md text-white p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Currently Displaying:</span>
          <span className="text-blue-300">{currentBgInfo?.displayName || currentBackground}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span className="text-sm text-green-400">Live Preview</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex gap-8 text-sm row-start-3 z-10">
        <a
          className="group flex items-center gap-2 hover:underline hover:underline-offset-4 transition-all duration-300 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
            className="transition-transform group-hover:scale-110"
          />
          Learn
        </a>
        <a
          className="group flex items-center gap-2 hover:underline hover:underline-offset-4 transition-all duration-300 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
            className="transition-transform group-hover:scale-110"
          />
          Examples
        </a>
        <a
          className="group flex items-center gap-2 hover:underline hover:underline-offset-4 transition-all duration-300 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
            className="transition-transform group-hover:scale-110"
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

