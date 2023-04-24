import './landing-page.css'
import axios from 'axios';
import { API_URL } from '../../data/config';
import React,{useState,useRef} from "react";
import TopNavBar from "../../components/top-navbar/top-navbar"
import BoundingBoxTool from '../../components/bouding-box/bounding-box';

export default function LandingPage() {
    const [loading,setLoading] = React.useState(true);
    const [variable1, setVariable1] = useState('');
    const [variable2, setVariable2] = useState('');
  
    const handleClick = async () => {
      axios.post(`${API_URL}/streaming`,{"camera":"1"},{withCredentials: true})
          .then(response=>{
              if(response.status == 200){
              }
          })
          .catch(error => {
              console.log(error)
          })
    };
  
    const [isToolActive, setIsToolActive] = useState(false);

    const handleStartDrawing = () => {
        setIsToolActive(true);
    };
    return (
        <>
            <TopNavBar loading={loading} setLoading={setLoading}/>
            {!loading &&
                <div className="streaming-box">
                <button onClick={handleClick}>Stop/Start</button>
                <img
                    className="streaming-image"
                    src="http://127.0.0.1:5000/streaming"
                />
                </div>
            }
        </>
    );
  }