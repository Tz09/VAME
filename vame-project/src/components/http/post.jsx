import axios from "axios";
import { API_URL } from '../../data/config';

function post(url,data){
    return axios.post(`${API_URL}/${url}`,data,{withCredentials:true});
}

export default post;