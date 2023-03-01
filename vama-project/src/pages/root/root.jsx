import React from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../data/config';

export default function Root() {

    const token = localStorage.getItem('token')
    const navigate = useNavigate();
    const [user,setUser] = React.useState("")

    axios.get(`${API_URL}/login`,{
        headers:{
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        setUser(response.data.logged_in_as)
    })
    .catch(error => {
        console.error(error);
    });

    function logOut(){
        axios.post(`${API_URL}/logout`)
        .then(response => {
            localStorage.removeItem("token")
            console.log(response)
            navigate("/login")
        }).catch(error =>{
            if(error.response){
                console.log(error.response)
            }
        })
    }

    return (
        <div>
            <h1>Welcome to this React Application</h1>
            <h1>{user}</h1>
            <button onClick={logOut}>LogOut</button>
        </div>
    );
  }