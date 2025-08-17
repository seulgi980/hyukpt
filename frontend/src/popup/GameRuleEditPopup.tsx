import React, {useState} from "react";

export interface MustBeSameTeamGroupType {
  id: string;
  group: string[];
}

export interface MustBeDifferentTeamPairType {
  id: string;
  group: string[];
}

export type PreferPositionType = 'top' | 'jg' | 'ad' | 'mid' | 'sup';

export interface PlayerPreferPositionType {
  id: string;
  name: string;
  prefer: PreferPositionType[];
}

type RuleType = 'same' | 'different' | 'prefer';

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
  const [mustBeDifferentTeamPair,] = useState<string[]>([]);
  const [preferPosition,] = useState<PlayerPreferPositionType>();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function handleAddButtonClick() {
    if (ruleStatus === 'same') {
      if (mustBeSameTeamGroup.length > 0) {
        handleAddMustBeSameTeamGroupsRuleClick(
          {
            id: crypto.randomUUID(),
            group: mustBeSameTeamGroup
          }
        );
      }
    } else if (ruleStatus === 'different') {
      if (mustBeDifferentTeamPair.length > 0) {
        handleAddMustBeDifferentTeamPairsClick(
          {
            id: crypto.randomUUID(),
            group: mustBeDifferentTeamPair
          }
        );
      }
    } else if (ruleStatus === 'prefer') {
      if (preferPosition) {
        handleAddPreferPositionsClick(preferPosition);
      }
    }
    handleCloseButtonClick();
  }

  function handleClick(player: string) {
    if (mustBeSameTeamGroup.length === 5) {
      alert('같은 팀 규칙은 총 5명까지 가능합니다.')
      return;
    }
    if (mustBeSameTeamGroup.includes(player)) {
      alert('이미 추가된 선수입니다.')
      return;
    }
    if (ruleStatus === 'same') {
      setMustBeSameTeamGroup([
        ...mustBeSameTeamGroup,
        player
      ]);
    } else if (ruleStatus === 'different') {
    } else if (ruleStatus === 'prefer') {
    }

  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, player: string) {
    e.dataTransfer.setData("application/json", player);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(true);
  }

  function handleSameDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
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

  function handleMustBeSameTeamGroupXButtonClick(player: string) {
    setMustBeSameTeamGroup(
      mustBeSameTeamGroup.filter(mbstg => mbstg !== player)
    );
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
                  onClick={() => handleClick(p)}
                  onDragStart={(e) => handleDragStart(e, p)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
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
              `총 2명. “전설이 될 남자”, “가락마을 호카게” 는 다른 팀이 됩니다.`
            }
            {
              ruleStatus === 'prefer' &&
              `“반응속도할아버지” 은 “탑”, “정글”, “바텀”, “서포터” 에  고정됩니다.`
            }
          </p>
          {
            ruleStatus === 'same' &&
            <div className="popup-body-box-result-box-making-box-same">
              <div
                className={`popup-body-box-result-box-making-box-same-cloud-card ${isDraggingOver ? 'drag-over' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleSameDrop}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <g clip-path="url(#clip0_18_704)">
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
            <>different</>
          }
          {
            ruleStatus === 'prefer' &&
            <>prefer</>
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