import React,{useState, useEffect} from 'react';
import styles from './HobbyBoard.module.css';
import ctr from '../common/MainVer1.module.css';
import {FaAngleLeft, FaBell, FaSearch} from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { setHobbyCard,setHobbyTop3Card } from '../../redux/hobbySlice';
import { getStoredToken } from '../../utils/authToken';

function HobbyBoardPost() {

    const dispatch=useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category');

    const hobbyList=useSelector((state)=>state.hobbyList);
    const top3List=useSelector((state=>state.hobbyTop3List));

    //검색 텍스트, 필터링 목록
    const[searchText, setSearchText]=useState("");
    const[filterList,setFilterList]=useState([]);

    useEffect(() => {
        //취미 전체 조회
        if(category!=null){
            axios.get(`/hobby-board/${category}`)
                .then((response) => {
                    
                    dispatch(setHobbyCard(response.data.results.hobby));
                })
                .catch((error) => console.error(error));
        }else{
            axios.get('/hobby-board')
                .then((response) => {
                    
                    dispatch(setHobbyCard(response.data.results.hobby));
                })
                .catch((error) => console.error(error));

        }
        //취미 top3 조회
        axios.get('/hobby-board/top3')
        .then((response) => {
            dispatch(setHobbyTop3Card(response.data.results.hobby));
        })
        .catch((error) => console.error(error));
    }, [dispatch]);

    useEffect(() => {
        setFilterList(hobbyList);
    }, [hobbyList]);


    //취미 상세 후기 페이지 이동 이벤트
    const linkHobbyDetail = (hobbyNumber) => {
        navigate(`/hobby-detail/${hobbyNumber}`);
    }

       //취미 목록 새로고침
       const linkHobby=()=>{
        navigate(`/hobby-board`);
        navigate(0); 
    }

    //건의 사항 추가 페이지 이동
    const linkSuggestion=()=>{
        const token = getStoredToken();
        if (!token) {
            navigate('/login'); // 토큰이 없으면 로그인 페이지로 리다이렉트
        } else {
            navigate(`/suggestion`);
        }
    }


    //검색 버튼 클릭시 목록 필터링 이벤트
    const textSearch=(e)=>{
        e.preventDefault();

        const filtered=hobbyList.filter(item=>item.hobbyName.includes(searchText));
        setFilterList(filtered);
    }
    return (
        <div className={styles.page}>            
            <div className={styles.title}>👑 <span style={{ color: "#FF5391" }}>인기</span> TOP3</div>
            {category!=null&&(
                <button className={`${ctr.whiteBtn} ${ctr.mlAuto}`} onClick={() => linkHobby()}>전체보기</button>
            )}
            <div className={styles.top3List}>
                
            {top3List.map((item,index) => {
                return <HobbyCard key={index} hobby={item} linkHobbyDetail={linkHobbyDetail}/>
            })}
         
            </div>
            <hr />
            <form className={styles.searchBox} onSubmit={textSearch}>
                <input type="text" value={searchText} onChange={(e)=>setSearchText(e.target.value)} />
                <button type="submit" className={styles.searchButton}><FaSearch size={20}/></button>
            </form>

            {filterList.map((item,index)=>{
                return <HobbyList key={index} hobby={item} linkHobbyDetail={linkHobbyDetail}/>
            })}
            
            <button className={styles.suggestHobbyButton} onClick={linkSuggestion}>취미 추가 건의</button>
        </div>
    );
}

function HobbyCard({ hobby,linkHobbyDetail }){
    return(
        <div className={styles.top3} onClick={()=>linkHobbyDetail(hobby.hobbyNumber)}>
                    <img src={`/img/hobbyboard/${hobby.hobbyNumber}`} className={styles.top3Img} alt="농구" />
                    <div className={styles.top3Name}>{hobby.hobbyName}</div>
                    <div className={styles.th}>선호도 : {setPercentage(hobby.rating)}%</div>

                    <div className={styles.progressBarContainer}>
                        <div
                            className={styles.progressBar}
                            style={{ width: `${setPercentage(hobby.rating)}%` }}
                        ></div>
                    </div>
                </div>
    );
}


function HobbyList({hobby,linkHobbyDetail}){
    return(
        <>
        <div className={styles.hobbyList} onClick={()=>linkHobbyDetail(hobby.hobbyNumber)}>
        <img src={`/img/hobbyboard/${hobby.hobbyNumber}`} className={styles.hobbyImg} alt="축구" />
        <div>
            <div className={styles.hobbyName}>{hobby.hobbyName}</div>

            <div className={styles.thirdFont}>선호도 : {setPercentage(hobby.rating)}%</div>
            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBar}
                    style={{ width: `${setPercentage(hobby.rating)}%` }}
                ></div>
            </div>
            <div className={styles.hobbyDetail}>{hobby.hobbyExplain}</div>
        </div>
    </div>

    <button className={styles.suggestHobbyButton}>취미 추가 건의</button>
    </>
    );
}

function setPercentage(rating){
    
    return Math.ceil(rating*20);
}

export default HobbyBoardPost;
