import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flujent | Inteligencia Financiera",
  description: "Proyecciones financieras para microemprendedores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="es" suppressHydrationWarning>
      {/* Agregamos las clases dark: para el fondo y texto global */}
      <body className={`${inter.className} bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased transition-colors duration-300`}>
        {/* Envolvemos la app con el proveedor del tema */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}