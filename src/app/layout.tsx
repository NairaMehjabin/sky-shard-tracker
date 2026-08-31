import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/providers"; 
import SkylitHeader from "@/components/SkylitHeader";

const buttonsPatches = localFont({
  src: "../../public/font/buttons_patches/Buttons.ttf",
  variable: "--font-buttons",
  display: "swap",
});

const curlyFont = localFont({
  src: "../../public/font/curly_2/Curly.ttf",
  variable: "--font-curly",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skylit Tracker",
  description: "Dynamic Horizon Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${buttonsPatches.variable} ${curlyFont.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className={`${buttonsPatches.variable} ${curlyFont.variable} min-h-full bg-[#17191D] text-[#F8F3E6] flex flex-col relative transition-colors duration-300`}>
        
        {/* Folk-art Stipple Grid Mesh layer */}
        <div className="fixed inset-0 pointer-events-none select-none z-0 bg-[#17191D]">
          <div 
            className="w-full h-full opacity-[0.18]" 
            style={{
              backgroundImage: `linear-gradient(to right, #754A70 1px, transparent 1px), linear-gradient(to bottom, #754A70 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />
        </div>

        <Providers>
          <div className="relative z-30">
            <SkylitHeader />
          </div>
          
          <main className="flex-1 w-full relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}