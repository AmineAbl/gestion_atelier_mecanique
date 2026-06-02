import { useEffect, useRef } from 'react';
import LOGOS from './marqueeLogos';

export function PerspectiveMarquee({
  fontSize = 48,
  fadeColor = 'transparent',
  background = 'transparent',
  className = '',
}) {
  const scrollerRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let offset = 0;
    const speed = 0.6;

    const animate = () => {
      offset += speed;

      const loopWidth = scroller.scrollWidth / 3;
      if (loopWidth > 0 && offset >= loopWidth) {
        offset = 0;
      }

      scroller.style.transform = `translate3d(-${offset}px, 0, 0)`;
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  const rendered = [...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <div
      className={`marquee-strip ${className}`.trim()}
      style={{
        position: 'relative',
        width: '100%',
        height: `${fontSize * 2}px`,
        background,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        ref={scrollerRef}
        className="marquee-strip__track"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'nowrap',
          willChange: 'transform',
        }}
      >
        {rendered.map((logo, i) => (
          <img
            key={`${logo}-${i}`}
            src={logo}
            alt=""
            className="marquee-brand-logo"
            loading="lazy"
            decoding="async"
            style={{
              height: `${fontSize * 1.5}px`,
              marginRight: `${fontSize * 0.5}px`,
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {fadeColor !== 'transparent' && (
        <>
          <div
            className="marquee-strip__fade"
            style={{
              background: `linear-gradient(90deg, ${fadeColor} 0%, transparent 14%, transparent 86%, ${fadeColor} 100%)`,
            }}
          />
        </>
      )}
    </div>
  );
}
