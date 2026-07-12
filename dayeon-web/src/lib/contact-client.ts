import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export async function submitContactMessage(name: string, message: string) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase 설정이 필요합니다.");
  }

  await addDoc(collection(db, "messages"), {
    name,
    message,
    createdAt: serverTimestamp(),
  });
}
