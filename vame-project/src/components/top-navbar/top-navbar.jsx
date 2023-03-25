import './top-navbar.css'
import React from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../data/config';

export default function TopNavBar(props) {

    const [user,setUser] = React.useState("");
    const [admin,setAdmin] = React.useState(false);
    const navigate = useNavigate();
    
    function toggleButtons(){
      setShowButtons(!showButtons);
    }

    React.useEffect(() => {
      (async () => {
        try {
          const resp = await axios.get(`${API_URL}/login`,{withCredentials: true});
          if(resp.status == 200){
            setUser(resp.data);
            const resp2 = await axios.get(`${API_URL}/access`,{withCredentials: true});
            if(resp2.data["message"] == 'True'){
              setAdmin(true);
            }else{
              setAdmin(false)
            }
          }
          props.setLoading(false)
        } catch (error) {
          console.log(error)
        }
      })();
    }, []);

    function logOut(){
        axios.get(`${API_URL}/logout`,{withCredentials: true})
        .then(response => {
          if(response.status == 200)
            navigate('/login')
        }).catch(error => {
            navigate('/login')
        })
    }
    
    function accountManage(){
      navigate('/accountmanagement')
    }
    
    if(props.loading == false){
      return (
          <div className="topnav">
            <a href="/" className="logo">
              <img src={"/vame-logo.png"} alt="Logo" />
            </a>
            <div className="username">{user.username}</div>
            {admin && <button className='button' onClick={accountManage}>Account Management</button>}
            <button className="button" onClick={logOut}>Log Out</button>
            
          </div>
      );
    }
  }