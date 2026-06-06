import { v4 as uuid } from "uuid";
import { DEFAULT_WELCOME_MESSAGE } from "./member-settings.js";

export function ensureUserMessages(db) {
  if (!Array.isArray(db.userMessages)) db.userMessages = [];
  return db.userMessages;
}

function renderWelcomeBody(template, { points, name }) {
  const text = template || DEFAULT_WELCOME_MESSAGE;
  return text
    .replace(/\{points\}/g, String(Math.max(0, Math.floor(Number(points) || 0))))
    .replace(/\{name\}/g, name || "고객");
}

export function sendWelcomeMessage(db, user, pointsAwarded = 0) {
  const bonus = db.settings?.signupBonus;
  if (!bonus?.welcomeMessageEnabled) return null;

  ensureUserMessages(db);
  const message = {
    id: uuid(),
    userId: user.id,
    type: "welcome",
    subject: "가입을 환영합니다",
    body: renderWelcomeBody(bonus.welcomeMessage, {
      points: pointsAwarded,
      name: user.firstName || user.email?.split("@")[0] || "고객",
    }),
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  db.userMessages.push(message);
  return message;
}

export function listUserMessages(db, userId) {
  return ensureUserMessages(db)
    .filter((m) => m.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countUnreadMessages(db, userId) {
  return listUserMessages(db, userId).filter((m) => !m.readAt).length;
}

export function markMessageRead(db, userId, messageId) {
  const msg = ensureUserMessages(db).find(
    (m) => m.id === messageId && m.userId === userId,
  );
  if (!msg) return null;
  if (!msg.readAt) msg.readAt = new Date().toISOString();
  return msg;
}

export function publicMessage(msg) {
  return {
    id: msg.id,
    type: msg.type,
    subject: msg.subject,
    body: msg.body,
    readAt: msg.readAt,
    createdAt: msg.createdAt,
  };
}
