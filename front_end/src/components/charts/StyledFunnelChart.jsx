import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ChartShell } from './ChartShell';
import { getChartTheme } from './chartTheme';
import './accountantCharts.css';

const springConfig = { stiffness: 120, damping: 20, mass: 1 };
const hoverSpring = { stiffness: 300, damping: 24 };

function hSegmentPath(normStart, normEnd, segW, H, layerScale, straight = false) {
  const my = H / 2;
  const h0 = normStart * H * 0.44 * layerScale;
  const h1 = normEnd * H * 0.44 * layerScale;

  if (straight) {
    return `M 0 ${my - h0} L ${segW} ${my - h1} L ${segW} ${my + h1} L 0 ${my + h0} Z`;
  }

  const cx = segW * 0.55;
  const top = `M 0 ${my - h0} C ${cx} ${my - h0}, ${segW - cx} ${my - h1}, ${segW} ${my - h1}`;
  const bot = `L ${segW} ${my + h1} C ${segW - cx} ${my + h1}, ${cx} ${my + h0}, 0 ${my + h0}`;
  return `${top} ${bot} Z`;
}

function HRing({ d, color, fill, opacity, hovered, ringIndex, totalRings }) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;
  const ringSpring = { stiffness: 300 - ringIndex * 60, damping: 24 - ringIndex * 3 };
  const scaleY = useSpring(1, ringSpring);

  useEffect(() => {
    scaleY.set(hovered ? extraScale : 1);
  }, [hovered, scaleY, extraScale]);

  return (
    <motion.path
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ scaleY, transformOrigin: 'center center' }}
    />
  );
}

function HSegment({
  index,
  normStart,
  normEnd,
  segW,
  fullH,
  color,
  layers,
  staggerDelay,
  hovered,
  dimmed,
  straight,
  gradientStops,
}) {
  const gradientId = `funnel-h-grad-${index}`;
  const growProgress = useSpring(0, springConfig);
  const entranceScaleX = useTransform(growProgress, [0, 1], [0, 1]);
  const entranceScaleY = useTransform(growProgress, [0, 1], [0, 1]);
  const dimOpacity = useSpring(1, hoverSpring);

  useEffect(() => {
    dimOpacity.set(dimmed ? 0.4 : 1);
  }, [dimmed, dimOpacity]);

  useEffect(() => {
    const timeout = setTimeout(() => growProgress.set(1), index * staggerDelay * 1000);
    return () => clearTimeout(timeout);
  }, [growProgress, index, staggerDelay]);

  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - (l / layers) * 0.35;
    const opacity = 0.18 + (l / (layers - 1 || 1)) * 0.65;
    return {
      d: hSegmentPath(normStart, normEnd, segW, fullH, scale, straight),
      opacity,
    };
  });

  return (
    <motion.div
      className="pointer-events-none relative shrink-0 overflow-visible"
      style={{
        width: segW,
        height: fullH,
        zIndex: hovered ? 10 : 1,
        opacity: dimOpacity,
      }}
    >
      <motion.div
        className="absolute inset-0 overflow-visible"
        style={{
          scaleX: entranceScaleX,
          scaleY: entranceScaleY,
          transformOrigin: 'left center',
        }}
      >
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${segW} ${fullH}`}
        >
          <defs>
            {gradientStops && (
              <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                {gradientStops.map((stop) => (
                  <stop
                    key={`${stop.offset}-${stop.color}`}
                    offset={
                      typeof stop.offset === 'number' ? `${stop.offset * 100}%` : stop.offset
                    }
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            )}
          </defs>
          {rings.map((r, i) => {
            const isInnermost = i === rings.length - 1;
            const ringFill = isInnermost && gradientStops ? `url(#${gradientId})` : undefined;
            return (
              <HRing
                key={`h-ring-${r.opacity}`}
                color={color}
                d={r.d}
                fill={ringFill}
                hovered={hovered}
                opacity={r.opacity}
                ringIndex={i}
                totalRings={layers}
              />
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}

function SegmentLabel({
  stage,
  pct,
  showValues,
  showPercentage,
  showLabels,
  index,
  staggerDelay,
  isDark,
  theme,
}) {
  const display = stage.displayValue ?? stage.value.toLocaleString('fr-FR');

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center"
      initial={{ opacity: 0 }}
      transition={{
        delay: index * staggerDelay + 0.25,
        duration: 0.35,
        ease: 'easeOut',
      }}
    >
      <div className="flex h-[16%] items-end justify-center pb-1">
        {showValues && (
          <span
            className="whitespace-nowrap text-sm font-semibold"
            style={{ color: theme.tooltipText }}
          >
            {display}
          </span>
        )}
      </div>
      <div className="flex flex-1 items-center justify-center">
        {showPercentage && (
          <span
            className="rounded-full px-3 py-1 text-xs font-bold shadow-md"
            style={{
              backgroundColor: isDark ? '#f8fafc' : '#0f172a',
              color: isDark ? '#0f172a' : '#f8fafc',
            }}
          >
            {Math.round(pct)}%
          </span>
        )}
      </div>
      <div className="flex h-[16%] items-start justify-center pt-1">
        {showLabels && (
          <span
            className="whitespace-nowrap text-xs font-medium"
            style={{ color: theme.tooltipMuted }}
          >
            {stage.label}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function FunnelInner({ data }) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);
  const ref = useRef(null);
  const [sz, setSz] = useState({ w: 0, h: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const measure = useCallback(() => {
    if (!ref.current) return;
    const { width: w, height: h } = ref.current.getBoundingClientRect();
    if (w > 0 && h > 0) setSz({ w, h });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [measure]);

  const first = data[0];
  const max = first?.value || 1;
  const n = data.length;
  const norms = data.map((d) => d.value / max);
  const { w: W, h: H } = sz;
  const gap = 4;
  const layers = 3;
  const staggerDelay = 0.12;
  const totalGap = gap * (n - 1);
  const segW = W > 0 ? (W - totalGap) / n : 0;

  return (
    <div
      ref={ref}
      className="chart-funnel relative h-full min-h-[240px] w-full select-none overflow-visible"
    >
      {W > 0 && H > 0 && (
        <>
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox={`0 0 ${W} ${H}`}
          >
            {data.map((stage, i) => {
              if (i % 2 !== 0) return null;
              const x = (segW + gap) * i;
              return (
                <rect
                  key={`band-${stage.label}`}
                  fill={isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(241, 245, 249, 0.9)'}
                  height={H}
                  width={segW}
                  x={x}
                  y={0}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-row overflow-visible" style={{ gap }}>
            {data.map((stage, i) => {
              const normStart = norms[i] ?? 0;
              const normEnd = norms[Math.min(i + 1, n - 1)] ?? 0;
              const firstStop = stage.gradient?.[0];
              const segColor = firstStop ? firstStop.color : stage.color ?? '#3b82f6';

              return (
                <div
                  key={stage.label}
                  className="relative shrink-0 cursor-pointer"
                  style={{ width: segW, height: H }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <HSegment
                    color={segColor}
                    dimmed={hoveredIndex !== null && hoveredIndex !== i}
                    fullH={H}
                    gradientStops={stage.gradient}
                    hovered={hoveredIndex === i}
                    index={i}
                    layers={layers}
                    normEnd={normEnd}
                    normStart={normStart}
                    segW={segW}
                    staggerDelay={staggerDelay}
                    straight={false}
                  />
                  <div className="absolute inset-0" style={{ zIndex: 20, pointerEvents: 'none' }}>
                  <SegmentLabel
                    index={i}
                    isDark={isDark}
                    pct={(stage.value / max) * 100}
                    showLabels
                    showPercentage
                    showValues
                    stage={stage}
                    staggerDelay={staggerDelay}
                    theme={theme}
                  />
                </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/** SVG curved funnel — styled like components/funnel_chart.txt */
export function StyledFunnelChart({ data, title, description }) {
  if (!data?.length) return null;

  return (
    <ChartShell title={title} description={description} height={300}>
      <FunnelInner data={data} />
    </ChartShell>
  );
}
