import type { Metadata } from "next";
import { Poppins, Vollkorn } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const vollkorn = Vollkorn({
  variable: "--font-vollkorn",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Servilleta Financiera — Prestigio",
  description: "Diagnóstico financiero guiado para empresarios. Calcula tus indicadores financieros en minutos. Prestigio — Liderando desde el ser.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${poppins.variable} ${vollkorn.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
