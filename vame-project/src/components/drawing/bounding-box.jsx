import React, { useState } from "react";

const BoundingBox = ({ imageWidth, imageHeight, setCoordinates }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(null);
  const [startY, setStartY] = useState(null);
  const [endX, setEndX] = useState(null);
  const [endY, setEndY] = useState(null);

  const handleMouseDown = (event) => {
    setIsDrawing(true);
    setStartX(event.nativeEvent.offsetX);
    setStartY(event.nativeEvent.offsetY);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;
    setEndX(event.nativeEvent.offsetX);
    setEndY(event.nativeEvent.offsetY);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (startX === endX || startY === endY) {
      setStartX(null);
      setStartY(null);
      setEndX(null);
      setEndY(null);
    } else {
      const coordinates = {
        x1: Math.min(startX, endX),
        y1: Math.min(startY, endY),
        x2: Math.max(startX, endX),
        y2: Math.max(startY, endY),
      };
      setCoordinates(coordinates);
    }
  };

  return (
    <div
      className="bounding-box"
      style={{ position: "absolute", top: 0, left: 0 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {isDrawing && (
        <div
          className="box"
          style={{
            position: "absolute",
            border: "2px solid red",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            top: startY,
            left: startX,
            width: endX - startX,
            height: endY - startY,
          }}
        ></div>
      )}
      <img
        className="streaming-image"
        src="http://127.0.0.1:5000/streaming"
        style={{ maxWidth: "100%", height: "auto" }}
        width={imageWidth}
        height={imageHeight}
      />
    </div>
  );
};

export default BoundingBox;