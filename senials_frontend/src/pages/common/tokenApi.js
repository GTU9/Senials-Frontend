import axios from 'axios';

const createApiInstance = () => {

    const token = localStorage.getItem("token");

    // 토큰이 없거나 "null" 문자열인 경우 Authorization 헤더를 포함하지 않음
    const headers = {};
    if (token && token !== "null" && token.trim() !== "") {
        headers['Authorization'] = token;
    }

    const instance = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers
    });

    // Docker/Nginx 환경에서 /api 프리픽스 자동 추가 인터셉터
    const apiPrefix = process.env.REACT_APP_API_PREFIX || '';
    if (apiPrefix) {
        instance.interceptors.request.use(config => {
            if (config.url && !config.url.startsWith('http') && !config.url.startsWith(apiPrefix)) {
                const sep = config.url.startsWith('/') ? '' : '/';
                config.url = apiPrefix + sep + config.url;
            }
            return config;
        });
    }

    return instance;
};

export default createApiInstance;
