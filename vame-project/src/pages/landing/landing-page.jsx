import './landing-page.css'
import { API_URL } from '../../data/config';
import React, { useState, useRef, useEffect } from "react";
import TopNavBar from "../../components/top-navbar/top-navbar"
import BoundedImage from '../../components/bouding-box/bounding-box';
import post from '../../components/http/post';

export default function LandingPage() {
  
  const [loading, setLoading] = React.useState(true);

  const handleClick = async () => {
    post('streaming',{"camera":"1"})
    .then(response => {
        if (response.status == 200) {
        }
      })
      .catch(error => {
        console.log(error)
      })
  };

  
  return (
    <>
      <TopNavBar loading={loading} setLoading={setLoading} />
      {!loading &&
        <div className='container'>
          <div className="streaming-box">
            <button type="button" className="btn btn-primary btn-lg" onClick={handleClick}>Stop/Start</button>
            <BoundedImage 
              src="http://127.0.0.1:5000/streaming"
            />
          </div>
        </div>
      }
    </>
  );
}