"use client";

import { useEffect, useState } from "react";

const GIF_DURATION = 1200;

interface Explosion {
  x: number;
  y: number;
  gifUrl: string;
}

export default function ExplosionHandler() {
  if (false) { // If !explosion_mode...
    return
  }

  const [explosion, setExplosion] = useState<Explosion | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleGlobalClick = (event: PointerEvent) => {
      clearTimeout(timeoutId);

      // Lage ny url sånn at me får en ny gif kvar gong, ny progress på avspelinga
      // Date er bra for unikheit
      const freshGifUrl = `/explosion.gif?t=${Date.now()}`;

      setExplosion({
        x: event.clientX,
        y: event.clientY,
        gifUrl: freshGifUrl,
      });

      timeoutId = setTimeout(() => {
        setExplosion(null);
      }, GIF_DURATION);
    };

    document.addEventListener("pointerdown", handleGlobalClick, {
      capture: true,
    });

    return () => {
      document.removeEventListener("pointerdown", handleGlobalClick, {
        capture: true,
      });

      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {explosion && (
        <div
          style={{
            position: "fixed",
            top: explosion.y,
            left: explosion.x,
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <img
            src={explosion.gifUrl}
            alt=""
            width={200}  // burde har noko storleik variasjon, random idk korleis
            height={200} // burde har noko storleik variasjon, random idk korleis
          />
        </div>
      )}
    </>
  );
}
