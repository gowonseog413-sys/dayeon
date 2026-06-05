import { redirect } from "next/navigation";

/** FAQ·배송·문의는 소개·약관 페이지로 통합됨 */
export default function ErpSupportRedirectPage() {
  redirect("/erp/pages/faq");
}
