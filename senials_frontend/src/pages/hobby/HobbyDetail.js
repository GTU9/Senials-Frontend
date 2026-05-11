import React, {useEffect, useState} from 'react';
import styles from './HobbyDetail.module.css';
import starRate from '../common/MainVer1.module.css';
import common from '../common/Common.module.css';
import {FaBell} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { setHobbyDetail,setHobbyReview} from '../../redux/hobbySlice';
import { useParams } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const isJwtToken = (token) => {
    if (!token || token === 'null' || token === 'undefined') {
        return false;
    }
    return token.split('.').length === 3;
};

   //성향 출력
   const getTendency = (tendency) => {
    switch (tendency) {
        case 1:
            return "외향적";
        case 0:
            return "내향적";
        default:
            return "정보 없음";
    }
};

//난이도 출력
const getLevel = (level) => {
    switch (level) {
        case 0:
            return "쉬움";
        case 1:
            return "좀 쉬움";
        case 2:
            return "평범";
        case 3:
            return "좀 어려움";
        case 4:
            return "어려움";
        default:
            return "정보 없음";
    }
};

//비용 출력
const getBudget = (Budget) => {
    switch (Budget) {
        case 0:
            return "0~100,000";
        case 1:
            return "100,000~400,000";
        case 2:
            return "400,000~1,000,000";
        case 3:
            return "1,000,000~";
        default:
            return "정보 없음";
    }
};

function HobbyDetailPost() {

    const { hobbyNumber } = useParams();
    
    const dispatch=useDispatch();
    const navigate = useNavigate();

    const hobbyDetail=useSelector((state)=>state.hobbyDetail);
    const hobbyReviewList=useSelector((state)=>state.hobbyReview);

    const [sortOption, setSortOption] = useState('newest'); // 정렬 옵션: 'newest', 'highRate', 'lowRate'
    const [userNumber, setUserNumber] = useState(null);

    useEffect(() => {

        const token = localStorage.getItem('token');
        if (isJwtToken(token)) {
            try {
                const decodedUserNumber = jwtDecode(token).userNumber;
                setUserNumber(decodedUserNumber);
            } catch {
                localStorage.removeItem('token');
                setUserNumber(null);
            }
        } else if (token && token !== 'null' && token !== 'undefined') {
            localStorage.removeItem('token');
            setUserNumber(null);
        }

        if (hobbyNumber) {
            axios.get(`/hobby-detail/${hobbyNumber}`)
                .then((response) => {
                    if (response.data && response.data.results) {
                        dispatch(setHobbyDetail(response.data.results.hobby));
                        dispatch(setHobbyReview(response.data.results.hobbyReview));
                    } else {
                        console.error('Invalid response structure:', response.data);
                    }
                })
                .catch((error) => {
                    // 오류 처리 부분
                    if (error.response) {
                        // 서버가 응답했지만 상태 코드가 2xx가 아닌 경우
                        console.error('Error response data:', error.response.data);
                        console.error('Error response status:', error.response.status);
                    } else if (error.request) {
                        // 요청이 이루어졌지만 응답을 받지 못한 경우
                        console.error('Error request:', error.request);
                    } else {
                        // 오류를 발생시킨 요청 설정 중에 문제가 발생한 경우
                        console.error('Error message:', error.message);
                    }
                });
        } else {
            console.error('Invalid hobbyNumber:', hobbyNumber);
        }
    }, [dispatch, hobbyNumber, navigate]);



    //정렬 방식
    const sortedReviews = Array.isArray(hobbyReviewList)
    ? [...hobbyReviewList].sort((a, b) => {
        if (sortOption === 'newest') return new Date(b.hobbyReviewWriteDate) - new Date(a.hobbyReviewWriteDate);
        if (sortOption === 'highRate') return b.hobbyReviewRate - a.hobbyReviewRate;
        if (sortOption === 'lowRate') return a.hobbyReviewRate - b.hobbyReviewRate;
        return 0;
    })
    : [];

    //후기작성페이지 이동 이벤트
    const linkHobbyReview = () => {
        const token = localStorage.getItem('token');
        if (!isJwtToken(token)) {
            navigate('/login');
            return;
        }
        navigate(`/hobby-review?hobbyNumber=${hobbyNumber}`);
    };

    //작성된 후기 수정 페이지 이동 이벤트
    const linkHobbyReviewModify=(reviewNumber,hobbyNumber)=>{
        // alert("userNumber는 : " + userNumber)
        navigate(`/hobby-review-modify?review=${reviewNumber}&hobbyNumber=${hobbyNumber}`);
    }

    // 신고 페이지 이동 이벤트
    const linkHobbyReviewReport = (reviewNumber) => {
        navigate(`/report?type=3&target=${reviewNumber}`);
    }

 

    return (
        <>
        <div className={styles.page}>
            {/* 히어로 섹션 */}
            <div className={styles.hero}>
                <div className={styles.heroBg} style={{ backgroundImage: `url(/img/hobbyboard/${hobbyNumber})` }}></div>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <img src={`/img/hobbyboard/${hobbyNumber}`} className={styles.hobbyImg} alt="취미" />
                    <div className={styles.heroText}>
                        <div className={styles.hobbyName}>{hobbyDetail.hobbyName}</div>
                        <div className={styles.hobbyDetail}>{hobbyDetail.hobbyExplain}</div>
                    </div>
                </div>
            </div>

            {/* 선호도 바 */}
            <div className={styles.preferenceWrap}>
                <div className={styles.preferenceLabel}>
                    <span>평균 선호도</span>
                    <span className={styles.preferencePct}>{setPercentage(hobbyDetail.rating)}%</span>
                </div>
                <div className={styles.progressBarContainer}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${setPercentage(hobbyDetail.rating)}%` }}
                    ></div>
                </div>
            </div>

            {/* 특성 카드 3개 */}
            <div className={styles.hobbyPoint}>
                {/* 성향 */}
                <div className={styles.statCard}>
                    <p className={styles.statLabel}>성향</p>
                    <p className={styles.statValue}>{getTendency(hobbyDetail.hobbyTendency)}</p>
                    <div className={styles.statBar}>
                        {[0,1].map((i) => (
                            <div
                                key={i}
                                className={hobbyDetail.hobbyTendency >= i ? styles.statBarSegFilled : styles.statBarSeg}
                                style={hobbyDetail.hobbyTendency >= i ? {background:'#1D9E75'} : {}}
                            ></div>
                        ))}
                    </div>
                </div>
                {/* 지출범위 */}
                <div className={styles.statCard}>
                    <p className={styles.statLabel}>지출 범위</p>
                    <p className={styles.statValue}>{getBudget(hobbyDetail.hobbyBudget)}</p>
                    <div className={styles.statBar}>
                        {[0,1,2].map((i) => (
                            <div
                                key={i}
                                className={hobbyDetail.hobbyBudget >= i ? styles.statBarSegFilled : styles.statBarSeg}
                                style={hobbyDetail.hobbyBudget >= i ? {background:'#EF9F27'} : {}}
                            ></div>
                        ))}
                    </div>
                </div>
                {/* 난이도 */}
                <div className={styles.statCard}>
                    <p className={styles.statLabel}>난이도</p>
                    <p className={styles.statValue}>{getLevel(hobbyDetail.hobbyLevel)}</p>
                    <div className={styles.statBar}>
                        {[0,1,2,3].map((i) => (
                            <div
                                key={i}
                                className={hobbyDetail.hobbyLevel >= i ? styles.statBarSegFilled : styles.statBarSeg}
                                style={hobbyDetail.hobbyLevel >= i ? {background:'#378ADD'} : {}}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            <hr />
            <div className={styles.reviewHeader}>
                <div className={styles.reviewCount}>{`후기 ${hobbyDetail.reviewCount}`}</div>
                <div className={styles.reviewButton}>
                    <button className={styles.writeReview} onClick={() => linkHobbyReview(hobbyDetail.hobbyNumber)}>후기작성</button>
                    <select className={styles.sortReview}value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}>
                        <option value="newest">최신순</option>
                        <option value="highRate">높은별점순</option>
                        <option value="lowRate">낮은별점순</option>
                    </select>
                </div>  
            </div>
            {sortedReviews.map((item, index) => (
                <HobbyReview key={index} review={item} linkHobbyReviewModify={linkHobbyReviewModify} userNumber={userNumber} linkHobbyReviewReport={linkHobbyReviewReport} />
            ))}
            </div>
        </>
    );
}

function HobbyReview({ review, linkHobbyReviewModify, userNumber, linkHobbyReviewReport }) {
    return (
        <div className={styles.hobbyReview}>
            <div className={styles.hobbyReviewDetail}>
                <div className={styles.userInfo}>
                    <img src={`/img/userProfile/${review.userNumber}`} onError={(e) => e.target.src = '/img/defaultUser.png'}  className={styles.userImg} alt="사용자" />
                    <div className={styles.userName}>{review.userName}</div>
                    <div className={styles.date}>{convertDate(review.hobbyReviewWriteDate)}</div>
                    <div className={styles.reviewPoint}>
                        <Rate averageRating={review.hobbyReviewRate} />
                    </div>
                </div>
                    
                    <div className={styles.reviewTagRow}>
                        <span className={styles.reviewSummation}>성향: {getTendency(review.hobbyReviewTendency)}</span>
                        <span className={styles.reviewSummation}>난이도: {getLevel(review.hobbyReviewLevel)}</span>
                        <span className={styles.reviewSummation}>이용비용: {getBudget(review.hobbyReviewBudget)}</span>
                    </div>
                    <div className={styles.reviewDetail}>{review.hobbyReviewDetail}</div>
                    <div className={styles.reviewImgContainer}>
                    {/* <img src='/img/sampleImg4.png' className={styles.reviewImg} alt="후기" /> */}
                    {/* <img src='/img/sampleImg4.png' className={styles.reviewImg} alt="후기" /> */}
                </div>
                {
                userNumber === review.userNumber ?
                    <button className={styles.updateReviewButton} onClick={() => linkHobbyReviewModify(review.hobbyReviewNumber, review.hobbyNumber)}>
                        수정
                    </button>
                    :
                    <button className={`${styles.reportButton} ${common.reportDiv}`} style={{marginLeft: 'auto'}} onClick={() => linkHobbyReviewReport(review.hobbyReviewNumber)}>
                        <FaBell/> 신고
                    </button>
                }
            </div>
        </div>
    );
}


function Rate({averageRating}) {

    let filled = parseInt(averageRating);
    let halfFilled = averageRating * 100 % 100;
    let unfilled = parseInt(5 - averageRating);

    return (
        <div className={`${starRate.rateInfo}`}>
            {
                Array.from({length: filled}).map((_, idx) => {
                    return (
                        <div key={`filledStar${idx}`} className={`${starRate.baseStar}`}>
                            <div className={`${starRate.filledStar}`}></div>
                        </div>
                    )
                })
            }
            {
                halfFilled > 0 ?
                    <div className={`${starRate.baseStar}`}>
                        <div className={`${starRate.halfStar}`} style={{width: `${halfFilled}%`, marginRight: `${100 - halfFilled}%`}}></div>
                    </div>
                :
                    null
            }
            {
                Array.from({length: unfilled}).map((_, idx) => {
                    return (
                        <div key={`unfilledStar${idx}`} className={`${starRate.baseStar}`} />
                    )
                })
            }
        </div>
    )
}

function setPercentage(rating){
    
    return Math.ceil(rating*20);
}

function convertDate(datetime){
        const now = new Date(datetime);
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();

       return(`${year}-${month}-${day}`);
}

export default HobbyDetailPost;
