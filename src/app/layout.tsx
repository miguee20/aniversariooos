import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], style: ['normal', 'italic'], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Nuestro Espacio",
  description: "Celebrando nuestro primer año.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: "font-sans text-sm font-light tracking-wide border-gray-200 bg-white text-black shadow-xl rounded-none",
            style: {
              borderRadius: "0px",
              border: "1px solid #e5e7eb",
              padding: "16px",
            }
          }} 
        />
        {children}
      </body>
    </html>
  );
}
