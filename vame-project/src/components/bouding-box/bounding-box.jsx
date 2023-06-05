import React, { useState } from 'react';
import { API_URL } from '../../data/config';
import post from '../http/post';
import './bounding-box.css'

function BoundedImage(props) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [boundingBoxCoords, setBoundingBoxCoords] = useState({});

  const handleMouseDown = (e) => {
    if (isDrawing && e.buttons === 1) {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      setBoundingBoxCoords({ x1: x, y1: y, x2: x, y2: y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing && boundingBoxCoords.x1 && boundingBoxCoords.y1 && e.buttons === 1) {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      setBoundingBoxCoords({
        ...boundingBoxCoords,
        x2: x,
        y2: y,
      });
    }
  };

  const handleMouseUp = (e) => {
    if (isDrawing && boundingBoxCoords.x1 && boundingBoxCoords.y1 && boundingBoxCoords.x2 && boundingBoxCoords.y2) {
      console.log(boundingBoxCoords);
    }
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setBoundingBoxCoords({});
  };

  const handleReset = () => {
    setIsDrawing(false);
    setBoundingBoxCoords({});
  };

  const setBoundingBox = () => {
    let roi_coordinates = [boundingBoxCoords.x1,boundingBoxCoords.y1,boundingBoxCoords.x2,boundingBoxCoords.y2]
  
    post('streaming',{ "roi": roi_coordinates })
    .then(response => {
        if (response.status == 200) {
        }
      })
      .catch(error => {
        console.log(error)
    })
  }

  const boundingBoxStyle = {
    position: 'absolute',
    border: '2px solid red',
    left: `${boundingBoxCoords.x1}px`,
    top: `${boundingBoxCoords.y1}px`,
    width: `${boundingBoxCoords.x2 - boundingBoxCoords.x1}px`,
    height: `${boundingBoxCoords.y2 - boundingBoxCoords.y1}px`,
  };

  return (
    <div style={{ position: 'relative' }}>
      <img
        src={props.src}
        onError={(e) => {
          e.target.src = '/missing-video.png';;
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={isDrawing ? { cursor: 'crosshair' } : {}}
      />
      {isDrawing && boundingBoxCoords.x1 && boundingBoxCoords.y1 && boundingBoxCoords.x2 && boundingBoxCoords.y2 && (
        <div style={boundingBoxStyle}></div>
      )}
      <div>
        <div className='button-bounding'>
          <button type="button" className="btn btn-primary btn-medium" onClick={handleStartDrawing} >Draw Region of Obstacle</button>
          <button type="button" className="btn btn-primary btn-medium" onClick={handleReset}>Reset</button>
          <button type="button" className="btn btn-primary btn-medium" onClick={setBoundingBox}>Confirm</button>
        {/* {boundingBoxCoords.x1 && boundingBoxCoords.y1 && boundingBoxCoords.x2 && boundingBoxCoords.y2 && (
          <div>
            Current coordinates: x1={boundingBoxCoords.x1}, y1={boundingBoxCoords.y1}, x2={boundingBoxCoords.x2}, y2=
            {boundingBoxCoords.y2}
          </div>
        )} */}
        </div>
      </div>
    </div>
  );
}

export default BoundedImage;