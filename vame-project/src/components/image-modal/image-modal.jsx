import { Modal, Box, TextField, Button,Dialog,DialogTitle,DialogContent,Stack,DialogActions} from '@mui/material';
import { useEffect,useState } from 'react';
import { API_URL } from '../../data/config';
import axios from 'axios';
import "./image-modal.css"

export default function ImageModal(props){

    const [loading,setLoading] = useState(true);

    useEffect(() => {
        if(props.open){
            axios.post(`${API_URL}/dates`,{"date":props.date},{withCredentials: true})
            .then(response => {
                axios.post(`${API_URL}/image`,{"img_path":response.data},{withCredentials: true})
                .then(response => {
                    props.setImages(response.data.images)
                    setLoading(false)
                })
            }).catch(error => console.log(error));}
    },[props.open])

    const onError = (event) => {
        event.target.src = '/missing image.png'; // Set the source to the error image
    };
    
    return(
        <Dialog open={props.open} fullWidth maxWidth="lg">
            <DialogTitle textAlign="center">Images</DialogTitle>
            <DialogContent>
            {!loading && 
            <div className="image-list">
                {props.images.map((image, index) => (
                    <div className="image-wrapper" key={index}>
                    <img src={`data:image/jpeg;base64,${image.data}`} alt={`Image ${index + 1}`} onError={onError} />
                    <div className="image-index">{index + 1}</div>
                    </div>
                ))}
            </div>
            }
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
            <Button onClick={props.onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>

    )
}