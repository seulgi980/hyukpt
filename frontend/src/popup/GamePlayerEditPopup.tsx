import React, {useState} from "react";


export default function GamePlayerEditPopup({player, setPlayer, handleCloseButtonClick}: {
  player: string[],
  setPlayer: React.Dispatch<React.SetStateAction<string[]>>,
  handleCloseButtonClick: () => void
}) {

  const [tempPlayer, setTempPlayer] = useState<string[]>(player);
  const [newPlayer, setNewPlayer] = useState<string>('');


  const handleTempPlayerPlusInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // isComposing은 한글 입력 시 조합 중(ex: 'ㄷㅏ') Enter가 눌리는 것을 방지합니다.
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === 'Enter') {
      // form 태그 안에서 Enter를 누르면 기본적으로 페이지가 새로고침되는 현상을 방지
      e.preventDefault();

      handleTempPlayerPlusButtonClick();
    }
  };

  const handleTempPlayerPlusButtonClick = () => {
    const trimmedNewPlayer = newPlayer.trim();

    if (trimmedNewPlayer === '') {
      alert("선수 이름을 입력해주세요.");
      return;
    }

    if (tempPlayer.includes(trimmedNewPlayer)) {
      alert("이미 추가된 선수입니다.");
      return;
    }

    setTempPlayer(prevTempPlayer => [trimmedNewPlayer, ...prevTempPlayer]);
    setNewPlayer('');
  }

  const handleTempPlayerXButtonClick = (playerToRemove: string) => {
    setTempPlayer(prevTempPlayer =>
      prevTempPlayer.filter(p => p !== playerToRemove)
    );
  };

  const handleSaveButtonClick = () => {
    if (tempPlayer.length !== 10) {
      alert("10명의 선수를 입력해주세요.");
      return;
    }
    setPlayer(tempPlayer);
    handleCloseButtonClick();
  }


  const tempPlayerCard = tempPlayer.map(tp => {
    return (
      <div className="popup-body-box-player-card" key={tp}>
        <p>{tp}</p>
        <button type="button" onClick={() => handleTempPlayerXButtonClick(tp)}>
          <svg className="x" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M36 12L12 36M12 12L36 36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                  strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  });

  return (
    <div className="popup-wrapper">
      <div className="popup">
        <div className="popup-title-box">
          <p className="popup-title-box-title">선수 편집하기</p>
          <p className="popup-title-box-subtitle">그룹에 소속될 선수 편집하기</p>
        </div>
        <div className="popup-body-box">
          <div className="popup-body-box-summary-box">
            <p className="popup-body-box-summary-box-summary">{"현재 총 " + tempPlayer.length + "명"}</p>
          </div>
          <div className="popup-body-box-player-box popup-body-box-player-box-plus">
            {/*선수 편집 카드*/}
            {tempPlayer.length < 10 &&
              <label className="popup-body-box-player-card popup-body-box-player-card-plus" htmlFor="popup-edit-name">
                <input type="text" placeholder="선수 이름 입력" value={newPlayer} id="popup-edit-name"
                       onChange={e => setNewPlayer(e.target.value)}
                       onKeyDown={handleTempPlayerPlusInputKeyDown}/>
                <button type="button" onClick={handleTempPlayerPlusButtonClick}>
                  <svg className="plus" xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                       viewBox="0 0 48 48"
                       fill="none">
                    <path d="M24 10V38M10 24H38" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                          strokeLinejoin="round"/>
                  </svg>
                </button>
              </label>
            }
            {/*추가된 선수 카드*/}
            {tempPlayerCard}
          </div>
        </div>
        <div className="popup-footer">
          <div className="popup-footer-button-box">
            <button type="button" className="popup-footer-button-subtle" onClick={handleCloseButtonClick}>
              닫기
            </button>
            <button type="button" className="popup-footer-button-primary" onClick={handleSaveButtonClick}>
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
