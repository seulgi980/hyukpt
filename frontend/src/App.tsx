import teemoCover from './assets/teemo.webp'
import './App.css'
import React, {Fragment, useEffect, useState} from "react";
import GamePlayerEditPopup from "./popup/GamePlayerEditPopup.tsx";
import GameRuleEditPopup, {
  type MustBeDifferentTeamPairType,
  type MustBeSameTeamGroupType,
  type PlayerPreferPositionType,
} from "./popup/GameRuleEditPopup.tsx";
import {KOREAN_PREFER_POSITION_MAP} from "./popup/preferPosition.ts";
import type {GameResult} from "./popup/GameResultPopup.tsx";
import GameResultPopup from "./popup/GameResultPopup.tsx";

function DeleteIconButton({handleClick}: { handleClick: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button type="button" onClick={handleClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <g clipPath="url(#clip0_18_557)">
          <path
            d="M24.0007 12L16.0007 20M16.0007 12L24.0007 20M28.0007 5.33333H10.6673L1.33398 16L10.6673 26.6667H28.0007C28.7079 26.6667 29.3862 26.3857 29.8863 25.8856C30.3864 25.3855 30.6673 24.7072 30.6673 24V7.99999C30.6673 7.29275 30.3864 6.61447 29.8863 6.11438C29.3862 5.61428 28.7079 5.33333 28.0007 5.33333Z"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
          <clipPath id="clip0_18_557">
            <rect width="32" height="32" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

function GamePlayerListBoxCard({title}: { title: string }) {
  return (
    <div className="game-player-list-box-card">
      <span>
        {title}
      </span>
    </div>
  );
}

type PopUpStatusType = 'close' | 'player' | 'rule' | 'result';


function App() {

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [popUpStatus, setPopUpStatus] = useState<PopUpStatusType>('close');
  const [player, setPlayer] = useState<string[]>(["muleo",
    "광주비주얼",
    "은 혁",
    "전설이 될 남자",
    "뜨거운멜론",
    "반응속도할아버지",
    "건재 그 자체",
    "인 천 마 인 부 우",
    "세트메뉴3번",
    "의랄라",]);
  const [mustBeSameTeamGroups, setMustBeSameTeamGroups] = useState<MustBeSameTeamGroupType[]>([]);
  const [mustBeDifferentTeamPairs, setMustBeDifferentTeamPairs] = useState<MustBeDifferentTeamPairType[]>([]);
  const [preferPositions, setPreferPositions] = useState<PlayerPreferPositionType[]>([]);

  const gameResult: GameResult = {
    top1: player[0],
    jg1: player[1],
    mid1: player[2],
    ad1: player[3],
    sup1: player[4],
    top2: player[5],
    jg2: player[6],
    mid2: player[7],
    ad2: player[8],
    sup2: player[9],
  }

  function handleAddMustBeSameTeamGroupsRuleClick(mustBeSameTeamGroup: MustBeSameTeamGroupType): void {
    // ★ 중요: 새로 추가할 그룹의 배열을 미리 정렬합니다.
    const sortedGroup = [...mustBeSameTeamGroup.group].sort();
    const newGroupSignature = sortedGroup.join(',');
    const isDuplicate = mustBeSameTeamGroups.some(existingGroup => {
      // ★ 중요: 기존 그룹은 이미 정렬되어 있으므로 sort()를 생략합니다.
      const existingGroupSignature = existingGroup.group.join(',');
      return existingGroupSignature === newGroupSignature;
    });

    // 중복이 아니면 정렬된 버전의 객체를 state에 추가합니다.
    if (!isDuplicate) {
      const newItemGroup = {
        ...mustBeSameTeamGroup,
        group: sortedGroup // 정렬된 배열을 저장
      };
      setMustBeSameTeamGroups([...mustBeSameTeamGroups, newItemGroup]);
    }
  }

  function handleAddMustBeDifferentTeamPairsClick(mustBeDifferentTeamPair: MustBeDifferentTeamPairType): void {
    // ★ 중요: 새로 추가할 그룹의 배열을 미리 정렬합니다.
    const sortedPair = [...mustBeDifferentTeamPair.pair].sort();
    const newPairSignature = sortedPair.join(',');
    const isDuplicate = mustBeDifferentTeamPairs.some(existingPair => {
      // ★ 중요: 기존 그룹은 이미 정렬되어 있으므로 sort()를 생략합니다.
      const existingPairSignature = existingPair.pair.join(',');
      return existingPairSignature === newPairSignature;
    });

    // 중복이 아니면 정렬된 버전의 객체를 state에 추가합니다.
    if (!isDuplicate) {
      const newItemPair = {
        ...mustBeDifferentTeamPair,
        pair: sortedPair // 정렬된 배열을 저장
      };
      setMustBeDifferentTeamPairs([...mustBeDifferentTeamPairs, newItemPair]);
    }
  }

  function handleAddPreferPositionsClick(preferPosition: PlayerPreferPositionType): void {
    const isDuplicate = preferPositions.some(pp => pp.name === preferPosition.name);
    // 중복이면 교체
    if (isDuplicate) {
      setPreferPositions(preferPositions.map(pp => {
        if (pp.name === preferPosition.name) {
          return preferPosition;
        } else {
          return pp;
        }
      }));
    } else {
      setPreferPositions([
        ...preferPositions,
        preferPosition
      ]);
    }

  }

  function handleThemeButtonClick(): void {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }

  function handlePlayerPopupButtonClick(): void {
    setPopUpStatus('player');
  }

  function handleRulePopupButtonClick(): void {
    setPopUpStatus('rule');
  }

  function handleResultPopupButtonClick(): void {

    // 검증 로직
    if (mustBeSameTeamGroups.some(mbstgs => mbstgs.group.some(mbstg => !player.includes(mbstg)))) {
      alert('같은 팀 규칙의 선수가 올바르지 않습니다.');
      return;
    }
    if (mustBeDifferentTeamPairs.some(mbdtps => mbdtps.pair.some(mbdtp => !player.includes(mbdtp)))) {
      alert('다른 팀 규칙의 선수가 올바르지 않습니다.');
      return;
    }
    // preferPositions
    if (preferPositions.some(pps => !player.includes(pps.name))) {
      alert('포지션 고정 규칙의 선수가 올바르지 않습니다.');
      return;
    }

    setPopUpStatus('result');
  }

  function handleMustBeSameTeamGroupDeleteButtonClick(mustBeSameTeamGroupId: string) {
    setMustBeSameTeamGroups(
      mustBeSameTeamGroups.filter(mbstg => mbstg.id !== mustBeSameTeamGroupId)
    );
  }

  function handleMustBeDifferentTeamPairDeleteButtonClick(mustBeDifferentTeamPairId: string) {
    setMustBeDifferentTeamPairs(
      mustBeDifferentTeamPairs.filter(mbdtp => mbdtp.id !== mustBeDifferentTeamPairId)
    );
  }

  function handlePreferPositionDeleteButtonClick(preferPositionId: string) {
    setPreferPositions(
      preferPositions.filter(pp => pp.id !== preferPositionId)
    );
  }

  // 초기 테마: 시스템 설정
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 초기 설정
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    // 변경 감지 리스너
    const listener = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', listener);

    // 클린업
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };

  }, []);

  // 테마 변경 시 <html data-theme="..." />에 반영
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // popUpStatus 가 변경될 때마다 실행
  useEffect(() => {
    const header = document.querySelector('.header');

    if (popUpStatus !== 'close') {
      // 1. 현재 스크롤바의 너비를 계산합니다.
      //    (전체 창 너비 - 스크롤바를 제외한 컨텐츠 너비)
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // 2. 계산된 너비를 CSS 변수('--scrollbar-width')로 설정합니다.
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

      // 3. body에 클래스를 추가하여 CSS를 활성화합니다.
      document.body.classList.add('popup-open');
      if (header) {
        header.classList.add('popup-open');
      }
    } else {
      // 팝업이 닫히면 클래스를 제거합니다.
      document.body.classList.remove('popup-open');
      if (header) {
        header.classList.remove('popup-open');
      }
    }

    // 컴포넌트가 언마운트될 때를 대비한 정리(cleanup) 함수입니다.
    // 예: 다른 페이지로 이동 시 스크롤 잠금 상태가 남지 않도록 보장합니다.
    return () => {
      document.body.classList.remove('popup-open');
    };
  }, [popUpStatus]);


  const gamePlayerList = player.map(value =>
    <GamePlayerListBoxCard key={value} title={value}/>
  )

  return (
    <>
      <div className="header">
        <div className="header-box">
          <button type="button" className="header-theme-button" onClick={handleThemeButtonClick}>
            {
              theme === 'light' ?
                (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <g clipPath="url(#clip0_42_87)">
                      <path
                        d="M16.0007 1.33337V4.00004M16.0007 28V30.6667M5.62732 5.62671L7.52065 7.52004M24.4807 24.48L26.374 26.3734M1.33398 16H4.00065M28.0007 16H30.6673M5.62732 26.3734L7.52065 24.48M24.4807 7.52004L26.374 5.62671M22.6673 16C22.6673 19.6819 19.6825 22.6667 16.0007 22.6667C12.3188 22.6667 9.33398 19.6819 9.33398 16C9.33398 12.3181 12.3188 9.33337 16.0007 9.33337C19.6825 9.33337 22.6673 12.3181 22.6673 16Z"
                        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_42_87">
                        <rect width="32" height="32" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                )
                :
                (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M27.9999 17.0533C27.7901 19.3229 26.9383 21.4859 25.5442 23.2891C24.15 25.0922 22.2712 26.4611 20.1275 27.2354C17.9838 28.0097 15.6638 28.1575 13.4392 27.6615C11.2146 27.1654 9.17719 26.0461 7.5655 24.4344C5.95381 22.8227 4.83445 20.7853 4.33841 18.5607C3.84237 16.336 3.99016 14.0161 4.76448 11.8724C5.53881 9.72868 6.90764 7.84982 8.71082 6.45567C10.514 5.06152 12.6769 4.20974 14.9465 4C13.6178 5.79769 12.9783 8.0126 13.1446 10.2419C13.3108 12.4712 14.2717 14.5667 15.8524 16.1475C17.4331 17.7282 19.5287 18.689 21.758 18.8553C23.9873 19.0215 26.2022 18.3821 27.9999 17.0533Z"
                      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
            }
          </button>
        </div>
      </div>
      <img src={teemoCover} alt="티모" className="teemo-cover"/>
      <div className="main-box">
        {/*선수 목록 박스*/}
        <div className="game-player-box">
          {/*선수 목록 제목 박스*/}
          <div className="game-player-title-box">
            <p className="game-player-title-box-title">
              선수
            </p>
            <button type="button" className="game-player-title-box-button" onClick={handlePlayerPopupButtonClick}>
              <svg className="game-player-title-box-button-icon" width="32" height="32" viewBox="0 0 32 32" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.6673 28V25.3333C22.6673 23.9188 22.1054 22.5623 21.1052 21.5621C20.105 20.5619 18.7485 20 17.334 20H6.66732C5.25283 20 3.89628 20.5619 2.89608 21.5621C1.89589 22.5623 1.33398 23.9188 1.33398 25.3333V28M30.6673 28V25.3333C30.6664 24.1516 30.2731 23.0037 29.5491 22.0698C28.8251 21.1358 27.8115 20.4688 26.6673 20.1733M21.334 4.17333C22.4812 4.46707 23.498 5.13427 24.2242 6.06975C24.9503 7.00523 25.3444 8.15577 25.3444 9.34C25.3444 10.5242 24.9503 11.6748 24.2242 12.6103C23.498 13.5457 22.4812 14.2129 21.334 14.5067M17.334 9.33333C17.334 12.2789 14.9462 14.6667 12.0007 14.6667C9.05513 14.6667 6.66732 12.2789 6.66732 9.33333C6.66732 6.38781 9.05513 4 12.0007 4C14.9462 4 17.334 6.38781 17.334 9.33333Z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="game-player-title-box-button-text">
                편집
              </p>
            </button>
          </div>
          {/*선수 목록 리스트 박스*/}
          <div className="game-player-list-box">
            {gamePlayerList}
          </div>
        </div>
        {/*규칙 목록 박스*/}
        <div className="game-rule-box">
          {/*규칙 목록 제목 박스*/}
          <div className="game-player-title-box">
            <p className="game-player-title-box-title">
              규칙
            </p>
            <button type="button" className="game-player-title-box-button" onClick={handleRulePopupButtonClick}>
              <svg className="game-player-title-box-button-icon" width="32" height="32" viewBox="0 0 32 32" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14.666 5.33331H5.33268C4.62544 5.33331 3.94716 5.61426 3.44706 6.11436C2.94697 6.61446 2.66602 7.29273 2.66602 7.99998V26.6666C2.66602 27.3739 2.94697 28.0522 3.44706 28.5523C3.94716 29.0524 4.62544 29.3333 5.33268 29.3333H23.9993C24.7066 29.3333 25.3849 29.0524 25.885 28.5523C26.3851 28.0522 26.666 27.3739 26.666 26.6666V17.3333M24.666 3.33331C25.1964 2.80288 25.9159 2.50488 26.666 2.50488C27.4162 2.50488 28.1356 2.80288 28.666 3.33331C29.1964 3.86374 29.4944 4.58316 29.4944 5.33331C29.4944 6.08346 29.1964 6.80288 28.666 7.33331L15.9993 20L10.666 21.3333L11.9993 16L24.666 3.33331Z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="game-player-title-box-button-text">
                추가
              </p>
            </button>
          </div>
          {/*규칙 목록 리스트 박스*/}
          <div className="game-rule-list-box">
            {
              mustBeSameTeamGroups.length > 0 &&
              <div className="game-rule-list-box-title">
                <span>같은 팀 규칙</span>
              </div>
            }
            {
              mustBeSameTeamGroups.map(mbstg => {
                return (
                  <div key={mbstg.id} className="game-rule-list-box-body-box">
                    <span>총 {mbstg.group.length}명. {mbstg.group.map((name, i) => <Fragment key={name}>{i != 0 && ', '}
                      <span
                        className={player.includes(name) ? "set" : "unset"}>{name}</span></Fragment>)} 는 같은 팀이 됩니다.</span>
                    <DeleteIconButton handleClick={() => handleMustBeSameTeamGroupDeleteButtonClick(mbstg.id)}/>
                  </div>
                );
              })
            }
            {
              mustBeDifferentTeamPairs.length > 0 &&
              <div className="game-rule-list-box-title">
                <span>다른 팀 규칙</span>
              </div>
            }
            {
              mustBeDifferentTeamPairs.map(mbdtg => {
                return (
                  <div key={mbdtg.id} className="game-rule-list-box-body-box">
                    <span>총 {mbdtg.pair.length}명. {mbdtg.pair.map((name, i) => <Fragment key={name}>{i != 0 && ', '}
                      <span
                        className={player.includes(name) ? "set" : "unset"}>{name}</span></Fragment>)} 는 다른 팀이 됩니다.</span>
                    <DeleteIconButton handleClick={() => handleMustBeDifferentTeamPairDeleteButtonClick(mbdtg.id)}/>
                  </div>
                );
              })
            }
            {
              preferPositions.length > 0 &&
              <div className="game-rule-list-box-title">
                <span>포지션 고정 규칙</span>
              </div>
            }
            {
              preferPositions.map(pp => {
                return (
                  <div key={pp.id} className="game-rule-list-box-body-box">
                    <span>
                      {
                        <span className={player.includes(pp.name) ? "set" : "unset"}>{pp.name}</span>
                      }은 {
                      pp.prefer.map((ppt, i) => <Fragment key={ppt}>{i != 0 && ', '}<span
                        className="set">{KOREAN_PREFER_POSITION_MAP[ppt]}</span></Fragment>)
                    } 에 고정됩니다.
                    </span>
                    <DeleteIconButton handleClick={() => handlePreferPositionDeleteButtonClick(pp.id)}/>
                  </div>
                );
              })
            }
          </div>
        </div>
        {/*버튼*/}
        <button type="button" className="random-button" onClick={handleResultPopupButtonClick}>
          <svg className="random-button-icon" xmlns="http://www.w3.org/2000/svg" width="26" height="32"
               viewBox="0 0 26 32" fill="none">
            <path
              d="M19.6667 1.5L25 6.77273M25 6.77273L19.6667 12.0455M25 6.77273L6.33333 6.77273C4.91885 6.77273 3.56229 7.32825 2.5621 8.31707C1.5619 9.3059 1 10.647 1 12.0455V14.6818M6.33333 30.5L1 25.2273M1 25.2273L6.33333 19.9545M1 25.2273L19.6667 25.2273C21.0812 25.2273 22.4377 24.6718 23.4379 23.6829C24.4381 22.6941 25 21.353 25 19.9545V17.3182"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="game-player-title-box-button-text">
            랜덤 팀 돌리기
          </p>
        </button>
        {/*  메인 박스 끝*/}
      </div>
      {popUpStatus === 'player' &&
        <GamePlayerEditPopup player={player} setPlayer={setPlayer}
                             handleCloseButtonClick={() => setPopUpStatus('close')}/>}
      {popUpStatus === 'rule' &&
        <GameRuleEditPopup
          player={player}
          handleAddMustBeSameTeamGroupsRuleClick={handleAddMustBeSameTeamGroupsRuleClick}
          handleAddMustBeDifferentTeamPairsClick={handleAddMustBeDifferentTeamPairsClick}
          handleAddPreferPositionsClick={handleAddPreferPositionsClick}
          handleCloseButtonClick={() => setPopUpStatus('close')}/>}

      {popUpStatus === 'result' &&
        <GameResultPopup
          gameResult={gameResult}
          handleCloseButtonClick={() => setPopUpStatus('close')}/>}
    </>
  )
}

export default App
