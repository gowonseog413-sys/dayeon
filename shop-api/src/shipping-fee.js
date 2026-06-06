/** 주문 배송비 — 장바구니 내 유료 배송 상품 중 최대 1건 부과 */
export function calcOrderShippingFee(db, orderItems) {
  let maxFee = 0;
  for (const item of orderItems) {
    const p = db.products.find((x) => x.id === item.productId);
    if (p?.shippingFeeCharged && Number(p.shippingFeeAmount) > 0) {
      maxFee = Math.max(maxFee, Number(p.shippingFeeAmount));
    }
  }
  return maxFee;
}
