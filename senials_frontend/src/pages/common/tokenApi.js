import axios from 'axios'; 

const createApiInstance = () => {

    const token = localStorage.getItem("token"); 

    // 토큰이 없거나 "null" 문자열인 경우 Authorization 헤더를 포함하지 않음
    const headers = {};
    if (token && token !== "null" && token.trim() !== "") {
        headers['Authorization'] = token;
    }

    return axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers
    });
}; 

export default createApiInstance;
