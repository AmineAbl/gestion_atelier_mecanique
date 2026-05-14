import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const DEFAULT_ITEMS = [
  'Factures',
  'Clients',
  'Réparations',
  'Véhicules',
  'Rapports',
  'Paiements',
];

export function PerspectiveMarquee({
  items = DEFAULT_ITEMS,
  fontSize = 48,
  color = '#fafafa',
  fontWeight = 700,
  rotateY = -28,
  rotateX = 8,
  perspective = 1200,
  fadeColor = '#050505',
  background = '#050505',
  className = '',
}) {
  const [offset, setOffset] = useState(0);
  const [approxItemWidth, setApproxItemWidth] = useState(0);
  const containerRef = useRef(null);

  const itemPadding = fontSize * 0.9;
  
  useEffect(() => {
    // Calculate approximate item width
    const width = items.reduce(
      (acc, item) => acc + item.length * fontSize * 0.6 + itemPadding,
      0,
    );
    setApproxItemWidth(width);

    // Animation loop
    let animationFrameId;
    let currentOffset = 0;
    const speed = 1;
    const pixelsPerFrame = 1.5;

    const animate = () => {
      currentOffset = (currentOffset + pixelsPerFrame * speed) % width;
      setOffset(-currentOffset);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [items, fontSize, itemPadding]);

  const rendered = [...items, ...items, ...items];

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: `${fontSize * 2}px`,
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        perspective: `${perspective}px`,
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            transform: `translateX(${offset}px)`,
            transition: 'transform 0.016s linear',
          }}
        >
          {rendered.map((item, i) => {
            const itemCenter =
              i * (approxItemWidth / items.length) +
              approxItemWidth / items.length / 2 +
              offset;
            const norm = (itemCenter - 640) / 640;
            const distance = Math.min(1, Math.abs(norm));
            const blurPx = distance * 6;
            const opacity = 1 - distance * 0.4;

            return (
              <span
                key={`${i}-${item}`}
                style={{
                  display: 'inline-block',
                  fontFamily: FONT_FAMILY,
                  fontSize: `${fontSize}px`,
                  fontWeight,
                  color,
                  letterSpacing: '-0.03em',
                  paddingRight: itemPadding,
                  filter: `blur(${blurPx}px)`,
                  opacity,
                  willChange: 'opacity, filter',
                }}
              >
                {item}
              </span>
            );
          })}
        </div>
      </div>

      {/* Fade gradient left */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(90deg, ${fadeColor} 0%, transparent 18%, transparent 82%, ${fadeColor} 100%)`,
        }}
      />
      
      {/* Fade gradient top/bottom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(180deg, ${fadeColor} 0%, transparent 25%, transparent 75%, ${fadeColor} 100%)`,
        }}
      />
    </div>
  );
}
