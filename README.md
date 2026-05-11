# 📻 Radio La Plateforme

Interface web pour la radio du festival La Plateforme (18–24 mai 2026).  
Construite avec React + TypeScript + Vite, connectée à AzuraCast via son API.

---

## 🗂 Structure

```
src/
├── pages/
│   ├── public/       → Player public (/)
│   ├── admin/        → Dashboard admin (/admin)
│   └── Archive/      → Archives des émissions (/admin/archive)
├── services/
│   └── azuracast.ts  → Appels API AzuraCast
└── hooks/
    ├── useNowPlaying.ts
    └── useAudioPlayer.ts
```

---

## ⚙️ Configuration

### 1. Copier le fichier d'exemple

```bash
cp .env.example .env.local
```

### 2. Renseigner les valeurs dans `.env.local`

```env
VITE_PUBLIC_BASE=http://VOTRE_IP_OU_DOMAINE
VITE_RECORDINGS_API_URL=http://VOTRE_IP_OU_DOMAINE:3000
VITE_AZURACAST_API_KEY=VOTRE_CLE_API_AZURACAST
VITE_STATION_ID=1
```

## 🚀 Installation et build

```bash
# Installer les dépendances
npm install

# Lancer en développement (avec hot-reload)
npm run dev

# Build de production
npm run build
# → génère le dossier dist/
```

---

## 🖥 Déploiement sur le serveur

### Prérequis serveur

- Nginx installé
- Node.js 20+ (pour le build uniquement, pas nécessaire en prod)
- AzuraCast installé et fonctionnel (via Docker)
- API Python recordings en service systemd sur le port 3002
- Nginx configuré pour servir le dossier `dist/`

### Étapes

**1. Cloner le repo et configurer**
```bash
git clone https://github.com/Abakar-Issa-Ali/radio-laplateforme.git
cd radio-laplateforme
cp .env.example .env.local
# Éditer .env.local avec les vraies valeurs
nano .env.local
```

**2. Build**
```bash
npm install
npm run build
```

**3. Copier le build dans le dossier web**
```bash
cp -r dist/* /var/www/radio-laplateforme/
```

**4. Config Nginx** (exemple `/etc/nginx/sites-available/radio-laplateforme`)

```nginx
server {
    listen 3000;
    root /var/www/radio-laplateforme;
    index index.html;

    # React SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy vers AzuraCast
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /listen/ {
        proxy_pass http://localhost:8080/listen/;
    }

    # Proxy vers l'API recordings Python (port 3002)
    location /recordings/ {
        proxy_pass http://localhost:3002/recordings/;
    }

    location /api-recordings/ {
        proxy_pass http://localhost:3002/api-recordings/;
    }
}
```

**5. Recharger Nginx**
```bash
nginx -t && systemctl reload nginx
```

---

## 🎙 Connexion DJ (BUTT)

| Paramètre        | Valeur                         |
|------------------|--------------------------------|
| Serveur          | IP ou domaine du serveur       |
| Port             | 8005                           |
| Type             | Icecast                        |
| Point de montage | /                              |
| Bitrate          | 128 kbps recommandé            |

---

## 🔧 Services serveur

| Service              | Commande                          |
|----------------------|-----------------------------------|
| AzuraCast (Docker)   | `cd /root && docker compose up -d` |
| API recordings       | `systemctl status radio-api`       |
| Nginx                | `systemctl status nginx`           |

---

## 📦 Variables d'environnement — référence complète

| Variable                  | Description                              | Exemple                          |
|---------------------------|------------------------------------------|----------------------------------|
| `VITE_PUBLIC_BASE`        | URL base AzuraCast (sans slash final)    | `http://192.168.1.100`           |
| `VITE_RECORDINGS_API_URL` | URL de l'API recordings                  | `http://192.168.1.100:3000`      |
| `VITE_AZURACAST_API_KEY`  | Clé API AzuraCast                        | `abc123:def456`                  |
| `VITE_STATION_ID`         | ID de la station (1 par défaut)          | `1`                              |