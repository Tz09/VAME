import './login-page.css';
import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import Loader from '../../components/loader/loader';
import post from '../../components/http/post';

export default function LoginPage() {
    
    const [formData,setFormData] = useState({
        username: "",
        password: "",
    });
    
    const [usernameError,setUsernameError] = useState('');
    const [passwordError,setPasswordError] = useState('');
    const [showPassword,setShowPassword] = useState(false);
    const [errorMessage,setErrorMessage] = useState('');
    const [processing,setProcessing] = useState(false);

    const navigate = useNavigate();

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
            isvalid = false;
        }else{
            setPasswordError('');
        }

        if(isvalid){
            setProcessing(true);
            const timeout = setTimeout(() => {
                post('login', formData)
                  .then(response => {
                    if (response.status === 200) {
                      setFormData({
                        username: "",
                        password: "",
                      });
                      navigate('/');
                    }
                  })
                  .catch(error => {
                    setErrorMessage(error.response.data['message']);
                    setProcessing(false);
                  })
                  .finally(() =>{
                    setProcessing(false);
                  })
              }, 1000); 
          
              return () => clearTimeout(timeout); 
            }
            setErrorMessage('');
    }

    function handleTogglePassword(){
        setShowPassword(!showPassword);
    }

    return (
        <div className="login-container">
            <form className="login-form-container" onSubmit={handleSubmit}>
                <img src="./vame-logo.png"></img>
                <label className="login-label">Username: </label>
                <input 
                    type="text"
                    placeholder="Username"
                    onChange={handleChange}
                    name="username"
                    value={formData.username}
                    className="login-input"
                />
                {usernameError && <span className="error-container">{usernameError}</span>}
                <label className="login-label">Password: </label>
                <div className="password-container">
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Password"
                        onChange={handleChange}
                        name="password"
                        value={formData.password}
                        className="login-input"
                    />
                    <span className="bi bi-eye-fill" onClick={handleTogglePassword}/>
                </div>
                {passwordError && <span className="error-container">{passwordError}</span>}
                {errorMessage && <span className="error-container">{errorMessage}</span>}
                <button type="submit" className="login-submit">Login</button>
                <Loader processing={processing}></Loader>
            </form>
        </div>
    );
  }