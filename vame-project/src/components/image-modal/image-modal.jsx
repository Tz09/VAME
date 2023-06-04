import { Modal, Box, TextField, Button,Dialog,DialogTitle,DialogContent,Stack,DialogActions} from '@mui/material';
import { useEffect,useState } from 'react';
import { API_URL } from '../../data/config';
import "./image-modal.css";
import post from '../http/post';
import Loader from '../../components/loader/loader';

export default function ImageModal(props){

    const [loading,setLoading] = useState(true);
    const [processing,setProcessing] = useState(false);

    useEffect(() => {
        if(props.open){
            setProcessing(true);
            post('dates',{"date":props.date})
            .then(response => {
                post('image',{"img_path":response.data})
                .then(response => {
                    props.setViolatedImages(response.data[0].violated_images)
                    props.setObstacleImages(response.data[0].obstacle_images)
                    setLoading(false)
                    setProcessing(false)
                })
            }).catch(error => console.log(error));}
    },[props.open])

    const onError = (event) => {
        event.target.src = '/missing-image.png'; // Set the source to the error image
    };
    
    return(
        <Dialog open={props.open} fullWidth maxWidth="lg">
            <DialogTitle textAlign="center">{props.date}</DialogTitle>
            <DialogContent>
            {!loading && 
            <div>
                <h2 className="image-title">Violated Images</h2>
                <div className="image-list">
                {props.violated_images && props.violated_images.length > 0 ? (
                    props.violated_images.map((image, index) => (
                        <div className="image-wrapper" key={index}>
                        <img src={`data:image/jpeg;base64,${image.data}`} alt={`Image ${index + 1}`} onError={onError} />
                        <div className="image-index">{image.time}</div>
                        </div>
                    ))
                    ) : (
                    <div>No violated images found.</div>
                )}
                </div>
                <h2 className="image-title">Obstacle Images</h2>
                <div className="image-list">
                {props.obstacle_images && props.obstacle_images.length > 0 ? (
                    props.obstacle_images.map((image, index) => (
                        <div className="image-wrapper" key={index}>
                        <img src={`data:image/jpeg;base64,${image.data}`} alt={`Image ${index + 1}`} onError={onError} />
                        <div className="image-index">{image.time}</div>
                        </div>
                    ))
                    ) : (
                    <div>No obstacle images found.</div>
                )} 
                </div>
            </div>
            }
            <Loader processing={processing}></Loader>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
            <Button onClick={props.onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>

    )
}
