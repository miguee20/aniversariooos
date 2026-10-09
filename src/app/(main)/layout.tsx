import { Menu } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-serif text-xl md:text-2xl tracking-wide font-medium">Nuestro Espacio</h1>
          
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8 text-sm font-light text-gray-500">
              <a href="/" className="hover:text-black transition-colors">Inicio</a>
              <a href="/galeria" className="hover:text-black transition-colors">Galería</a>
              <a href="/mapa" className="hover:text-black transition-colors">Mapa</a>
              <a href="/capsula" className="hover:text-black transition-colors">Cápsula</a>
            </nav>
            <div className="hidden md:block w-px h-4 bg-gray-300"></div>
            <LogoutButton />
            <button className="md:hidden ml-4">
              <Menu className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 mt-12 md:mt-20 pb-20 flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
