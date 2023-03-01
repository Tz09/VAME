import './login-page.css'
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../data/config';

export default function LoginPage() {

    const navigate = useNavigate();

    const [formData,setFormData] = React.useState({
        username: "",
        password: "",
    });
    
    const [usernameError,setUsernameError] = React.useState('');
    const [passwordError,setPasswordError] = React.useState('');
    const [showPassword,setShowPassword] = React.useState(false);

    function handleChange(event){
        setFormData(prevFormData => {
            const {name,value} = event.target
            return {
                ...prevFormData,
                [name]: value
            }
        })
    }

    function handleSubmit(event){
        event.preventDefault();
        
        let isvalid = true;

        if(!formData.username.trim()){
            setUsernameError('*Username is required');
            isvalid = false;
        }else{
            setUsernameError('');
        }
        
        if(!formData.password.trim()){
            setPasswordError('*Password is required');
        }else{
            setPasswordError('');
        }

        if(isvalid){
            axios.post(`${API_URL}/login`,formData)
                .then(response=>{
                    if(response.status == 200){
                        localStorage.setItem('token',response.data.access_token)
                        navigate('/')
                    }
                })
                .catch(response => {
                    console.log(response)
                })
            }
    }

    function handleTogglePassword(){
        setShowPassword(!showPassword);
    }

    return (
        <div className="login-container">
            <form className="form-container" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <label>Username: </label>
                <input 
                    type="text"
                    placeholder="Username"
                    onChange={handleChange}
                    name="username"
                    value={formData.username}
                />
                {usernameError && <span className="error-container">{usernameError}</span>}
                <label>Password: </label>
                <div className="password-container">
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Password"
                        onChange={handleChange}
                        name="password"
                        value={formData.password}
                    />
                    <span className="bi bi-eye-fill" onClick={handleTogglePassword}/>
                </div>
                {passwordError && <span className="error-container">{passwordError}</span>}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
  }