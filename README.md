# MindLeap Frontend

A modern, full-featured Wordle-style daily word game built with **React + Vite + Tailwind CSS**. Includes a classic game mode, speed game mode, leaderboard, profile with XP/badges, and full dark mode support.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Axios | API calls |
| React Router v6 | Routing |
| React Hot Toast | Toast notifications |
| React Icons | Icon library |

---

## Features

- **Classic Game** — Daily word guessing game (5 guesses for guests, 6 for auth users)
- **Speed Game** — Timed mode with XP rewards based on speed and attempts
- **Auth** — Register, login, logout with JWT + HTTP-only refresh token cookie
- **Auto token refresh** — Axios interceptor silently refreshes expired tokens with a queue to prevent race conditions
- **Guest mode** — Play without an account, session persisted in `sessionStorage` for the day
- **Leaderboard** — Classic and Speed tabs with your rank card
- **Profile** — Stats, XP level progress, badges, rewards, guess distribution
- **Dark / Light mode** — Toggle in Navbar, consistent across all pages
- **Fully responsive** — Mobile-first, hamburger menu on small screens
- **Animations** — Tile bounce on type, row shake on invalid word, letter flip on reveal

---

## Project Structure

```
src/
├── api/
│   ├── axios.js          # Axios instance + request/response interceptors
│   ├── auth.js           # register, login, logout, getMe
│   ├── game.js           # fetchDailyInfo, submitGuessApi, checkAlreadyPlayed
│   ├── leaderboard.js    # getLeaderboard, getMyRank
│   ├── speedGame.js      # startSpeedGame, submitSpeedGuess, getSpeedLeaderboard, getMySpeedStats
│   └── level.js          # getMyLevel, getMyBadges, getMyRewards
│
├── components/
│   ├── Reuseable/
│   │   └── Navbar.jsx    # Responsive navbar with auth state + dark mode toggle
│   ├── Board/
│   │   └── Board.jsx     # 6×5 tile grid with shake animation
│   ├── Keyboard/
│   │   └── Keyboard.jsx  # On-screen QWERTY keyboard with key status colors
│   └── Tile.jsx          # Single letter tile with bounce animation
│
├── pages/
│   ├── HomePage.jsx       # Classic daily game
│   ├── LoginPage.jsx      # Login form
│   ├── RegisterPage.jsx   # Register form
│   ├── LeaderboardPage.jsx # Classic + Speed leaderboard tabs
│   ├── ProfilePage.jsx    # Stats, level, badges, rewards, guess distribution
│   └── SpeedGamePage.jsx  # Timed speed game mode
│
├── App.jsx                # React Router route definitions
├── main.jsx               # App entry point
└── index.css              # Tailwind imports + global overflow fix
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- The [MindLeap Backend](https://github.com/your-username/mindleap-backend) running on `http://localhost:5000`

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/mindleap-frontend.git
cd mindleap-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | HomePage (Classic Game) | No |
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/leaderboard` | LeaderboardPage | No |
| `/profile` | ProfilePage | Yes |
| `/speed-game` | SpeedGamePage | Yes |

---

## Game Modes

### Classic Mode
- One new word every day
- Guests get **5 guesses**, logged-in users get **6 guesses**
- Results are color coded — green (correct), yellow (present), gray (absent)
- Guest progress is saved in `sessionStorage` (survives refresh, clears on tab close)
- Auth users' progress is restored from the backend on page load

### Speed Mode
- Same Wordle rules but with a **60 second countdown**
- Earn XP based on how fast you solve it and how many guesses you use
- Stats and recent games shown on the idle screen

---

## Auth Flow

```
Register → Email verification → Login → JWT saved to localStorage
                                      → Refresh token saved as HTTP-only cookie
                                      → Auto-refresh on 401 via Axios interceptor
```

The Axios interceptor handles token expiry silently:
- On `401` → calls `POST /auth/refresh-token`
- Updates `accessToken` in localStorage
- Retries the original failed request
- Queues concurrent requests during refresh to avoid race conditions
- On refresh failure → clears tokens and redirects to `/login`

---

## Color System

| Color | Hex | Usage |
|---|---|---|
| Correct | `#6AAA64` | Correct letter tile + CTA buttons |
| Present | `#C9B458` | Present letter tile + XP/level accents |
| Absent | `#787C7E` | Absent letter tile + logout button |
| Background (light) | `#FFFFFF` / `#F9F9F9` | App + card backgrounds |
| Background (dark) | `#121213` / `#1A1A1B` | App + card backgrounds |
| Border (light) | `#D3D6DA` | Input and card borders |
| Border (dark) | `#3A3A3C` | Input and card borders |

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Backend

This frontend connects to the MindLeap Backend API. Make sure the backend is running before starting the frontend.

Backend repo: [mindleap-backend](https://github.com/your-username/mindleap-backend)

---

## License
MIT
