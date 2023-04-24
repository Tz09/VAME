import React, { useRef, useState } from 'react';

const BoundingBoxTool = () => {
  const canvasRef = useRef(null);
  const [startX, setStartX] = useState(null);
  const [startY, setStartY] = useState(null);
  const [endX, setEndX] = useState(null);
  const [endY, setEndY] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const drawBoundingBox = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red'; // <-- set the stroke style to red
    ctx.beginPath();
    ctx.rect(startX, startY, endX - startX, endY - startY);
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartX(x);
    setStartY(y);
    setIsActive(true);
  };

  const handleMouseMove = (e) => {
    if (!isActive) {
      return;
    }
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setEndX(x);
    setEndY(y);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <p>
        {isActive
          ? 'Click and drag to draw a bounding box.'
          : startX !== null && startY !== null && endX !== null && endY !== null
          ? `Bounding Box Coordinates: (${startX}, ${startY}), (${endX}, ${endY})`
          : 'Click the "Start Drawing" button to begin.'}
      </p>
      {startX !== null && startY !== null && endX !== null && endY !== null && drawBoundingBox()}
    </>
  );
};

export default BoundingBoxTool;