import React from 'react';
import axios from 'axios';
import { API_URL } from '../../data/config';
import { Modal, Box, TextField, Button,Dialog,DialogTitle,DialogContent,Stack,DialogActions} from '@mui/material';

export default function SignupModal(props) {

    function handleChange(event){
        props.setFormData(prevFormData => {
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

        if(!props.formData.username.trim()){
            props.setUsernameError('*Username is required');
            isvalid = false;
        }else{
            props.setUsernameError('');
        }
        
        if(!props.formData.password.trim()){
            props.setPasswordError('*Password is required');
            isvalid = false;
        }else{
            props.setPasswordError('');
        }

        if(isvalid){
            axios.post(`${API_URL}/signup`,props.formData,{withCredentials: true})
                .then(response=>{
                    if(response.status == 200){
                        alert(response.data["message"])
                        window.location.href = "./accountmanagement"
                    }
                })
                .catch(error => {
                    setErrorMessage(error.response.data['message']);
                })

            props.setFormData(({
                username: "",
                password: "",
            }))
            }
            props.setErrorMessage('')
    }

    return (
      <Dialog open={props.open}>
        <DialogTitle textAlign="center">Create New Account</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack
                sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
                }}
            >
            <TextField
              label="Username"
              name="username"
              value={props.formData.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            {props.usernameError && <span className="error-container">{props.usernameError}</span>}
            <TextField
              label="Password"
              name="password"
              type="text"
              value={props.formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            </Stack>
            {props.passwordError && <span className="error-container">{props.passwordError}</span>}
            {props.errorMessage && <span className="error-container">{props.errorMessage}</span>}
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
            <Button onClick={props.onClose}>Cancel</Button>
            <Button color="error" onClick={handleSubmit} variant="contained">
                Create 
            </Button>
        </DialogActions>
      </Dialog>
    );
  };