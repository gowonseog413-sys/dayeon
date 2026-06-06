import { redirect } from "next/navigation";

export default function ProfilePaymentRedirectPage() {
  redirect("/profile?tab=payment");
}
