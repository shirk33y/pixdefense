
import React from 'react';

interface PixelArtProps {
  data: string[][];
  size: number;
}

const PixelArt: React.FC<PixelArtProps> = ({ data, size }) => {
  const pixelSize = size / data.length;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {data.map((row, y) =>
        row.map((color, x) => (
          <div
            key={`${y}-${x}`}
            className="absolute"
            style={{
              top: y * pixelSize,
              left: x * pixelSize,
              width: pixelSize,
              height: pixelSize,
              backgroundColor: color === '#0000' ? 'transparent' : color,
            }}
          />
        ))
      )}
    </div>
  );
};

export default PixelArt;
