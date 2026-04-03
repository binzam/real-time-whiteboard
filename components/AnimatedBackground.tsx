"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BgEight from "@/assets/bg-8.svg";
import BgNine from "@/assets/bg-9.svg";
import BgEleven from "@/assets/bg-11.svg";

const backgrounds = [BgEight, BgNine, BgEleven];

export default function AnimatedBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-1/2  overflow-hidden pointer-events-none  h-full relative">
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-70" : "opacity-0"
          }`}
        >
          <Image
            src={bg}
            alt={`Platform background ${index + 1}`}
            fill
            className="object-contain object-center"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
