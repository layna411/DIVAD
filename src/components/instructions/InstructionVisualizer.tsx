import React from 'react';
import { ActivityType } from '../../types';

interface InstructionVisualizerProps {
  activityId: ActivityType;
  stepNumber: number;
  demoGraphic: string;
  isCompleted?: boolean;
}

export const InstructionVisualizer: React.FC<InstructionVisualizerProps> = ({
  activityId,
  stepNumber,
  demoGraphic,
  isCompleted,
}) => {
  // Render animated interactive SVG graphics tailored specifically to each physical fastening task
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-white/90 to-slate-100 flex items-center justify-center p-4 border-2 border-slate-200/80 shadow-inner">
      {/* Background fabric weave texture simulation */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {activityId === 'zipper' && (
        <ZipperVisualizer stepNumber={stepNumber} isCompleted={isCompleted} />
      )}

      {activityId === 'button' && (
        <ButtonVisualizer stepNumber={stepNumber} isCompleted={isCompleted} />
      )}

      {activityId === 'buckle' && (
        <BuckleVisualizer stepNumber={stepNumber} isCompleted={isCompleted} />
      )}

      {activityId === 'snap' && (
        <SnapVisualizer stepNumber={stepNumber} isCompleted={isCompleted} />
      )}

      {activityId === 'velcro' && (
        <VelcroVisualizer stepNumber={stepNumber} isCompleted={isCompleted} />
      )}

      {activityId === 'red_fastener' && (
        <RedFastenerVisualizer stepNumber={stepNumber} isCompleted={isCompleted} />
      )}
    </div>
  );
};

/* --- 1. ZIPPER VISUALIZER (YELLOW SECTION) --- */
const ZipperVisualizer: React.FC<{ stepNumber: number; isCompleted?: boolean }> = ({
  stepNumber,
  isCompleted,
}) => {
  // Calculate slider vertical position: step 1-4 bottom (y=210), step 5 pulling (y=110), step 6 top (y=40)
  let sliderY = 210;
  if (stepNumber === 5) sliderY = 110;
  if (stepNumber >= 6 || isCompleted) sliderY = 40;

  return (
    <svg className="w-full h-full max-w-xs drop-shadow-md" viewBox="0 0 240 280">
      {/* Yellow Fabric Background */}
      <rect x="20" y="20" width="95" height="240" rx="8" fill="#FDE047" stroke="#EAB308" strokeWidth="3" />
      <rect x="125" y="20" width="95" height="240" rx="8" fill="#FDE047" stroke="#EAB308" strokeWidth="3" />

      {/* Fabric Stitching details */}
      <line x1="30" y1="28" x2="30" y2="252" stroke="#CA8A04" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="210" y1="28" x2="210" y2="252" stroke="#CA8A04" strokeWidth="2" strokeDasharray="4 4" />

      {/* Zipper Teeth */}
      {Array.from({ length: 18 }).map((_, i) => {
        const y = 35 + i * 12;
        const isInterlocked = y >= sliderY;
        return (
          <g key={i}>
            <rect
              x={isInterlocked ? 112 : 106}
              y={y}
              width="10"
              height="6"
              rx="2"
              fill="#94A3B8"
              stroke="#475569"
              strokeWidth="1"
            />
            <rect
              x={isInterlocked ? 118 : 124}
              y={y}
              width="10"
              height="6"
              rx="2"
              fill="#94A3B8"
              stroke="#475569"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Retainer Box at bottom */}
      <rect x="108" y="245" width="24" height="15" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2" />

      {/* Zipper Slider Body */}
      <g
        className="transition-all duration-700 ease-out"
        style={{ transform: `translateY(${sliderY - 210}px)` }}
      >
        <path
          d="M 104,205 L 136,205 L 130,228 L 110,228 Z"
          fill="#475569"
          stroke="#1E293B"
          strokeWidth="2"
        />
        {/* Shiny Slider Cap */}
        <circle cx="120" cy="214" r="4" fill="#E2E8F0" />
        {/* Zipper Pull Tab */}
        <rect x="116" y="224" width="8" height="26" rx="4" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
        <circle cx="120" cy="242" r="2.5" fill="#FEF3C7" />
      </g>

      {/* Action Highlight Rings based on Step */}
      {stepNumber === 2 && (
        <circle cx="120" cy="252" r="20" fill="none" stroke="#EF4444" strokeWidth="3" className="animate-ping" />
      )}
      {stepNumber === 3 && (
        <circle cx="120" cy="215" r="18" fill="none" stroke="#2563EB" strokeWidth="3" className="animate-pulse" />
      )}
      {stepNumber === 5 && (
        <g className="animate-bounce">
          <path d="M 120,80 L 120,130 M 112,95 L 120,80 L 128,95" fill="none" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
};

/* --- 2. BUTTON VISUALIZER (BROWN SECTION) --- */
const ButtonVisualizer: React.FC<{ stepNumber: number; isCompleted?: boolean }> = ({
  stepNumber,
  isCompleted,
}) => {
  const isPushed = stepNumber >= 3 || isCompleted;

  return (
    <svg className="w-full h-full max-w-xs drop-shadow-md" viewBox="0 0 240 280">
      {/* Brown Fabric Flaps */}
      <rect x="25" y="25" width="100" height="230" rx="10" fill="#A1887F" stroke="#6D4C41" strokeWidth="3" />
      <rect x="115" y="25" width="100" height="230" rx="10" fill="#8D6E63" stroke="#5D4037" strokeWidth="3" opacity="0.95" />

      {/* Stitches */}
      <line x1="35" y1="35" x2="35" y2="245" stroke="#4E342E" strokeWidth="2" strokeDasharray="5 5" />
      <line x1="205" y1="35" x2="205" y2="245" stroke="#3E2723" strokeWidth="2" strokeDasharray="5 5" />

      {/* 3 Buttons Slots for physical board reference */}
      {[70, 140, 210].map((y, idx) => {
        const isActive = idx === 1; // Middle button is primary focus
        return (
          <g key={idx}>
            {/* Buttonhole Slit */}
            <rect
              x="135"
              y={y - 12}
              width="6"
              height="24"
              rx="3"
              fill={stepNumber === 2 && isActive ? '#FEF08A' : '#3E2723'}
              stroke="#271815"
              strokeWidth="2"
              className={stepNumber === 2 && isActive ? 'animate-pulse' : ''}
            />

            {/* Wooden/Brown Button */}
            <g
              className="transition-transform duration-500 ease-in-out"
              style={{
                transform:
                  isActive && isPushed
                    ? 'translate(68px, 0px)'
                    : isActive && stepNumber === 3
                    ? 'translate(45px, 0px) rotate(35deg)'
                    : 'translate(0px, 0px)',
              }}
            >
              <circle
                cx="70"
                cy={y}
                r="18"
                fill="#D7CCC8"
                stroke="#5D4037"
                strokeWidth="3"
              />
              <circle cx="70" cy={y} r="13" fill="none" stroke="#8D6E63" strokeWidth="1.5" strokeDasharray="2 2" />
              {/* 4 Thread Holes */}
              <circle cx="65" cy={y - 4} r="2" fill="#4E342E" />
              <circle cx="75" cy={y - 4} r="2" fill="#4E342E" />
              <circle cx="65" cy={y + 4} r="2" fill="#4E342E" />
              <circle cx="75" cy={y + 4} r="2" fill="#4E342E" />
              <line x1="65" y1={y - 4} x2="75" y2={y + 4} stroke="#4E342E" strokeWidth="1.5" />
              <line x1="75" y1={y - 4} x2="65" y2={y + 4} stroke="#4E342E" strokeWidth="1.5" />
            </g>
          </g>
        );
      })}

      {/* Animated Arrow on step 3 */}
      {stepNumber === 3 && (
        <path
          d="M 95,140 L 130,140 M 120,132 L 130,140 L 120,148"
          fill="none"
          stroke="#16A34A"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-pulse"
        />
      )}
    </svg>
  );
};

/* --- 3. BUCKLE VISUALIZER (BLUE SECTION) --- */
const BuckleVisualizer: React.FC<{ stepNumber: number; isCompleted?: boolean }> = ({
  stepNumber,
  isCompleted,
}) => {
  const isEngaged = stepNumber >= 3 || isCompleted;
  const maleX = isEngaged ? 98 : 45;

  return (
    <svg className="w-full h-full max-w-xs drop-shadow-md" viewBox="0 0 240 280">
      {/* Blue Fabric Strap Background */}
      <rect x="20" y="40" width="200" height="200" rx="12" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
      <rect x="25" y="115" width="190" height="50" rx="6" fill="#0369A1" stroke="#075985" strokeWidth="2" />

      {/* Male Buckle Prong */}
      <g
        className="transition-all duration-600 ease-out"
        style={{ transform: `translateX(${maleX - 45}px)` }}
      >
        <rect x="35" y="125" width="35" height="30" rx="3" fill="#1E293B" />
        {/* Center Prong */}
        <rect x="70" y="136" width="22" height="8" rx="2" fill="#334155" />
        {/* Side Flexible Arms */}
        <path d="M 70,128 L 86,128 L 86,134 L 70,132 Z" fill="#334155" />
        <path d="M 70,152 L 86,152 L 86,146 L 70,148 Z" fill="#334155" />
      </g>

      {/* Female Receptor Clasp */}
      <rect x="135" y="120" width="60" height="40" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
      <rect x="135" y="127" width="26" height="26" rx="2" fill="#0F172A" />

      {/* Click Visual Burst on locked */}
      {isEngaged && (
        <g className="animate-pulse">
          <text x="120" y="105" textAnchor="middle" fill="#0284C7" fontSize="16" fontWeight="bold">
            CLICK! 🔒
          </text>
        </g>
      )}

      {/* Guide Arrow */}
      {stepNumber === 2 && (
        <path
          d="M 80,140 L 125,140 M 115,133 L 125,140 L 115,147"
          fill="none"
          stroke="#FACC15"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-bounce"
        />
      )}
    </svg>
  );
};

/* --- 4. SNAP VISUALIZER (PINK SECTION) --- */
const SnapVisualizer: React.FC<{ stepNumber: number; isCompleted?: boolean }> = ({
  stepNumber,
  isCompleted,
}) => {
  const isSnapped = stepNumber >= 3 || isCompleted;

  return (
    <svg className="w-full h-full max-w-xs drop-shadow-md" viewBox="0 0 240 280">
      {/* Pink Fabric Sections */}
      <rect x="25" y="30" width="190" height="220" rx="14" fill="#F472B6" stroke="#DB2777" strokeWidth="3" />
      <circle cx="120" cy="140" r="55" fill="#FBCFE8" stroke="#F472B6" strokeWidth="2" />

      {/* Bottom Socket (Female Snap) */}
      <circle cx="120" cy="140" r="32" fill="#CBD5E1" stroke="#64748B" strokeWidth="3" />
      <circle cx="120" cy="140" r="18" fill="#475569" stroke="#334155" strokeWidth="2" />

      {/* Top Stud (Male Snap) */}
      <g
        className="transition-all duration-500 ease-out"
        style={{
          transform: isSnapped
            ? 'scale(1)'
            : 'translate(0px, -20px) scale(1.15)',
          transformOrigin: '120px 140px',
        }}
      >
        <circle
          cx="120"
          cy="140"
          r="26"
          fill={isSnapped ? '#94A3B8' : '#E2E8F0'}
          stroke="#475569"
          strokeWidth="3"
          opacity={isSnapped ? 0.95 : 0.85}
        />
        <circle cx="120" cy="140" r="10" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
      </g>

      {/* Finger Thumb Press Prompt */}
      {stepNumber === 3 && !isCompleted && (
        <g className="animate-bounce">
          <circle cx="120" cy="140" r="38" fill="none" stroke="#DB2777" strokeWidth="4" strokeDasharray="6 4" />
          <text x="120" y="85" textAnchor="middle" fill="#BE185D" fontSize="15" fontWeight="bold">
            PRESS HERE! 👇
          </text>
        </g>
      )}

      {isSnapped && (
        <text x="120" y="215" textAnchor="middle" fill="#9D174D" fontSize="16" fontWeight="bold">
          POP! ✨
        </text>
      )}
    </svg>
  );
};

/* --- 5. VELCRO VISUALIZER (GREEN SECTION) --- */
const VelcroVisualizer: React.FC<{ stepNumber: number; isCompleted?: boolean }> = ({
  stepNumber,
  isCompleted,
}) => {
  const isAttached = stepNumber >= 3 || isCompleted;

  return (
    <svg className="w-full h-full max-w-xs drop-shadow-md" viewBox="0 0 240 280">
      {/* Green Fabric Board */}
      <rect x="25" y="30" width="190" height="220" rx="14" fill="#4ADE80" stroke="#16A34A" strokeWidth="3" />

      {/* Soft Loop Base Strip */}
      <rect x="50" y="70" width="140" height="60" rx="8" fill="#15803D" stroke="#166534" strokeWidth="2" />
      {/* Soft Loops Pattern */}
      {Array.from({ length: 12 }).map((_, i) => (
        <circle
          key={i}
          cx={65 + (i % 6) * 22}
          cy={85 + Math.floor(i / 6) * 24}
          r="5"
          fill="none"
          stroke="#86EFAC"
          strokeWidth="2"
        />
      ))}

      {/* Rough Hook Top Flap */}
      <g
        className="transition-all duration-700 ease-in-out"
        style={{
          transform: isAttached
            ? 'translateY(-70px)'
            : 'translateY(0px)',
        }}
      >
        <rect x="50" y="150" width="140" height="60" rx="8" fill="#166534" stroke="#14532D" strokeWidth="2" />
        {/* Hooks Pattern */}
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d={`M ${65 + (i % 6) * 22},${165 + Math.floor(i / 6) * 24} l 4,-4 l -3,-3`}
            stroke="#BBF7D0"
            strokeWidth="2"
            fill="none"
          />
        ))}
      </g>

      {/* Hand smoothing direction arrow */}
      {stepNumber === 3 && (
        <g className="animate-pulse">
          <line x1="120" y1="80" x2="120" y2="120" stroke="#FEF08A" strokeWidth="5" strokeLinecap="round" />
          <polygon points="120,130 113,115 127,115" fill="#FEF08A" />
        </g>
      )}

      {isAttached && (
        <text x="120" y="240" textAnchor="middle" fill="#14532D" fontSize="15" fontWeight="bold">
          FASTENED! 🌿
        </text>
      )}
    </svg>
  );
};

/* --- 6. RED SECTION VISUALIZER --- */
const RedFastenerVisualizer: React.FC<{ stepNumber: number; isCompleted?: boolean }> = ({
  stepNumber: _stepNumber,
  isCompleted,
}) => {
  return (
    <svg className="w-full h-full max-w-xs drop-shadow-md" viewBox="0 0 240 280">
      <rect x="25" y="30" width="190" height="220" rx="14" fill="#F87171" stroke="#DC2626" strokeWidth="3" />
      <circle cx="120" cy="140" r="50" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
      <text x="120" y="135" textAnchor="middle" fill="#991B1B" fontSize="18" fontWeight="bold">
        {isCompleted ? 'COMPLETE!' : 'PRACTICE'}
      </text>
      <text x="120" y="160" textAnchor="middle" fill="#B91C1C" fontSize="13">
        Red Fastener
      </text>
    </svg>
  );
};

