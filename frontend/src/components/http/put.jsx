import axios from "axios";
import { API_URL } from '../../data/config';

function put(url,data){
    return axios.put(`${API_URL}/${url}`,data,{withCredentials:true});
}

export default put;