// ui/src/api/orders.js

import recipes from "../mock/recipes.json";
import { read, write, keys } from "./db";
import { getSession, getUserById, updateUserBalance } from "./auth";
import { priceForSize } from "./price";

/* ============================
   ORDERS
============================ */

export function listOrders() {
  return read(keys().ORDERS) || [];
}

export function listOrdersForUser(userId) {
  return listOrders().filter(o => o.userId === userId);
}

/* ============================
   GUEST BALANCE
============================ */

export function getGuestBalance() {
  const s = getSession();
  return Number(s?.guestBalance || 0);
}

export function topUpGuest(amount) {
  const s = getSession();
  if (!s || s.userId !== "guest") return;

  const next = Number(s.guestBalance || 0) + Number(amount || 0);

  const newSession = {
    ...s,
    guestBalance: next
  };

  write(keys().SESSION, newSession);
  return newSession;
}

export function debitGuest(price) {
  const s = getSession();
  if (!s || s.userId !== "guest") return;

  const next = Number(s.guestBalance || 0) - Number(price || 0);

  const newSession = {
    ...s,
    guestBalance: next
  };

  write(keys().SESSION, newSession);
  return newSession;
}

/* ============================
   CREATE ORDER
============================ */

export function createOrder({ recipeId, sizeMl }) {
  const session = getSession();

  if (!session) {
    throw new Error("Non connecté");
  }

  const recipe = recipes.find(r => r.id === recipeId);

  if (!recipe) {
    throw new Error("Recette inconnue");
  }

  const finalPrice = priceForSize(recipe.price, sizeMl);
  const now = new Date();

  const order = {
    id: crypto.randomUUID(),

    userId: session.userId,
    username: session.username || "guest",

    recipeId,
    recipeName: recipe.name,

    size_ml: Number(sizeMl || 200),
    price: finalPrice,

    createdAt: now.toISOString(),
    status: "done"
  };

  /* ============================
     DEBIT USER (non guest)
  ============================ */

  const me = getUserById(session.userId);

  if (me && me.role !== "guest") {
    const newBalance =
      Number(me.balance || 0) - Number(finalPrice || 0);

    updateUserBalance(me.id, newBalance);
  }

  /* ============================
     SAVE ORDER
  ============================ */

  const orders = listOrders();
  orders.unshift(order);

  write(keys().ORDERS, orders);

  return order;
}
