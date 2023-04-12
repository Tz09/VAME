import './landing-page.css'
import React,{useState,useRef} from "react";
import TopNavBar from "../../components/top-navbar/top-navbar"
import BoundingBox from '../../components/drawing/bounding-box';
export default function LandingPage() {
    const [loading,setLoading] = React.useState(true);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startCoord, setStartCoord] = useState(null);
    const [endCoord, setEndCoord] = useState(null);
  
    const handleStartDrawing = (e) => {
      setIsDrawing(true);
      setStartCoord({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY
      });
    };
  
    const handleEndDrawing = () => {
      setIsDrawing(false);
      // do something with the bounding box coordinates
      console.log(`Bounding box coordinates: (${startCoord.x}, ${startCoord.y}), (${endCoord.x}, ${endCoord.y})`);
    };
  
    const handleMouseMove = (e) => {
      if (!isDrawing) {
        return;
      }
  
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const currentCoord = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY
      };
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.lineWidth = "2";
      ctx.strokeStyle = "red";
      ctx.rect(startCoord.x, startCoord.y, currentCoord.x - startCoord.x, currentCoord.y - startCoord.y);
      ctx.stroke();
  
      setEndCoord(currentCoord);
    };
  
    return (
        <>
            <TopNavBar loading={loading} setLoading={setLoading}/>
            {!loading &&
                <div className="streaming-box">
                <img
                    className="streaming-image"
                    src="http://127.0.0.1:5000/streaming"
                />
                </div>
            }
            
        </>
    );
  }