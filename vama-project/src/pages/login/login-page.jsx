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
    const [errorMessage,setErrorMessage] = React.useState('');

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
            axios.post(`${API_URL}/login`,formData,{withCredentials: true})
                .then(response=>{
                    if(response.status == 200){
                        window.location.href = "./"
                    }
                })
                .catch(error => {
                    setErrorMessage(error.response.data['message']);
                })

            setFormData(({
                username: "",
                password: "",
            }))
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
                {errorMessage && <span className="error-container">{errorMessage}</span>}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
  }