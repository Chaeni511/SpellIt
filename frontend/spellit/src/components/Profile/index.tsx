import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from "@/utils/API"

import { UserType, DeckType } from '@/utils/Types';
import { Sound } from '@/store/music';

import playCountUp from '../../assets/profile/playCountUp.svg'
import playCountDown from '../../assets/profile/playCountDown.svg'
import editBtnImg from '@/assets/profile/editBtn.svg'
import passwordConfigImg from '@/assets/profile/passwordConfig.svg'
import closeBtn from '@/assets/ui/closeBtn.svg'
import homeBtnImg from '@/assets/ui/homeBtn.svg';

import PasswordConfig from './PasswordConfig';

import style from './Profile.module.css'
import Card from './Card';
import Modal from './Modal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';


const Profile = () => {
  const { id } = useParams();
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const korAttributes = ['바람', '물', '불', '땅', '빛', '어둠'];

  const me = useSelector((state: RootState) => state.user );

  const [user, setUser] = useState<UserType>({
    deck: [],
    email: 'string',
    exp: 0,
    gameCharacter: null,
    id: null,
    level: 0,
    nickname: '',
    playCount: 0,
    winCount: 0,
    loseCount: 0,
    drawCount: 0,
    profileMsg: '',
    isOnline: false,
  });

  const [hoveredCard, setHoveredCard] = useState<DeckType>(user.deck[0])

  const [openModalFlag, setOpenModalFlag] = useState<boolean>(false);
  const [modifyPasswordModal, setModifyPasswordModal] = useState<boolean>(false);
  const [modProp, setModProp] = useState<string>('');

  const [isMyProfile, setIsMyProfile] = useState<boolean>(false);

  
  const toHome = () => {
    navigate('/home');
  }

  const openModal = (modProp:string) => {
    setModProp(modProp);
    setOpenModalFlag(true);
  }
  const closeModal = () => {
    setOpenModalFlag(false);
  }
  const modifyMyInfo = (nickname: string, profileMsg:string) => {
    const tmpUser = user;
    tmpUser.nickname = nickname;
    tmpUser.profileMsg = profileMsg;
    setUser(tmpUser);
  }

  const openPassConfig = () => {
    setModifyPasswordModal(true);
  }
  const backToProfile = () => {
    setModifyPasswordModal(false);
  }
  const modifyPassword = () => {

  }

  useEffect(() => {
    API.get<any>(
      `member/info/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((res) => {
      // 수정 필요
      console.log(res.data)
      setUser(res.data)
      setHoveredCard(res.data.deck[0])
      return res.data;
    }).then((res) => {
      if (res.id === me.id) {
        setIsMyProfile(true);
      }
      console.log(res);
    })
    console.log(id)
  }, [])
  
  const cardInfo = (card :DeckType) => {
    setHoveredCard(card);
  }

  // Sound Effect
  const { cardFlip, cardFlipOpt } = Sound();
  const { buttonClick, buttonClickOpt } = Sound();


  return (
    <div>
      <div className={`${style.bg}`}>
        <button type="button" className={`${style.btn} ${style.homeBtn}`} onClick={() => {toHome();buttonClick();}}>
          <img src={homeBtnImg} alt="home"></img>
        </button> 
        {!modifyPasswordModal && <div className={`${style.myInfo}`}>
          <div className={`${style.sidebar}`}>
            <div className={`${style.selectedCharacter}`}>
              <button className={`${style.deckBtn} ${style.characterkBtn}`}>
                {user.gameCharacter && (
                  <img
                    src={require(`../../assets/character/${user.gameCharacter?.englishName}_portrait.png`)}
                    alt="portrait"
                  />
                )}
              </button>
            </div>
            <div className={`${style.userRecord}`}>
              <div className={`${style.playCount}`}>
                <img
                  className={`${style.playCountUp}`}
                  src={playCountUp}
                  alt="playCountUp.svg"
                />
                <div className={`${style.bigSize}`}>{user.playCount}</div>
                <div>플레이한 게임</div>
                <img
                  className={`${style.playCountDown}`}
                  src={playCountDown}
                  alt="playCountDown.svg"
                />
              </div>
              <div className={`${style.winRateDiv}`}>
                <div className={`${style.midSize}`}>
                  {user.playCount === 0 ? 0 : Math.round(user.winCount * 100 / user.playCount)}%
                </div>
                <div>승률</div>
              </div>
              <div className={`${style.winCountDiv}`}>
                <div>
                  <div className={`${style.midSize}`}>{user.winCount}</div>
                  <div>승</div>
                </div>
                <div>
                  <div className={`${style.midSize}`}>{user.loseCount}</div>
                  <div>패</div>
                </div>
                <div>
                  <div className={`${style.midSize}`}>{user.drawCount}</div>
                  <div>무</div>
                </div>
              </div>
            </div>
          </div>
          <div className={`${style.items}`}>
            <div className={`${style.container}`}>
              <div className={`${style.userTextContainer}`}>
                <div className={`${style.bigSize}`}>
                  {user.nickname}
                  {isMyProfile && <div
                    className={`${style.editBtn}`}
                  >
                    <img
                      className={`${style.editBtnImg}`}
                      src={editBtnImg}
                      alt="editBtn.svg"
                      onClick={(e) => {
                        openModal("nickname");
                        buttonClick();
                      }}
                    />
                  </div>}
                </div>
                <div className={`${style.smallSize}`}>
                  {user.profileMsg? <div>{user.profileMsg}</div>:<div>상태 메세지를 입력하세요.</div>}
                  {isMyProfile && <div
                    className={`${style.editBtn}`}
                  >
                    <img
                      className={`${style.editBtnImg}`}
                      src={editBtnImg}
                      alt="editBtn.svg"
                      onClick={(e) => {
                        openModal("profileMsg");
                        buttonClick();
                      }}
                    />
                  </div>}
                </div>
                {isMyProfile && <div className={`${style.passWordConfigBtnDiv}`} onClick={()=>{openPassConfig(); buttonClick();}}>
                  <img src={passwordConfigImg} alt='password config'></img>
                </div>}
              </div>
              <div className={`${style.infoRow}`}>
                <div className={`${style.infoTitle}`}>덱</div>
                <div className={`${style.deckDiv}`}>
                  {/* 반복문 카드 뿌리기 */}
                  {user.deck.map((card: DeckType, index: number) => (
                    <div
                      key={index}
                      onMouseOver={(e) => cardInfo(card)}
                      className={`${style.cardContainer}`}
                      onMouseEnter={() => cardFlip()} onMouseLeave={() => cardFlipOpt.stop()}
                    >
                      <Card key={index} card={card.code} />
                    </div>
                  ))}
                </div>
              </div>
              {hoveredCard && <>
                <div className={`${style.infoRow}`}>
                  <div className={`${style.infoTitle}`}>마법명</div>
                  <div className={`${style.cardTitle}`}>{hoveredCard?.title}</div>
                </div>
                <div className={`${style.infoRow}`}>
                  <div className={`${style.infoTitle}`}>마법주문</div>
                  <div className={`${style.cardInfo} ${style.cardInfoTitle}`}>
                    {hoveredCard?.spell}
                  </div>
                </div>
                <div className={`${style.infoRow}`}>
                  <div className={`${style.infoTitle}`}>피해량</div>
                  <div className={`${style.cardInfo}`}>{hoveredCard?.damage}</div>
                </div>
                <div className={`${style.infoRow}`}>
                  <div className={`${style.infoTitle}`}>마나 소모</div>
                  <div className={`${style.cardInfo}`}>
                    {hoveredCard?.cost} cost
                  </div>
                </div>
                <div className={`${style.infoRow}`}>
                  <div className={`${style.infoTitle}`}>속성</div>
                  <div className={`${style.cardInfo}`}>
                    {korAttributes[hoveredCard?.attribute]}
                  </div>
                </div>
              </>}
            </div>
          </div>
        </div>}
        {modifyPasswordModal && <PasswordConfig backToProfile={backToProfile} user={user}></PasswordConfig>}
      </div>
      {openModalFlag && (
        <Modal
          closeModal={closeModal}
          user={user}
          modProp={modProp}
          modifyMyInfo={modifyMyInfo}
        ></Modal>
      )}
    </div>
  );
};
export default Profile;
