import { redirect } from "next/navigation";

export default function ProfileAddressRedirectPage() {
  redirect("/profile?tab=address");
}
