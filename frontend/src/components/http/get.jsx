import axios from "axios";
import { API_URL } from '../../data/config';

function get(url){
    return axios.get(`${API_URL}/${url}`,{withCredentials:true});
}

export default get;