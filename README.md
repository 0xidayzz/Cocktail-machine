# Cocktail Machine

- ui/ : React + Vite (interface)
- backend/ : Node.js (API + WebSocket + PLC mock/modbus)

## Dev PC
Backend:
- cd backend
- npm install
- set PLC_MODE=mock
- npm start

UI:
- cd ui
- npm install
- npm run dev

## Deploy Raspberry
- scripts/deploy_rpi.sh <REPO_URL> [branch]
- systemd: cocktail-backend.service


Oui. Voici un README.md complet, prêt à copier-coller, avec une section “Jour J – Installation Raspberry” claire et détaillée.

Remplace entièrement ton README.md par ceci.

# 🍹 Cocktail Machine

Projet de machine à cocktail automatique avec interface web, backend Node.js
et communication Modbus avec un automate (Crouzet EM4).

---

## 📁 Structure



Cocktail-machine/
├── ui/ → Frontend React (Vite)
├── backend/ → Backend Node.js (API + WebSocket + PLC)
├── scripts/ → Scripts de déploiement Raspberry
└── README.md


---

## 🖥️ Développement sur PC (mode simulation)

### Backend (mock automate)

```bash
cd backend
npm install
set PLC_MODE=mock
npm start


Backend disponible sur : http://localhost:3001

Frontend
cd ui
npm install
npm run dev


UI disponible sur : http://localhost:5173

🧪 Test rapide

Lancer backend + UI

Cliquer sur “🧪 Test préparation”

Une fenêtre “Préparation” doit s’ouvrir avec une barre de progression

🚀 Jour J – Installation sur Raspberry Pi

Cette section explique tout ce qu’il faut faire le jour où
le Raspberry Pi et l’automate sont disponibles.

1️⃣ Pré-requis

Sur le Raspberry (Raspberry Pi OS conseillé) :

sudo apt update
sudo apt upgrade -y
sudo apt install -y git nodejs npm


Vérifier :

node -v
npm -v

2️⃣ Récupération du projet
cd /opt
sudo mkdir cocktail-machine
sudo chown -R $USER:$USER /opt/cocktail-machine

cd /opt
git clone https://github.com/TONUSER/Cocktail-machine.git cocktail-machine
cd cocktail-machine


(Remplacer TONUSER par ton nom GitHub)

3️⃣ Installation du backend
cd backend
npm install

4️⃣ Configuration automate

Modifier :

backend/config.json


Exemple :

{
  "plcMode": "modbus",
  "plc": {
    "ip": "192.168.1.50",
    "port": 502,
    "unitId": 1
  }
}


À changer :

plcMode → "modbus"

ip → IP réelle de l’automate

5️⃣ Test manuel backend

Lancer à la main :

cd backend
node server.js


Dans un navigateur :

http://IP_RASPBERRY:3001/api/ping


Doit répondre { ok: true }.

6️⃣ Activer démarrage automatique (systemd)

Créer le service :

sudo nano /etc/systemd/system/cocktail-backend.service


Coller :

[Unit]
Description=Cocktail Machine Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/cocktail-machine/backend
ExecStart=/usr/bin/node /opt/cocktail-machine/backend/server.js
Restart=always
RestartSec=2
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target


Activer :

sudo systemctl daemon-reload
sudo systemctl enable cocktail-backend
sudo systemctl start cocktail-backend


Vérifier :

sudo systemctl status cocktail-backend

7️⃣ Logs backend

Voir les logs :

journalctl -u cocktail-backend -f


Fichier local :

cat /opt/cocktail-machine/backend/backend.log

8️⃣ Calibration pompes (important)

Mesurer débit réel :

Pompe ON 10s → mesurer ml → ml / 10 = débit/s


Reporter dans :

backend/config.json

"flowRateMlPerSec": 22.5

9️⃣ Test final machine

Démarrer le backend

Ouvrir l’UI

Commander un cocktail

Vérifier :

Préparation affichée

Pompes activées

Progression

Fin correcte

🔌 Communication Raspberry ↔ Automate
Raspberry → Automate (Modbus TCP)
Type	Adresse	Rôle
HR	100–113	Job + quantités
Coil	0	Start
Automate → Raspberry
Type	Adresse	Rôle
HR	200–204	Status + progression
🧯 Dépannage rapide
Backend ne démarre pas
cd backend
node server.js


Lire erreur.

UI ne reçoit rien

Vérifier WebSocket : ws://IP:3001/ws

Vérifier proxy Vite

Vérifier firewall

Automate ne réagit pas

Vérifier IP

Vérifier mapping registres

Vérifier programme EM4

📈 Évolutions possibles

Base de données réelle

Paiement réel

Maintenance automatique

Supervision distante

Multi-machines

👨‍💻 Auteur

Projet personnel – Machine à cocktail automatisée


---

## Prochaine étape possible (si tu veux)

Je peux maintenant t’aider à :

👉 intégrer le frontend directement dans le backend (mode borne autonome)  
👉 préparer un script “one-click install” pour Raspberry  
👉 sécuriser l’admin  
👉 faire un backup automatique

Dis-moi ce que tu veux améliorer ensuite.