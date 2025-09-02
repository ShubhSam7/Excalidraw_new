"use client";
import Prism from "@/components/Backgrounds/Prism";

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Prism background */}
      <div className="absolute inset-0 -z-10">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={4}
          baseWidth={6}
          scale={2.5}
          hueShift={0}
          colorFrequency={1}
          noise={0.3}
          glow={1}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <p className="mb-6 text-xl md:text-2xl">Welcome to DrawFlow</p>
        <div className="flex space-x-4">
          <button onClick= {() => {window.location.href = "./canvas"}} className="rounded-full bg-white px-6 py-2 font-medium text-black shadow hover:bg-gray-200 transition">
            Get Started
          </button>
          <button className="rounded-full border border-white/30 px-6 py-2 font-medium text-white hover:bg-white/10 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
