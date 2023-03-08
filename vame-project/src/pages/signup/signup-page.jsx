import './signup-page.css';
import React from 'react';
import axios from 'axios';
import { API_URL } from '../../data/config';
import TopNavBar from '../../components/top-navbar/top-navbar';

export default function SignupPage() {
    
    const [formData,setFormData] = React.useState({
        username: "",
        password: "",
    });

    const [usernameError,setUsernameError] = React.useState('');
    const [passwordError,setPasswordError] = React.useState('');
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
            axios.post(`${API_URL}/signup`,formData,{withCredentials: true})
                .then(response=>{
                    if(response.status == 200){
                        alert("Account Created Successful.")
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
            setErrorMessage('')
    }

    return(
        <>
            <TopNavBar/>
            <div className="signup-container">
                <form className="signup-form-container" onSubmit={handleSubmit}>
                <h2 className="register-label">Register Account</h2>
                    <label className="signup-label">Username: </label>
                    <input 
                        type="text"
                        placeholder="Username"
                        onChange={handleChange}
                        name="username"
                        value={formData.username}
                        className="signup-input"
                    />
                    {usernameError && <span className="error-container">{usernameError}</span>}
                    <label className="signup-label">Password: </label>
                    <input 
                        type="text"
                        placeholder="Password"
                        onChange={handleChange}
                        name="password"
                        value={formData.password}
                        className="signup-input"
                    />
                    {passwordError && <span className="error-container">{passwordError}</span>}
                    {errorMessage && <span className="error-container">{errorMessage}</span>}
                    <button type="submit" className='signup-submit'>Submit</button>
                </form>
            </div>
        </>
    )
}