import React, { useMemo } from 'react';

interface ConfettiPiece {
  id: number;
  left: number; // percentage 0-100
  size: number; // px 6-14
  delay: number; // seconds
  duration: number; // seconds
  color: string;
  shape: 'rect' | 'circle' | 'ribbon' | 'star';
  rotate: number; // degrees
}

const PALETTE = [
  '#C9A84C', // Gold Main
  '#E8C97A', // Gold Light
  '#8B6914', // Gold Dark
  '#1B4332', // Emerald Main
  '#40916C', // Emerald Light
  '#52B788', // Emerald Mint
  '#F59E0B', // Amber
  '#E11D48', // Rose
  '#38BDF8', // Sky Blue
  '#FAF7F0', // Cream Pearl
];

export default function QuizConfetti() {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    const list: ConfettiPiece[] = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      const shapeType = i % 4 === 0 ? 'star' : i % 3 === 0 ? 'circle' : i % 2 === 0 ? 'ribbon' : 'rect';
      list.push({
        id: i,
        left: Math.random() * 98 + 1,
        size: Math.floor(Math.random() * 8) + 7, // 7px - 14px
        delay: Math.random() * 3.5, // 0 to 3.5s
        duration: Math.random() * 2.5 + 3.0, // 3s to 5.5s
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        shape: shapeType,
        rotate: Math.floor(Math.random() * 360)
      });
    }
    return list;
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none"
    >
      {pieces.map((piece) => {
        let borderRadius = '2px';
        let width = `${piece.size}px`;
        let height = `${piece.size * 1.5}px`;

        if (piece.shape === 'circle') {
          borderRadius = '50%';
          width = `${piece.size}px`;
          height = `${piece.size}px`;
        } else if (piece.shape === 'ribbon') {
          width = `${piece.size * 0.5}px`;
          height = `${piece.size * 2.2}px`;
          borderRadius = '1px';
        }

        return (
          <div
            key={piece.id}
            className="absolute top-0 animate-confetti-fall"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              animationIterationCount: 'infinite',
            }}
          >
            {piece.shape === 'star' ? (
              <span 
                className="inline-block"
                style={{
                  color: piece.color,
                  fontSize: `${piece.size * 1.4}px`,
                  transform: `rotate(${piece.rotate}deg)`,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))'
                }}
              >
                ✦
              </span>
            ) : (
              <div
                style={{
                  width,
                  height,
                  backgroundColor: piece.color,
                  borderRadius,
                  transform: `rotate(${piece.rotate}deg)`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.12)'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
