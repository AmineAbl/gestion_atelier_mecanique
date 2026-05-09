import React, { useState, useEffect, useRef, useCallback } from 'react';

export function CountUp({ end, duration = 2000, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  const animateCount = useCallback(() => {
    let startValue = 0;
    const endValue = parseFloat(end);
    const increment = endValue / (duration / 50);
    
    const timer = setInterval(() => {
      startValue += increment;
      if (startValue >= endValue) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(
          end.includes('+')
            ? `${Math.floor(startValue)}+`
            : end.includes('K')
            ? `${(startValue / 1000).toFixed(1)}K+`
            : `${startValue.toFixed(1)}%`
        );
      }
    }, 50);
  }, [end, duration]);

  useEffect(() => {
    const element = elementRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [animateCount]);

  return (
    <div ref={elementRef} className="count-up-container">
      <div className="count-up-number">{count || end}</div>
      <p className="count-up-label">{label}</p>
    </div>
  );
}
