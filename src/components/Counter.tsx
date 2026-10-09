"use client";

import { useEffect, useState } from "react";

// Fecha exacta: 12 de octubre de 2025 a las 2:00 AM (Zona horaria de Guatemala/México Central -06:00)
const START_DATE = new Date("2025-10-12T02:00:00-06:00").getTime();

export default function Counter() {
  const [timePassed, setTimePassed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = now - START_DATE;

      // Si la fecha actual ya pasó el 12 de octubre a las 2 AM
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimePassed({ days, hours, minutes });
      } else {
        // En caso de que se metan antes de la fecha, muestra 0
        setTimePassed({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTime();
    // Actualizar el contador cada minuto
    const interval = setInterval(calculateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Evitamos el error de hidratación de Next.js (diferencia entre servidor y cliente)
  if (!mounted) {
    return (
      <div className="flex justify-center md:justify-start gap-6 font-serif text-3xl md:text-4xl text-gray-800 mb-8 opacity-0">
        <div className="h-16"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center md:justify-start gap-6 font-serif text-3xl md:text-4xl text-gray-800 mb-8 animate-in fade-in duration-700">
      <div className="text-center">
        <span className="block">{timePassed.days}</span>
        <span className="block font-sans text-xs tracking-widest uppercase text-gray-400 mt-2">Días</span>
      </div>
      <div className="text-center">
        <span className="block text-gray-300">:</span>
      </div>
      <div className="text-center">
        <span className="block">{timePassed.hours}</span>
        <span className="block font-sans text-xs tracking-widest uppercase text-gray-400 mt-2">Horas</span>
      </div>
      <div className="text-center">
        <span className="block text-gray-300">:</span>
      </div>
      <div className="text-center">
        <span className="block">{timePassed.minutes}</span>
        <span className="block font-sans text-xs tracking-widest uppercase text-gray-400 mt-2">Min</span>
      </div>
    </div>
  );
}
