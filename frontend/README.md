# ⚡ FantasyBet — IPL Betting & Fantasy Sports Platform

> A full-stack fantasy sports betting platform built for IPL cricket fans. Place bets, build Fantasy 11 squads, compete in multiplayer contests, and play Mines — all in one app.

🌐 **Live Demo:** [betting-app-omega.vercel.app](https://betting-app-omega.vercel.app)

---

## 🚀 Features

- 🏏 **Live IPL Betting** — Bet on real IPL matches with live odds
- 🏆 **Fantasy 11** — Pick your dream squad, assign Captain & Vice-Captain
- ⚔️ **Multiplayer Contests** — Create public/private contests and challenge friends
- 💣 **Mines Game** — Risk your points in a Minesweeper-style mini game
- 🎵 **Theme Music Player** — Epic background music while you bet
- 🏅 **Leaderboard** — Compete with all players globally
- 📜 **Bet History** — Track all your bets, contests, and fantasy results
- 🎨 **Theme Switcher** — Dark/light mode support
- 🔔 **Toast Notifications** — Real-time feedback on every action
- 📱 **Mobile Responsive** — Full bottom nav for mobile users

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Deployment |
|----------|---------|----------|------------|
| React.js | Node.js | MongoDB  | Vercel (FE) |
| CSS3 | Express.js | Mongoose | Render (BE) |
| canvas-confetti | REST API | | |

---

## 📁 Project Structure

```
betting-app/
├── frontend/          # React app
│   ├── public/
│   │   └── audio/     # Theme music tracks
│   └── src/
│       ├── components/
│       │   └── ThemeMusicPlayer.jsx
│       ├── App.js
│       ├── Matches.jsx
│       ├── Fantasy11.jsx
│       ├── Multiplayer.jsx
│       ├── Mines.jsx
│       └── ThemeSwitcher.jsx
└── backend/           # Express API server
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### 1. Clone the repo
```bash
git clone https://github.com/Ram-anuj-web/betting-app.git
cd betting-app
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:
```
REACT_APP_API_URL=http://localhost:5000
```

```bash
npm start
```

### 3. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

```bash
npm start
```

---

## 🎮 How to Play

1. **Register** with a username and password — get 1000 free points
2. **Go to 🏏 IPL** tab to see live and upcoming matches
3. **Place a bet** by picking a team and amount
4. **Build a Fantasy 11 squad** for extra points
5. **Join or create contests** in ⚔️ Multiplayer
6. **Try your luck** in 💣 Mines
7. Check the **Leaderboard** to see where you rank!

---

## 🌐 Deployment

- **Frontend** → Vercel (auto-deploys on push to `main`)
- **Backend** → Render (always-on Node.js server)
- **Database** → MongoDB Atlas

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this project for learning or personal use.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Ram-anuj-web">Ram Anuj</a>
</div>