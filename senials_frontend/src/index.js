import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {Provider} from "react-redux"
import store from './redux/store.js'
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Docker/Nginx 환경에서 /api 프리픽스 자동 추가 인터셉터
// REACT_APP_API_PREFIX=/api 로 설정된 경우에만 동작 (로컬 개발 환경에서는 빈 값)
const apiPrefix = process.env.REACT_APP_API_PREFIX || '';
if (apiPrefix) {
    axios.interceptors.request.use(config => {
        if (config.url && !config.url.startsWith('http') && !config.url.startsWith(apiPrefix)) {
            // 슬래시 중복/누락 없이 연결
            const sep = config.url.startsWith('/') ? '' : '/';
            config.url = apiPrefix + sep + config.url;
        }
        return config;
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>

);
