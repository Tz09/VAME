import './landing-page.css'
import axios from 'axios';
import { API_URL } from '../../data/config';
import React, { useState, useRef, useEffect } from "react";
import TopNavBar from "../../components/top-navbar/top-navbar"
import BoundedImage from '../../components/bouding-box/bounding-box';
export default function LandingPage() {
  
  const [loading, setLoading] = React.useState(true);

  const handleClick = async () => {
    axios.post(`${API_URL}/streaming`, { "camera": "1" }, { withCredentials: true })
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
        <div className="streaming-box">
          <button onClick={handleClick}>Stop/Start</button>
          <BoundedImage src="http://127.0.0.1:5000/streaming" />
        </div>
      }
    </>
  );
}