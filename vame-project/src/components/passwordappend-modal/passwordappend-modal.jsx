import React from "react";
import { API_URL } from '../../data/config';
import { Modal, Box, TextField, Button,Dialog,DialogTitle,DialogContent,Stack,DialogActions} from '@mui/material';
import post from "../http/post";

export default function PasswordAppendModal(props){

    const username = props.rowUsername;
    function handleChange(event){
      props.setPasswordAppend(event.target.value);
    }
    
    function handleSubmit(event){
      event.preventDefault();
      let isvalid = true;
      if(!props.passwordappend.trim() ){
        props.setPasswordError('*Password is required');
        isvalid = false;
      }else{
        props.setPasswordError('');
      }

      if(isvalid) {
          post('info',{"username":username,
          "password":props.passwordappend})
          .then(response=>{
              if(response.status == 200){
                  alert(response.data['message'])
                  window.location.href = "./accountmanagement"
              }
          })
          .catch(error => {
              setErrorMessage(error.response.data['message']);
          })
      }
    }
    
    return (
        <Dialog open={props.open}>
          <DialogTitle textAlign="center">Change Password</DialogTitle>
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
                label="New Password"
                name="password"
                type="text"
                value={props.passwordappend}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              </Stack>
              {props.passwordError && <span className="error-container">{props.passwordError}</span>}
            </form>
          </DialogContent>
          <DialogActions sx={{ p: '1.25rem' }}>
              <Button onClick={props.onClose}>Cancel</Button>
              <Button color="error" onClick={handleSubmit} variant="contained">
                  Append
              </Button>
          </DialogActions>
        </Dialog>
      );
}