export type PreferPositionType = 'top' | 'jg' | 'ad' | 'mid' | 'sup';
export const POSITION_ORDER: PreferPositionType[] = ['top', 'jg', 'mid', 'ad', 'sup'];

export const KOREAN_PREFER_POSITION_MAP: Record<PreferPositionType, string> = {
  top: "탑",
  jg: "정글",
  ad: "원딜",
  mid: "미드",
  sup: "서포터",
};