import './top-navbar.css'
import React from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../data/config';

export default function TopNavBar() {

    const [user,setUser] = React.useState("");
    const [showButtons,setShowButtons] = React.useState(false);
    const navbarRef = React.useRef(null);

    function toggleButtons(){
      setShowButtons(!showButtons);
    }

    React.useEffect(() => {
      (async () => {
        try {
          const resp = await axios.get(`${API_URL}/login`,{withCredentials: true});
          setUser(resp.data);
        } catch (error) {
          window.location.href = "./login"
        }
      })();
    }, []);
    
    React.useEffect(() => {
      function handleClickOutside(event) {
        if (navbarRef.current && !navbarRef.current.contains(event.target)) {
          setShowButtons(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [navbarRef]);

    function logOut(){
        axios.get(`${API_URL}/logout`,{withCredentials: true})
        .then(response => {
          if(response.status == 200)
            window.location.href = "./login"
        }).catch(error => {
            window.location.href = "./login"
        })
    }
    
    function signUp(){
      window.location.href = "./signup"
    }

    return (
        <div className="topnav" ref={navbarRef}>
          <a href="/" className="logo">
            <img src={"/vame-logo.png"} alt="Logo" />
          </a>
          <div className="username">{user.username}</div>
          <div className="options-button" onClick={toggleButtons}><i className="bi bi-gear-fill"></i></div>
          {showButtons && (
            <div className="buttons">
              <button onClick={signUp}>Sign Up</button>
              <button>Account Management</button>
              <button onClick={logOut}>Log Out</button>
            </div>
          )}
        </div>
    );
  }