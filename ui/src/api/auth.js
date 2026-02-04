import { read, write, keys } from "./db";

export function getSession() {
  return read(keys().SESSION);
}

export function logout() {
  write(keys().SESSION, null);
}

export function loginAsGuest() {
  const session = { userId: "guest", username: "Invité", role: "guest" };
  write(keys().SESSION, session);
  return session;
}

export function loginUser({ username, password, pin, code }) {
  const users = read(keys().USERS) || [];
  const u = users.find(x => x.username === username);
  if (!u) throw new Error("Utilisateur inconnu");

  if (u.role === "admin") {
    if (!code || code !== u.code) throw new Error("Code admin invalide");
  } else {
    const okPwd = password && password === u.password;
    const okPin = pin && pin === u.pin;
    if (!okPwd && !okPin) throw new Error("Mot de passe ou PIN invalide");
  }

  const session = { userId: u.id, username: u.username, role: u.role };
  write(keys().SESSION, session);
  return session;
}

export function getUserById(userId) {
  const users = read(keys().USERS) || [];
  if (userId === "guest") return { id: "guest", username: "Invité", role: "guest", balance: 0 };
  return users.find(u => u.id === userId) || null;
}

export function updateUserBalance(userId, newBalance) {
  const users = read(keys().USERS) || [];
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx].balance = newBalance;
    write(keys().USERS, users);
  }
}
