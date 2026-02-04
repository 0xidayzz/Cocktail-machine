// ui/src/api/db.js
const KEYS = {
  USERS: "cm_users_v1",
  SESSION: "cm_session_v1",
  ORDERS: "cm_orders_v1",
  BOTTLES: "cm_bottles_v1"
};

export function keys() {
  return KEYS;
}

export function read(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function initDbIfNeeded() {
  // Users par défaut
  if (!localStorage.getItem(KEYS.USERS)) {
    const users = [
      // Admin : code obligatoire
      { id: "u_admin", username: "admin", role: "admin", code: "9264", balance: 0 },

      // Users : PIN 4 chiffres
      { id: "u_1", username: "johan", role: "user", pin: "1234", balance: 10 },
      { id: "u_2", username: "alex", role: "user", pin: "4321", balance: 5 }
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  // Orders par défaut
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
  }

  // Overrides capacité bouteilles (null = capacité par défaut venant de ingredients.json)
  if (!localStorage.getItem(KEYS.BOTTLES)) {
    const bottles = {
      orange: null,
      ananas: null,
      sprite: null,
      cola: null
    };
    localStorage.setItem(KEYS.BOTTLES, JSON.stringify(bottles));
  }
}
