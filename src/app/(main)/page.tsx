"use client";

import { useState } from "react";
import { Play, Mic, Lock, Map, List, Plus } from "lucide-react";
import Link from "next/link";
import Counter from "@/components/Counter";
import UploadModal from "@/components/UploadModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Hero Section (Counter & Quick Action) */}
      <section className="mb-20 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-widest uppercase text-gray-400 mb-4">12 de Octubre, 2025 • 2:00 AM</p>
          <h2 className="font-serif text-5xl md:text-7xl leading-tight mb-6 font-medium">
            El primer año <br />
            <span className="italic text-gray-500">de nosotros.</span>
          </h2>
          
          {/* Elegant Counter */}
          <Counter />
        </div>
        
        {/* Quick Action */}
        <div className="flex-shrink-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-8 py-4 bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 text-sm font-light tracking-wide cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Guardar un recuerdo
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-wider">Fecha y desc. opcional</p>
        </div>
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Buzón & Cápsula */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-8">
          
          {/* El Buzón de Voz */}
          <div className="bg-white p-8 border border-gray-200 hover-lift">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-serif text-2xl mb-1 font-medium">El Buzón</h3>
                <p className="text-xs text-gray-400 font-light tracking-wide">MENSAJE DE DANI • 0:45</p>
              </div>
              <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
            </div>
            
            {/* Elegant Audio Player */}
            <div className="flex items-center gap-4 mb-6">
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Play className="w-4 h-4 ml-1" />
              </button>
              <div className="flex-1 h-8 flex items-center gap-[2px] opacity-60">
                {/* Audio wave lines placeholders */}
                <div className="w-1 h-3 bg-gray-400"></div><div className="w-1 h-5 bg-gray-400"></div><div className="w-1 h-8 bg-gray-400"></div><div className="w-1 h-4 bg-gray-400"></div><div className="w-1 h-6 bg-gray-400"></div><div className="w-1 h-2 bg-gray-400"></div><div className="w-1 h-5 bg-gray-400"></div><div className="w-1 h-7 bg-gray-400"></div><div className="w-1 h-3 bg-gray-300"></div><div className="w-1 h-5 bg-gray-300"></div><div className="w-1 h-2 bg-gray-300"></div><div className="w-1 h-6 bg-gray-300"></div>
              </div>
            </div>

            <button className="w-full py-3 border border-black text-black text-sm font-light hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Mic className="w-4 h-4" /> Dejar un mensaje
            </button>
          </div>

          {/* La Cápsula del Tiempo */}
          <div className="bg-[#1a1a1a] text-white p-8 hover-lift cursor-pointer flex flex-col justify-between min-h-[240px]">
            <div>
              <Lock className="w-5 h-5 text-gray-400 mb-6" />
              <h3 className="font-serif text-2xl mb-2 font-medium">Cápsula del Tiempo</h3>
              <p className="text-sm font-light text-gray-400 leading-relaxed">
                5 preguntas selladas. Las respuestas de ambos se revelarán el próximo año.
              </p>
            </div>
            <p className="text-xs tracking-widest uppercase text-gray-500 mt-6 border-t border-gray-800 pt-4">
              Se abre el 12.10.2027
            </p>
          </div>

        </div>

        {/* Right Column: Años, Mapa, Lista */}
        <div className="col-span-1 md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Galería */}
          <Link href="/galeria" className="block md:col-span-2">
            <div className="h-full bg-white p-8 border border-gray-200 hover-lift cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center group">
              <div>
                <p className="text-xs font-light tracking-widest uppercase text-gray-400 mb-2">Galería Libre</p>
                <h3 className="font-serif text-3xl mb-2 group-hover:italic transition-all font-medium">La Galería</h3>
                <p className="text-sm text-gray-500 font-light">Fotos, buzones y momentos acumulados.</p>
              </div>
              <div className="font-serif text-6xl text-gray-100 mt-4 md:mt-0">01</div>
            </div>
          </Link>

          {/* Mapa de Sueños */}
          <div className="bg-white p-8 border border-gray-200 hover-lift cursor-pointer relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full"></div>
            <Map className="w-5 h-5 text-gray-400 mb-12 relative z-10" />
            <h3 className="font-serif text-2xl mb-2 relative z-10 font-medium">Mapa de Sueños</h3>
            <p className="text-sm text-gray-500 font-light relative z-10">Lugares a donde vamos a ir juntos.</p>
          </div>

          {/* Nuestra Lista */}
          <div className="bg-white p-8 border border-gray-200 hover-lift cursor-pointer">
            <List className="w-5 h-5 text-gray-400 mb-12" />
            <h3 className="font-serif text-2xl mb-2 font-medium">Nuestra Lista</h3>
            <p className="text-sm text-gray-500 font-light">Películas, series y juegos por hacer.</p>
          </div>

        </div>
      </div>
    </>
  );
}
