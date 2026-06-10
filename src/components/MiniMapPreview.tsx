import React from 'react';
import { motion } from 'motion/react';
import { GameMap } from '../types';

interface MiniMapPreviewProps {
  map: GameMap;
  className?: string;
  isActive?: boolean;
}

export const MiniMapPreview: React.FC<MiniMapPreviewProps> = ({ map, className = '', isActive = false }) => {
  // Path generator from track coordinates (normalized 0-1000 scale)
  const trackPath = map.track.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');

  return (
    <div className={`relative w-full aspect-[16/9] overflow-hidden rounded-xl border-2 border-black/30 bg-black/40 shadow-inner group transition-all duration-300 ${isActive ? 'ring-2 ring-[var(--app-accent)] border-transparent' : 'hover:border-white/20'} ${className}`}>
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundColor: map.bgColor }}
      >
        {/* Render Decorations */}
        {map.decorations.map((dec, idx) => {
          if (dec.type === 'tree') {
            return (
              <motion.g
                key={`tree-${idx}`}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{
                  repeat: Infinity,
                  duration: 3 + (idx % 3),
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: `${dec.x}px ${dec.y + dec.size * 0.7}px` }}
              >
                {/* Trunk */}
                <rect
                  x={dec.x - dec.size * 0.12}
                  y={dec.y}
                  width={dec.size * 0.24}
                  height={dec.size * 0.7}
                  fill="#5c2d0c"
                />
                {/* Double layer leaves */}
                <circle cx={dec.x} cy={dec.y} r={dec.size * 0.55} fill="#14532d" />
                <circle cx={dec.x - dec.size * 0.1} cy={dec.y - dec.size * 0.1} r={dec.size * 0.4} fill="#16a34a" />
              </motion.g>
            );
          }
          if (dec.type === 'cactus') {
            return (
              <motion.g
                key={`cactus-${idx}`}
                animate={{ rotate: [-1.5, 1.5, -1.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 4 + (idx % 2),
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: `${dec.x}px ${dec.y + dec.size * 0.3}px` }}
              >
                {/* Trunk */}
                <rect x={dec.x - dec.size * 0.15} y={dec.y - dec.size * 0.8} width={dec.size * 0.3} height={dec.size * 1.1} fill="#14532d" rx={dec.size * 0.1} />
                {/* Left arm */}
                <rect x={dec.x - dec.size * 0.45} y={dec.y - dec.size * 0.6} width={dec.size * 0.3} height={dec.size * 0.15} fill="#14532d" />
                <rect x={dec.x - dec.size * 0.45} y={dec.y - dec.size * 0.8} width={dec.size * 0.15} height={dec.size * 0.35} fill="#14532d" rx={dec.size * 0.05} />
                {/* Right arm */}
                <rect x={dec.x + dec.size * 0.15} y={dec.y - dec.size * 0.45} width={dec.size * 0.3} height={dec.size * 0.15} fill="#14532d" />
                <rect x={dec.x + dec.size * 0.3} y={dec.y - dec.size * 0.65} width={dec.size * 0.15} height={dec.size * 0.35} fill="#14532d" rx={dec.size * 0.05} />
              </motion.g>
            );
          }
          if (dec.type === 'rock') {
            return (
              <g key={`rock-${idx}`}>
                <polygon
                  points={`${dec.x - dec.size},${dec.y + dec.size * 0.4} ${dec.x - dec.size * 0.4},${dec.y - dec.size * 0.6} ${dec.x + dec.size * 0.6},${dec.y - dec.size * 0.3} ${dec.x + dec.size},${dec.y + dec.size * 0.4}`}
                  fill="#57534e"
                />
                <polygon
                  points={`${dec.x - dec.size * 0.4},${dec.y - dec.size * 0.6} ${dec.x + dec.size * 0.2},${dec.y - dec.size * 0.45} ${dec.x},${dec.y}`}
                  fill="#78716c"
                />
              </g>
            );
          }
          if (dec.type === 'water') {
            return (
              <g key={`water-${idx}`}>
                <circle cx={dec.x} cy={dec.y} r={dec.size} fill="#0369a1" />
                <motion.circle
                  cx={dec.x}
                  cy={dec.y}
                  r={dec.size * 0.8}
                  fill="#0284c7"
                  animate={{ scale: [0.94, 1.04, 0.94] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4 + (idx % 3),
                    ease: "easeInOut"
                  }}
                  style={{ transformOrigin: `${dec.x}px ${dec.y}px` }}
                />
                <path d={`M ${dec.x - dec.size * 0.5} ${dec.y} Q ${dec.x} ${dec.y - dec.size * 0.2} ${dec.x + dec.size * 0.5} ${dec.y}`} fill="none" stroke="#38bdf8" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
              </g>
            );
          }
          if (dec.type === 'lava') {
            return (
              <g key={`lava-${idx}`}>
                <circle cx={dec.x} cy={dec.y} r={dec.size} fill="#7c2d12" />
                <circle cx={dec.x} cy={dec.y} r={dec.size * 0.85} fill="#b91c1c" />
                <motion.circle
                  cx={dec.x + dec.size * 0.1}
                  cy={dec.y + dec.size * 0.1}
                  r={dec.size * 0.5}
                  fill="#ea580c"
                  animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.5 + (idx % 2),
                    ease: "easeInOut"
                  }}
                  style={{ transformOrigin: `${dec.x + dec.size * 0.1}px ${dec.y + dec.size * 0.1}px` }}
                />
                <circle cx={dec.x + dec.size * 0.2} cy={dec.y + dec.size * 0.2} r={dec.size * 0.2} fill="#f97316" />
              </g>
            );
          }
          if (dec.type === 'star') {
            return (
              <motion.circle
                key={`star-${idx}`}
                cx={dec.x}
                cy={dec.y}
                r={dec.size * 1.5}
                fill="#ffffff"
                animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + (idx % 3),
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: `${dec.x}px ${dec.y}px` }}
              />
            );
          }
          if (dec.type === 'crater') {
            return (
              <g key={`crater-${idx}`}>
                <circle cx={dec.x} cy={dec.y} r={dec.size} fill="#1e1b4b" stroke="#312e81" strokeWidth={6} />
                <motion.circle
                  cx={dec.x}
                  cy={dec.y}
                  r={dec.size * 0.85}
                  fill="#111029"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  animate={{ strokeWidth: [2, 5, 2] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3 + (idx % 3),
                    ease: "easeInOut"
                  }}
                />
              </g>
            );
          }
          return null;
        })}

        {/* Track path outer boundary border */}
        <path
          d={trackPath}
          fill="none"
          stroke={map.borderColor}
          strokeWidth={map.trackWidth + 18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track path main pavement fill */}
        <path
          d={trackPath}
          fill="none"
          stroke={map.trackColor}
          strokeWidth={map.trackWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Moving flow direction indicator loop */}
        <motion.path
          d={trackPath}
          fill="none"
          stroke="#ffffff"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="25 55"
          opacity={0.65}
          animate={{ strokeDashoffset: [-160, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4.5,
            ease: "linear"
          }}
        />
      </svg>

      {/* Modern Sci-Fi Tactical Grid overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] mix-blend-screen opacity-60"></div>
      
      {/* HUD corner brackets for extra visual polish */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-white/20 pointer-events-none group-hover:border-[var(--app-accent)]/50 transition-colors duration-300"></div>
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-white/20 pointer-events-none group-hover:border-[var(--app-accent)]/50 transition-colors duration-300"></div>
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-white/20 pointer-events-none group-hover:border-[var(--app-accent)]/50 transition-colors duration-300"></div>
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-white/20 pointer-events-none group-hover:border-[var(--app-accent)]/50 transition-colors duration-300"></div>

      {/* Wave entry ripple effect if active */}
      {isActive && (
        <div className="absolute inset-0 border-2 border-[var(--app-accent)] rounded-lg pointer-events-none animate-pulse"></div>
      )}
    </div>
  );
};
