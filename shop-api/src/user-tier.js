/** 적립 포인트 기준 회원 등급 */
export function computeUserTier(points, thresholds) {
  const p = Number(points) || 0;
  const vip = Number(thresholds?.tierVip) || 10000;
  const gold = Number(thresholds?.tierGold) || 5000;
  const silver = Number(thresholds?.tierSilver) || 1000;
  if (p >= vip) return "VIP";
  if (p >= gold) return "골드";
  if (p >= silver) return "실버";
  return "일반";
}
