# 🏋️ Workout Tracker

**A desktop strength-training application for tracking workouts, monitoring performance, and analyzing fitness progress.**

Workout Tracker is a desktop application inspired by the core functionality of [Hevy](https://www.hevyapp.com/). It aims to provide a seamless strength-training experience with fast workout logging, customizable workout templates, complete training history, personal records, and detailed performance analytics.

The application is designed with a focus on usability, performance, and reliable offline functionality.

---

## ✨ Features

### Dashboard
- Overview of workout activity.
- Monthly workout statistics.
- Training volume tracking.
- Weekly activity visualization.
- Personal records overview.
- Recent workout history.

### Workout Management
- Start and log workout sessions.
- Add exercises to workouts.
- Track sets, repetitions, and weights.
- Save completed workouts.

### Workout Templates
- Create custom workout routines.
- Save frequently used workouts.
- Reuse existing templates.

### Exercise Library
- Browse available exercises.
- Organize exercises by muscle group.
- Search and select exercises.

### Training History
- View previous workout sessions.
- Track workout duration and volume.
- Review historical performance.

### Personal Records & Analytics
- Track personal records (PRs).
- Monitor strength progression.
- Visualize training statistics.
- Analyze workout frequency and volume.

### Offline Support
- Log workouts without an internet connection.
- Persist workout data locally.
- Synchronize data when connectivity is available.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Electron | Desktop application framework |
| JavaScript | Application logic |
| Vanilla CSS | Custom styling |
| Node.js | Runtime and backend |
| Express.js | REST API |
| PostgreSQL | Relational database |
| Prisma | Database ORM |
| SQLite | Local data storage |
| Recharts | Data visualization |

---

## 📂 Project Structure

```text
workout-tracker/
│
├── electron/
│   ├── main.cjs
│   └── preload.cjs
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── styles/
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── package-lock.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/workout-tracker.git
```

### 2. Navigate to the project

```bash
cd workout-tracker
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the desktop application

```bash
npm start
```

This starts the Vite development server and launches the Electron desktop window.

---

## 🎨 UI Design

The application follows a dark, minimal interface with green accents.

Design principles:

- Clean and intuitive navigation.
- Minimal visual clutter.
- Consistent spacing and typography.
- Custom CSS styling.
- Data-focused dashboard.
- Desktop-first user experience.

---

## 🗺️ Development Roadmap

- [x] Initial project setup
- [x] React + Vite integration
- [x] Electron desktop configuration
- [x] Dashboard UI
- [x] Sidebar navigation
- [x] Workout statistics UI
- [ ] Exercise library
- [ ] Workout logging functionality
- [ ] Workout templates
- [ ] Workout history
- [ ] Personal records tracking
- [ ] Statistics and analytics
- [ ] PostgreSQL integration
- [ ] Prisma ORM integration
- [ ] Offline data persistence
- [ ] Data synchronization
- [ ] Application packaging and distribution

---

## 🎯 Project Objective

The objective of Workout Tracker is to build a feature-rich desktop fitness application that makes strength-training tracking simple, organized, and insightful.

The project also explores desktop application development using Electron, frontend architecture with React, database management, and offline-first application design.

---

## 👨‍💻 Author

**Sarthak Jaiswal** 
**Arnav Maheshwari**
**Naman Katyal**

Full Stack Developer | Computer Science Student

---

*Built with consistency, one rep at a time. 💪*