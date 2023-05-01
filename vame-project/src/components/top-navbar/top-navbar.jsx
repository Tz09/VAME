import './top-navbar.css'
import React,{useEffect,useState} from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../data/config';
import get from '../http/get';

export default function TopNavBar(props) {

    const [user,setUser] = useState("");
    const [admin,setAdmin] = useState(false);
    const [access,setAccess] = useState(false);
    const navigate = useNavigate();
    
    function toggleButtons(){
      setShowButtons(!showButtons);
    }

    useEffect(() => {
      (async () => {
        try {
          const login_resp = await get('login');
          const admin_resp = await get('admin');
          const access_resp = await get('access');
          setUser(login_resp.data)
          if(admin_resp.data["message"] == 'True'){
            setAdmin(true);
          }else{
            setAdmin(false);
          }

          if(access_resp.data["message"] == 'True'){
            setAccess(true);
          }else{
            setAccess(false);
          }
          
          props.setLoading(false)
        } catch (error) {
          console.log(error)
        }
      })();
    }, []);
    
    function logOut(){
        get('logout').then(response => {
          if(response.status == 200)
            navigate('/login')
        }).catch(error => {
            navigate('/login')
        })
    }
    
    function navigateAccountManagement(){
      navigate('/accountmanagement')
    }

    function navigateMonitoring(){
      navigate('/')
    }
    
    function navigateDashboard(){
      navigate('/dashboard')
    }

    if(props.loading == false){
      return (
        <>
          <nav className="navbar navbar-expand navbar-dark bg-dark">
              <div className="container">
                  <a className="navbar-brand" href="./"><img src="/vame-logo-transparent.png" height="50px"className="img-responsive" id="logo"/>
                    <strong className="username">{user.username}</strong>
                  </a>
                  <div className="navbar-dark"> 
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <a className="nav-link" onClick={navigateMonitoring}>
                              Monitoring
                            </a>
                        </li>
                        {access && <li className="nav-item">
                            <a className="nav-link" onClick={navigateDashboard}>
                              Dashboard
                            </a>
                        </li>}
                        {admin && <li className="nav-item">
                            <a className="nav-link" onClick={navigateAccountManagement}>
                              Account Management
                            </a>
                        </li>}
                        <li className="nav-item">
                            <a className="nav-link" onClick={logOut}>
                              Log Out
                            </a>
                        </li>
                    </ul>
                  </div>
              </div>
          </nav>
        </>
      );
    }
  }