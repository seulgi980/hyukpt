import React, {useCallback, useEffect, useState} from "react";
import {useImmer} from "use-immer";
import {KOREAN_PREFER_POSITION_MAP, POSITION_ORDER, type PreferPositionType} from "./preferPosition.ts";


export interface MustBeSameTeamGroupType {
  id: string;
  group: string[];
}

export interface MustBeDifferentTeamPairType {
  id: string;
  pair: string[];
}


export interface PlayerPreferPositionType {
  id: string;
  name: string;
  prefer: PreferPositionType[];
}

type RuleType = 'same' | 'different' | 'prefer';

interface DraggingOverType {
  same: boolean;
  dif1: boolean;
  dif2: boolean;
  posi: boolean;
}

export default function GameRuleEditPopup(
  {
    player,
    handleAddMustBeSameTeamGroupsRuleClick,
    handleAddMustBeDifferentTeamPairsClick,
    handleAddPreferPositionsClick,
    handleCloseButtonClick
  }: {
    player: string[],
    handleAddMustBeSameTeamGroupsRuleClick: (mustBeSameTeamGroup: MustBeSameTeamGroupType) => void;
    handleAddMustBeDifferentTeamPairsClick: (mustBeDifferentTeamPair: MustBeDifferentTeamPairType) => void;
    handleAddPreferPositionsClick: (preferPosition: PlayerPreferPositionType) => void;
    handleCloseButtonClick: () => void
  }
) {

  const [ruleStatus, setRuleStatus] = useState<RuleType>('same');
  const [mustBeSameTeamGroup, setMustBeSameTeamGroup] = useState<string[]>([]);
  const [mustBeDifferentTeamPair, setMustBeDifferentTeamPair] = useState<string[]>(['', '']);
  const [preferPosition, updatePreferPosition] = useImmer<PlayerPreferPositionType | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<DraggingOverType>({
    same: false,
    dif1: false,
    dif2: false,
    posi: false
  });

  const handleAddButtonClick = useCallback(() => {
    if (ruleStatus === 'same') {
      if (mustBeSameTeamGroup.length === 1) {
        alert("같은 팀 규칙은 최소 2명입니다.");
        return;
      }
      if (mustBeSameTeamGroup.length > 0) {
        handleAddMustBeSameTeamGroupsRuleClick(
          {
            id: crypto.randomUUID(),
            group: mustBeSameTeamGroup
          }
        );
      }
    } else if (ruleStatus === 'different') {
      const dif1 = mustBeDifferentTeamPair[0];
      const dif2 = mustBeDifferentTeamPair[1];
      if (dif1 === '' || dif2 === '') {
        alert("다른 팀 규칙은 2명 이여야 합니다.");
        return;
      }
      handleAddMustBeDifferentTeamPairsClick(
        {
          id: crypto.randomUUID(),
          pair: mustBeDifferentTeamPair
        }
      );
    } else if (ruleStatus === 'prefer') {
      if (!(preferPosition)) {
        alert('포지션 고정 규칙은 최소 1명입니다.')
        return;
      }
      if (!(preferPosition.prefer.length > 0)) {
        alert('최소 1개의 포지션이 필요합니다.')
        return;
      }
      handleAddPreferPositionsClick(preferPosition);
    }
    handleCloseButtonClick();
  }, [ruleStatus, mustBeSameTeamGroup, handleAddMustBeSameTeamGroupsRuleClick, mustBeDifferentTeamPair, handleAddMustBeDifferentTeamPairsClick, preferPosition, handleAddPreferPositionsClick, handleCloseButtonClick])

  // 규칙 변경 시 마다 다른 상태 초기화
  useEffect(() => {
    setMustBeSameTeamGroup([]);
    setMustBeDifferentTeamPair(['', '']);
    updatePreferPosition(null);
    setIsDraggingOver({
      same: false,
      dif1: false,
      dif2: false,
      posi: false
    });
  }, [ruleStatus, updatePreferPosition]);

  useEffect(() => {
    // 키보드 이벤트의 타입을 명시합니다 (KeyboardEvent).
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        handleCloseButtonClick();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleAddButtonClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseButtonClick, handleAddButtonClick]);

  function isPlayerSet(p: string) {
    if (ruleStatus === 'same') {
      return mustBeSameTeamGroup.includes(p);
    }
    if (ruleStatus === 'different') {
      return mustBeDifferentTeamPair.includes(p);
    }
    if (ruleStatus === 'prefer') {
      if (preferPosition) {
        return preferPosition.name === p;
      } else {
        return false;
      }
    }
  }

  function handlePlayerClick(player: string) {
    if (ruleStatus === 'same') {
      if (mustBeSameTeamGroup.length === 5) {
        alert('같은 팀 규칙은 총 5명까지 가능합니다.')
        return;
      }
      if (mustBeSameTeamGroup.includes(player)) {
        alert('이미 추가된 선수입니다.')
        return;
      }
      setMustBeSameTeamGroup([
        ...mustBeSameTeamGroup,
        player
      ]);
      return;
    } else if (ruleStatus === 'different') {
      const dif1 = mustBeDifferentTeamPair[0];
      const dif2 = mustBeDifferentTeamPair[1];
      if (dif1 !== '' && dif2 !== '') {
        alert('다른 팀 규칙은 총 2명까지 가능합니다.')
        return;
      }
      if (dif1 === player || dif2 === player) {
        alert('이미 추가된 선수입니다.')
        return;
      }
      if (dif1 === '') {
        setMustBeDifferentTeamPair(
          mustBeDifferentTeamPair.map((mbdtp, i) => {
            if (i === 0) {
              return player;
            } else {
              return mbdtp;
            }
          })
        )
        return;
      }
      if (dif2 == '') {
        setMustBeDifferentTeamPair(
          mustBeDifferentTeamPair.map((mbdtp, i) => {
            if (i === 1) {
              return player;
            } else {
              return mbdtp;
            }
          })
        )
        return;
      }
    } else if (ruleStatus === 'prefer') {
      updatePreferPosition({
        id: crypto.randomUUID(),
        name: player,
        prefer: []
      });
      return;
    }
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, player: string) {
    e.dataTransfer.setData("application/json", player);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>, type: string) {
    e.preventDefault();
    setIsDraggingOver({
      ...isDraggingOver,
      [type]: false
    });
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>, type: string) {
    e.preventDefault();
    setIsDraggingOver({
      ...isDraggingOver,
      [type]: true
    });
  }

  function handleSameDrop(e: React.DragEvent<HTMLDivElement>, type: string) {
    e.preventDefault();
    setIsDraggingOver({
      ...isDraggingOver,
      [type]: false
    });
    const player = e.dataTransfer.getData("application/json");
    if (mustBeSameTeamGroup.length === 5) {
      alert('같은 팀 규칙은 총 5명까지 가능합니다.')
      return;
    }
    if (mustBeSameTeamGroup.includes(player)) {
      alert('이미 추가된 선수입니다.')
      return;
    }
    setMustBeSameTeamGroup([
      ...mustBeSameTeamGroup,
      player
    ]);
  }

  function handleDifferentDrop(e: React.DragEvent<HTMLDivElement>, type: string) {
    e.preventDefault();
    setIsDraggingOver({
      ...isDraggingOver,
      [type]: false
    });
    const player = e.dataTransfer.getData("application/json");

    const index = (type === 'dif1') ? 0 : 1;

    setMustBeDifferentTeamPair(
      mustBeDifferentTeamPair.map((mbdtp, i) => {
        if (i === index) {
          return player;
        } else {
          return mbdtp;
        }
      })
    );
  }

  function handlePreferDrop(e: React.DragEvent<HTMLDivElement>, type: string) {
    e.preventDefault();
    setIsDraggingOver({
      ...isDraggingOver,
      [type]: false
    });
    const player = e.dataTransfer.getData("application/json");
    updatePreferPosition({
      id: crypto.randomUUID(),
      name: player,
      prefer: []
    })
  }

  function handleMustBeSameTeamGroupXButtonClick(player: string) {
    setMustBeSameTeamGroup(
      mustBeSameTeamGroup.filter(mbstg => mbstg !== player)
    );
  }

  function handleMustBeDifferentTeamPairXButtonClick(playerIndex: number) {
    setMustBeDifferentTeamPair(
      mustBeDifferentTeamPair.map((mbdtp, i) => {
        if (i === playerIndex) {
          return '';
        } else {
          return mbdtp;
        }
      })
    );
  }

  function handlePreferPositionXButtonClick() {
    updatePreferPosition(null);
  }


  function handlePositionIconClick(ppt: PreferPositionType) {
    if (preferPosition) {
      if (preferPosition.prefer.includes(ppt)) {
        updatePreferPosition(draft => {
            if (draft) {
              const index = draft.prefer.indexOf(ppt);
              if (index > -1) {
                draft.prefer.splice(index, 1);
              }
            }
          }
        );
      } else {
        updatePreferPosition(draft => {
            if (draft) {
              draft.prefer.push(ppt);
              draft.prefer.sort((a, b) => {
                return POSITION_ORDER.indexOf(a) - POSITION_ORDER.indexOf(b);
              });
            }
          }
        );
      }
    }
  }

  return (
    <div className="popup-wrapper">
      <div className="popup">
        <div className="popup-title-box">
          <p className="popup-title-box-title">규칙 편집하기</p>
          <p className="popup-title-box-subtitle">팀 생성에 적용될 여러가지 규칙을 설정하기</p>
        </div>
        <div className="popup-body-box-tab-box">
          <div
            className={ruleStatus === 'same' ? "popup-body-box-tab-box-tab-default" : "popup-body-box-tab-box-tab-tertiary"}
            onClick={() => setRuleStatus('same')}>
            <p className='no-text-drag'>같은 팀 규칙</p>
          </div>
          <div
            className={ruleStatus === 'different' ? "popup-body-box-tab-box-tab-default" : "popup-body-box-tab-box-tab-tertiary"}
            onClick={() => setRuleStatus('different')}>
            <p className='no-text-drag'>다른 팀 규칙</p>
          </div>
          <div
            className={ruleStatus === 'prefer' ? "popup-body-box-tab-box-tab-default" : "popup-body-box-tab-box-tab-tertiary"}
            onClick={() => setRuleStatus('prefer')}>
            <p className='no-text-drag'>포지션 고정 규칙</p>
          </div>
        </div>
        <div className="popup-body-box-player-list-box">
          {
            player.map(p => {
              return (
                <div
                  key={p}
                  className="popup-body-box-player-list-box-player"
                  draggable="true"
                  onClick={() => handlePlayerClick(p)}
                  onDragStart={(e) => handleDragStart(e, p)}
                >
                  <svg
                    className={isPlayerSet(p) ? "set" : "unset"}
                    xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                    <path
                      d="M10 11.3333C10.4602 11.3333 10.8333 10.9602 10.8333 10.5C10.8333 10.0398 10.4602 9.66668 10 9.66668C9.53977 9.66668 9.16667 10.0398 9.16667 10.5C9.16667 10.9602 9.53977 11.3333 10 11.3333Z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path
                      d="M10 5.50001C10.4602 5.50001 10.8333 5.12691 10.8333 4.66668C10.8333 4.20644 10.4602 3.83334 10 3.83334C9.53977 3.83334 9.16667 4.20644 9.16667 4.66668C9.16667 5.12691 9.53977 5.50001 10 5.50001Z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path
                      d="M10 17.1667C10.4602 17.1667 10.8333 16.7936 10.8333 16.3333C10.8333 15.8731 10.4602 15.5 10 15.5C9.53977 15.5 9.16667 15.8731 9.16667 16.3333C9.16667 16.7936 9.53977 17.1667 10 17.1667Z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="no-text-drag">{p}</p>
                </div>
              );
            })
          }
        </div>
        <div className="popup-body-box-result-box">
          <p className="popup-body-box-result-box-title">
            {
              ruleStatus === 'same' &&
              (mustBeSameTeamGroup.length === 0
                  ? "클릭 또는 아래에 드롭하세요"
                  : `총 ${mustBeSameTeamGroup.length}명. ${mustBeSameTeamGroup.map(name => `“${name}”`).join(', ')} 는 같은 팀이 됩니다.`
              )
            }
            {
              ruleStatus === 'different' &&
              (
                mustBeDifferentTeamPair.length === 0
                  ? "클릭 또는 아래에 드롭하세요"
                  : `총 ${mustBeDifferentTeamPair.length}명. ${mustBeDifferentTeamPair.map(name => `“${name}”`).join(', ')} 는 다른 팀이 됩니다.`
              )
            }
            {
              ruleStatus === 'prefer' &&
              (
                preferPosition
                  ? (
                    preferPosition.prefer.length > 0
                      ? `“${preferPosition.name}” 은 ${preferPosition.prefer.map(ppt => `“${KOREAN_PREFER_POSITION_MAP[ppt]}”`).join(', ')} 에  고정됩니다.`
                      : `"${preferPosition.name}" 의 고정 포지션을 선택해주세요`
                  )
                  : "클릭 또는 아래에 드롭하세요"
              )
            }
          </p>
          {
            ruleStatus === 'same' &&
            <div className="popup-body-box-result-box-making-box-same">
              <div
                className={`popup-body-box-result-box-making-box-same-cloud-card ${isDraggingOver.same ? 'drag-over' : ''}`}
                onDragEnter={(e) => handleDragEnter(e, 'same')}
                onDragLeave={(e) => handleDragLeave(e, 'same')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleSameDrop(e, 'same')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <g clipPath="url(#clip0_18_704)">
                    <path
                      d="M32 32L24 24M24 24L16 32M24 24V42M40.78 36.78C42.7307 35.7165 44.2717 34.0338 45.1597 31.9972C46.0478 29.9607 46.2324 27.6865 45.6844 25.5334C45.1364 23.3803 43.887 21.471 42.1333 20.1069C40.3797 18.7428 38.2217 18.0015 36 18H33.48C32.8746 15.6585 31.7463 13.4847 30.1799 11.642C28.6135 9.7993 26.6497 8.3357 24.4362 7.36121C22.2227 6.38673 19.8171 5.92672 17.4002 6.01576C14.9834 6.10481 12.6181 6.7406 10.4824 7.87533C8.34657 9.01006 6.49582 10.6142 5.06924 12.5672C3.64266 14.5201 2.67738 16.7711 2.24596 19.1508C1.81454 21.5305 1.92821 23.9771 2.57842 26.3065C3.22864 28.636 4.39848 30.7877 6 32.6"
                      stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_18_704">
                      <rect width="48" height="48" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              {
                mustBeSameTeamGroup.map(mbstg => {
                  return (
                    <div key={mbstg} className="popup-body-box-result-box-making-box-same-card">
                      <p>{mbstg}</p>
                      <button type="button" onClick={() => handleMustBeSameTeamGroupXButtonClick(mbstg)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                          <path d="M36 12L12 36M12 12L36 36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                                strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  );
                })
              }
            </div>
          }
          {
            ruleStatus === 'different' &&
            <div className="popup-body-box-result-box-making-box-same">
              {/*dif1*/}
              {
                mustBeDifferentTeamPair[0] === ''
                  ?
                  <div
                    className={`popup-body-box-result-box-making-box-same-cloud-card ${isDraggingOver.dif1 ? 'drag-over' : ''}`}
                    onDragEnter={(e) => handleDragEnter(e, 'dif1')}
                    onDragLeave={(e) => handleDragLeave(e, 'dif1')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDifferentDrop(e, 'dif1')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <g clipPath="url(#clip0_18_704)">
                        <path
                          d="M32 32L24 24M24 24L16 32M24 24V42M40.78 36.78C42.7307 35.7165 44.2717 34.0338 45.1597 31.9972C46.0478 29.9607 46.2324 27.6865 45.6844 25.5334C45.1364 23.3803 43.887 21.471 42.1333 20.1069C40.3797 18.7428 38.2217 18.0015 36 18H33.48C32.8746 15.6585 31.7463 13.4847 30.1799 11.642C28.6135 9.7993 26.6497 8.3357 24.4362 7.36121C22.2227 6.38673 19.8171 5.92672 17.4002 6.01576C14.9834 6.10481 12.6181 6.7406 10.4824 7.87533C8.34657 9.01006 6.49582 10.6142 5.06924 12.5672C3.64266 14.5201 2.67738 16.7711 2.24596 19.1508C1.81454 21.5305 1.92821 23.9771 2.57842 26.3065C3.22864 28.636 4.39848 30.7877 6 32.6"
                          stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_18_704">
                          <rect width="48" height="48" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  :
                  <div className="popup-body-box-result-box-making-box-same-card">
                    <p>{mustBeDifferentTeamPair[0]}</p>
                    <button type="button" onClick={() => handleMustBeDifferentTeamPairXButtonClick(0)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M36 12L12 36M12 12L36 36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                              strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
              }

              {/*dif2*/}
              {
                mustBeDifferentTeamPair[1] === ''
                  ?
                  <div
                    className={`popup-body-box-result-box-making-box-same-cloud-card ${isDraggingOver.dif2 ? 'drag-over' : ''}`}
                    onDragEnter={(e) => handleDragEnter(e, 'dif2')}
                    onDragLeave={(e) => handleDragLeave(e, 'dif2')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDifferentDrop(e, 'dif2')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <g clipPath="url(#clip0_18_704)">
                        <path
                          d="M32 32L24 24M24 24L16 32M24 24V42M40.78 36.78C42.7307 35.7165 44.2717 34.0338 45.1597 31.9972C46.0478 29.9607 46.2324 27.6865 45.6844 25.5334C45.1364 23.3803 43.887 21.471 42.1333 20.1069C40.3797 18.7428 38.2217 18.0015 36 18H33.48C32.8746 15.6585 31.7463 13.4847 30.1799 11.642C28.6135 9.7993 26.6497 8.3357 24.4362 7.36121C22.2227 6.38673 19.8171 5.92672 17.4002 6.01576C14.9834 6.10481 12.6181 6.7406 10.4824 7.87533C8.34657 9.01006 6.49582 10.6142 5.06924 12.5672C3.64266 14.5201 2.67738 16.7711 2.24596 19.1508C1.81454 21.5305 1.92821 23.9771 2.57842 26.3065C3.22864 28.636 4.39848 30.7877 6 32.6"
                          stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_18_704">
                          <rect width="48" height="48" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  :
                  <div className="popup-body-box-result-box-making-box-same-card">
                    <p>{mustBeDifferentTeamPair[1]}</p>
                    <button type="button" onClick={() => handleMustBeDifferentTeamPairXButtonClick(1)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M36 12L12 36M12 12L36 36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                              strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
              }

            </div>
          }
          {
            ruleStatus === 'prefer' &&
            <div className="popup-body-box-result-box-making-box-same">
              {
                preferPosition
                  ?
                  <div className="popup-body-box-result-box-making-box-same-card">
                    <p>{preferPosition.name}</p>
                    <button type="button" onClick={handlePreferPositionXButtonClick}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M36 12L12 36M12 12L36 36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                              strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  :
                  <div
                    className={`popup-body-box-result-box-making-box-same-cloud-card ${isDraggingOver.posi ? 'drag-over' : ''}`}
                    onDragEnter={(e) => handleDragEnter(e, 'posi')}
                    onDragLeave={(e) => handleDragLeave(e, 'posi')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handlePreferDrop(e, 'posi')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <g clipPath="url(#clip0_18_704)">
                        <path
                          d="M32 32L24 24M24 24L16 32M24 24V42M40.78 36.78C42.7307 35.7165 44.2717 34.0338 45.1597 31.9972C46.0478 29.9607 46.2324 27.6865 45.6844 25.5334C45.1364 23.3803 43.887 21.471 42.1333 20.1069C40.3797 18.7428 38.2217 18.0015 36 18H33.48C32.8746 15.6585 31.7463 13.4847 30.1799 11.642C28.6135 9.7993 26.6497 8.3357 24.4362 7.36121C22.2227 6.38673 19.8171 5.92672 17.4002 6.01576C14.9834 6.10481 12.6181 6.7406 10.4824 7.87533C8.34657 9.01006 6.49582 10.6142 5.06924 12.5672C3.64266 14.5201 2.67738 16.7711 2.24596 19.1508C1.81454 21.5305 1.92821 23.9771 2.57842 26.3065C3.22864 28.636 4.39848 30.7877 6 32.6"
                          stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_18_704">
                          <rect width="48" height="48" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>

              }
              {/* 포지션 선택 */}
              <div className="popup-body-box-result-box-making-box-position">
                {
                  preferPosition &&
                  (<>

                    <div className="popup-body-box-result-box-making-box-position-icon"
                         onClick={() => handlePositionIconClick('top')}>
                      <svg
                        className={preferPosition.prefer.includes('top') ? "on" : ""}
                        xmlns="http://www.w3.org/2000/svg" width="48" height="49" viewBox="0 0 48 49" fill="none">
                        <path d="M30.3158 31.3496L17.6842 31.3496L17.6842 18.4925L30.3158 18.4925L30.3158 31.3496Z"
                              fill="white" fillOpacity="0.15"/>
                        <path
                          d="M42.5495 0.921027L2.31463e-06 0.921031L6.03443e-06 44.2304L9.26316 34.8018L9.26316 9.92103L33.7074 9.92103L42.5495 0.921027Z"
                          fill="white" fillOpacity="0.15"/>
                        <path
                          d="M14.9521 39.921L38.7368 39.921L38.7368 15.7116L48 6.28298L48 48.921L6.11 48.921L14.9521 39.921Z"
                          fill="white" fillOpacity="0.15"/>
                        <path
                          d="M42.5495 0.921027L2.31463e-06 0.921031L6.03443e-06 44.2304L9.26316 34.8018L9.26316 9.92103L33.7074 9.92103L42.5495 0.921027Z"
                          fill="currentColor"/>
                      </svg>
                    </div>

                    <div className="popup-body-box-result-box-making-box-position-icon"
                         onClick={() => handlePositionIconClick('jg')}>
                      <svg
                        className={preferPosition.prefer.includes('jg') ? "on" : ""}
                        xmlns="http://www.w3.org/2000/svg" width="48" height="55" viewBox="0 0 48 55" fill="none">
                        <path
                          d="M27.7668 26.5141C28.8 28.5877 29.3453 31.4101 29.4888 32.5621L31.8565 26.9461C31.713 26.5141 31.5121 24.7861 31.8565 21.3301C32.2009 17.8741 36.4484 6.35412 38.5291 1.02612C36.7354 3.47412 32.7175 9.01812 30.9955 11.6101C29.2735 14.2021 26.4036 19.6021 25.1839 21.9781C25.6143 22.6261 26.7336 24.4405 27.7668 26.5141Z"
                          fill="currentColor"/>
                        <path
                          d="M34.87 42.7141C33.6646 43.7509 32.0717 45.5941 31.426 46.3861L31.2108 40.1221C31.426 39.2581 31.9856 37.0981 32.5022 35.3701C33.0188 33.6421 34.4395 29.9701 37.2377 25.0021C37.9552 23.9221 39.9928 21.2005 41.5426 19.8181C43.0924 18.4357 45.6323 16.7941 48 15.4981C44.7713 19.1701 45.2018 18.7381 42.1883 24.1381C39.7354 28.5338 39.3184 35.4421 39.3901 39.4741C38.3856 40.1221 36.0753 41.6773 34.87 42.7141Z"
                          fill="currentColor"/>
                        <path
                          d="M26.2601 39.0421C26.2601 47.3365 24.8251 52.8661 24.1076 54.5941C18.5973 46.2997 11.4798 40.7701 8.60986 39.0421C8.39462 36.4501 7.74888 30.4453 6.88789 27.1621C6.02691 23.8789 1.93722 18.0181 0 15.4981C1.93722 16.3621 6.6296 18.8245 9.90134 21.7621C13.1731 24.6997 15.426 29.3221 16.1435 31.2661C16.1435 29.2501 16.0143 24.0949 15.4978 19.6021C14.9812 15.1093 11.1211 5.05812 9.2556 0.594116C10.9058 3.11412 14.2063 7.07412 16.7892 11.6101C18.5666 14.7314 26.2601 28.6741 26.2601 39.0421Z"
                          fill="currentColor"/>
                      </svg>
                    </div>

                    <div className="popup-body-box-result-box-making-box-position-icon"
                         onClick={() => handlePositionIconClick('mid')}>
                      <svg
                        className={preferPosition.prefer.includes('mid') ? "on" : ""}
                        xmlns="http://www.w3.org/2000/svg" width="48" height="49" viewBox="0 0 48 49" fill="none">
                        <g>
                          <path d="M0 0.921021H35.684L26.8419 9.73352H9.26316V27.2534L0 36.4855V0.921021Z"
                                fill="white"
                                fillOpacity="0.15"/>
                          <path d="M12.3419 47.921H48V12.3822L38.7368 21.6144V39.1085H21.184L12.3419 47.921Z"
                                fill="white"
                                fillOpacity="0.15"/>
                          <path d="M48 8.57141L8.51953 47.921H0V40.296L39.5068 0.921021H48V8.57141Z"
                                fill="currentColor"/>
                        </g>
                      </svg>
                    </div>

                    <div className="popup-body-box-result-box-making-box-position-icon"
                         onClick={() => handlePositionIconClick('ad')}>
                      <svg
                        className={preferPosition.prefer.includes('ad') ? "on" : ""}
                        xmlns="http://www.w3.org/2000/svg" width="48" height="49" viewBox="0 0 48 49" fill="none">
                        <path d="M17.6842 18.1264H30.3158V30.7157H17.6842V18.1264Z" fill="white" fillOpacity="0.15"/>
                        <path d="M5.45045 47.921H48V5.51394L38.7368 14.7461V39.1085H14.2926L5.45045 47.921Z"
                              fill="white"
                              fillOpacity="0.15"/>
                        <path d="M33.0479 9.73352H9.26316V33.4386L0 42.6708V0.921021H41.89L33.0479 9.73352Z"
                              fill="white"
                              fillOpacity="0.15"/>
                        <path d="M5.45045 47.921H48V5.51394L38.7368 14.7461V39.1085H14.2926L5.45045 47.921Z"
                              fill="currentColor"/>
                      </svg>
                    </div>

                    <div className="popup-body-box-result-box-making-box-position-icon"
                         onClick={() => handlePositionIconClick('sup')}>
                      <svg
                        className={preferPosition.prefer.includes('sup') ? "on" : ""}
                        xmlns="http://www.w3.org/2000/svg" width="48" height="41" viewBox="0 0 48 41" fill="none">
                        <path
                          d="M22.2353 14.242L23.8235 16.3472L25.5882 14.242L29.8235 35.6455L23.8235 40.3823L18.1765 35.6455L22.2353 14.242Z"
                          fill="currentColor"/>
                        <path
                          d="M30.8824 23.1893L27.7059 13.0139L32.4706 8.27706L48 8.80338C47.2941 9.56361 45.4941 11.1543 43.9412 12.1367C42.3882 13.1192 40.2353 14.242 38.2941 14.4174H34.2353L38.2941 20.2069L30.8824 23.1893Z"
                          fill="currentColor"/>
                        <path
                          d="M23.8235 11.7858L16.5882 3.54022L18.1765 0.382324H29.8235L31.2353 3.54022L23.8235 11.7858Z"
                          fill="currentColor"/>
                        <path
                          d="M19.7647 13.0139L15.5294 8.80338H0C0.588235 9.27121 1.05882 10.7332 4.58823 12.4876C7.31992 13.8454 9.58823 14.4759 10.0588 14.4174H13.5882L9.52941 20.2069L17.1176 23.1893L19.7647 13.0139Z"
                          fill="currentColor"/>
                      </svg>
                    </div>

                  </>)
                }

              </div>
            </div>
          }
        </div>
        <div className="popup-footer">
          <div className="popup-footer-button-box">
            <button type="button" className="popup-footer-button-subtle" onClick={handleCloseButtonClick}>
              닫기
            </button>
            <button type="button" className="popup-footer-button-primary" onClick={handleAddButtonClick}>
              추가하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}