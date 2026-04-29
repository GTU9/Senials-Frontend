import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
// CSS
import styles from './Login.module.css';

const isJwtToken = (token) => {
    if (!token || token === 'null' || token === 'undefined') {
        return false;
    }

    return token.split('.').length === 3;
};

/** 로그인 API가 토큰을 내려주는 방식이 제각각일 수 있어 후보를 순서대로 탐색 */
const extractTokenFromLoginResponse = (response) => {
    const d = response.data || {};
    const fromBody =
        d.token ??
        d.accessToken ??
        d.access_token ??
        d.jwt;
    if (fromBody && typeof fromBody === 'string') {
        return fromBody.trim();
    }

    const auth = response.headers?.authorization;
    if (auth && typeof auth === 'string') {
        const trimmed = auth.trim();
        const bearer = trimmed.match(/^Bearer\s+(.+)$/i);
        return (bearer ? bearer[1] : trimmed).trim();
    }

    return null;
};

function Login() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [userPwd, setUserPwd] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
    const [errorMessage, setErrorMessage] = useState('');

    const linkSignup = () => {
        navigate('/join');
    };

    const handleLogin = async () => {
        setErrorMessage('');
        setIsLoading(true); // 로딩 시작
        try {
            const response = await axios.post('/login', {
                userName,
                userPwd
            });

            // 로그인 성공 시 처리
            console.log('로그인 성공:', response.data);
            const token = extractTokenFromLoginResponse(response);

            if (!token) {
                console.warn(
                    '로그인 응답에 JWT가 없습니다. JSON에 token(또는 accessToken)을 넣거나 Authorization 헤더로 내려주세요.',
                    response.data,
                    response.headers
                );
                setErrorMessage(
                    '서버에서 토큰을 받지 못했습니다. 백엔드가 로그인 성공 시 JWT를 응답 본문 또는 Authorization 헤더로 내려주는지 확인해 주세요.'
                );
                alert(
                    '로그인 응답에 토큰이 없습니다.\n백엔드 successfulAuthentication에서 JSON에 token 필드를 포함하거나, 프론트와 맞는 필드명으로 내려주세요.'
                );
                return;
            }

            if (!isJwtToken(token)) {
                setErrorMessage('받은 토큰이 JWT 형식이 아닙니다.');
                alert('로그인 토큰 형식이 올바르지 않습니다.');
                return;
            }

            localStorage.setItem("token", token); // JWT를 로컬 스토리지에 저장

            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const redirectPath = urlParams.get('redirect') || '/'; // 쿼리 파라미터에서 redirect 경로를 가져오고, 없으면 '/'로 설정

            navigate(redirectPath); // 이전 페이지로 리다이렉트
        } catch (error) {
            if (error.response) {
                alert("없는 사용자이거나 아이디나 비밀번호가 틀렸습니다.")
                console.error('서버 응답 실패:', error.response.data);

                const serverMessage = String(error.response?.data?.message || '').toLowerCase();
                const isUnauthorized =
                    error.response.status === 401 ||
                    serverMessage === 'unauthorized' ||
                    serverMessage.includes('unauthorized');

                setErrorMessage(
                    isUnauthorized
                        ? '아이디 또는 비밀번호가 올바르지 않습니다.'
                        : (error.response.data.message || '로그인 실패')
                );
            } else if (error.request) {
                console.error('요청이 이루어졌지만 응답이 없음:', error.request);
            } else {
                console.error('설정 중 오류 발생:', error.message);
            }
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const token = urlParams.get('token'); // URL에서 token 추출

        if (token) {
            // JWT가 URL 파라미터에 있을 경우
            if (!isJwtToken(token)) {
                localStorage.removeItem("token");
                alert("로그인 토큰이 유효하지 않습니다. 다시 로그인해주세요.");
                navigate('/login');
                return;
            }
            localStorage.setItem("token", token); // JWT를 로컬 스토리지에 저장
            console.log('JWT 저장 완료:', token);
            navigate('/success'); // 성공 페이지로 리다이렉트
        }
    }, [navigate]);

    return (
         <div className={styles.bigDiv}>
                    <div className={styles.smallDiv}>
        <div className={styles.loginCard}>
            <h1 className={styles.SimpleLogin}>로그인</h1>
            <div className={styles.OrginputContainer}>
                <input
                    type="text"
                    placeholder="이름"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className={styles.OrginputField}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={userPwd}
                    onChange={(e) => setUserPwd(e.target.value)}
                    className={styles.OrginputField}
                />
                <button
                    className={styles.OrgloginButton}
                    onClick={handleLogin}
                    disabled={isLoading} // 로딩 중에는 클릭 비활성화
                >
                    {isLoading ? '로그인 중...' : '확인'} {/* 로딩 중일 때 텍스트 변경 */}
                </button>
                {errorMessage ? (
                    <div className={styles.loginAlert} role="alert">{errorMessage}</div>
                ) : null}
            </div>
            <div className={styles.buttonContainer}>
                <button type="button" className={styles.simpleSignupButton} onClick={linkSignup}>
                    회원가입
                </button>
            </div>
        </div>
        </div>
        </div>
    );
}

export default Login;
