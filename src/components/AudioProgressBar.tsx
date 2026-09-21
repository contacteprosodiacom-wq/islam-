import { useState, useRef, MouseEvent } from 'react';

interface AudioProgressBarProps {
  currentTime: number;
  duration: number;
  onChange: (time: number) => void;
  formatTime: (secs: number) => string;
}

export default function AudioProgressBar({
  currentTime,
  duration,
  onChange,
  formatTime,
}: AudioProgressBarProps) {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const totalDuration = isNaN(duration) || !duration ? 0 : duration;
  const safeCurrentTime = isNaN(currentTime) || !currentTime ? 0 : currentTime;
  const progressPercent = totalDuration > 0 ? (safeCurrentTime / totalDuration) * 100 : 0;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || totalDuration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    setHoverTime(percentage * totalDuration);
    setHoverX(x);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverTime(null);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <div className="w-full flex flex-col gap-1 select-none">
      {/* Time Display */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono">
        <span className="text-gold-light font-bold drop-shadow-sm">
          {formatTime(safeCurrentTime)}
        </span>
        <span className="text-gray-400">
          {formatTime(totalDuration)}
        </span>
      </div>

      {/* Interactive Bar */}
      <div 
        ref={progressBarRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-5 flex items-center group cursor-pointer"
      >
        {/* Custom Visual Track Container */}
        <div className="relative w-full h-1.5 rounded-full bg-white/10 overflow-visible transition-all duration-300 group-hover:h-2.5">
          {/* Active Played Track with shimmering golden-emerald gradient */}
          <div 
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-gold-dark via-gold-main to-gold-light transition-all duration-100 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            style={{ width: `${progressPercent}%` }}
          />
          
          {/* Progress Handle (Knob) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-gold-main shadow-[0_2px_4px_rgba(0,0,0,0.4)] scale-0 transition-transform duration-200 group-hover:scale-100"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />

          {/* Hover indicator line & preview */}
          {isHovering && hoverTime !== null && totalDuration > 0 && (
            <>
              {/* Virtual Hover progress track */}
              <div 
                className="absolute top-0 left-0 h-full rounded-full bg-white/10 pointer-events-none"
                style={{ width: `${hoverX}px` }}
              />
              
              {/* Tooltip */}
              <div 
                className="absolute bottom-6 -translate-x-1/2 bg-ink border border-gold-main/30 text-gold-light text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none transition-all duration-75 z-50 whitespace-nowrap"
                style={{ left: `${hoverX}px` }}
              >
                {formatTime(hoverTime)}
              </div>
            </>
          )}
        </div>

        {/* Real Native range input layered on top, invisible but capturing events cleanly */}
        <input
          type="range"
          min={0}
          max={totalDuration > 0 ? totalDuration : 100}
          step={0.1}
          value={totalDuration > 0 ? safeCurrentTime : 0}
          disabled={totalDuration === 0}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          aria-label="Barre de progression audio"
        />
      </div>
    </div>
  );
}
