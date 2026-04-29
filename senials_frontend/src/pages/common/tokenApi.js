// import axios from "axios";

// const token = localStorage.getItem("token");

// const api = axios.create({
//     /* API 기본 URL - proxy 설정 없애면 baseURL 활성화 */
//     // baseURL: 'http://localhost:8080', 
//     headers: {
//         'Authorization': token
//     }
// })

// export default api;

import axios from 'axios'; 
import { getStoredToken } from '../../utils/authToken';

const createApiInstance = () => {

    const token = getStoredToken(); 

    return axios.create({ 
        /* API 기본 URL - proxy 설정 없애면 baseURL 활성화 */ 
        // baseURL: 'http://localhost:8080', 
        headers: token
            ? { 'Authorization': `Bearer ${token}` }
            : {}
    }); 
}; 

export default createApiInstance;
