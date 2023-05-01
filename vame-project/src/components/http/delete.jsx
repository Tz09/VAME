import axios from "axios";
import { API_URL } from '../../data/config';

function _delete(url,data){
    return axios.delete(`${API_URL}/${url}`,{data:data},{withCredentials:true});
}

export default _delete;