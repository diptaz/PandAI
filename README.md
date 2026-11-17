<div align="center">
  <img src="https://github.com/user-attachments/assets/6dd06c2b-87bf-476c-8c98-7a8d30b1f81a" alt="PandAI Logo" width="120" height="120">

  <h1 align="center">PandAI - Intelligent Study Planner</h1>

  <p align="center">
    Adaptive task scheduling and personalized study duration prediction powered by constraint solving and machine learning.
    <br />
    <br />
    <a href="https://github.com/diptaz/PandAI/issues/new?labels=bug&template=bug_report.md">Report Bug</a>
    ·
    <a href="https://github.com/diptaz/PandAI/issues/new?labels=enhancement&template=user_story.md">Request Feature</a>
  </p>
</div>

---

## Overview

**PandAI** is a cross-platform mobile application built with **Expo (React Native)** that eliminates scheduling conflicts and reduces procrastination through automated, adaptive time-blocking.

Under the hood, the platform pairs a **NestJS** backend for constraint-based calendar optimization with a **FastAPI** machine learning service that continuously calibrates task duration estimates based on each user's historical work velocity.

## Tech Stack

* [![Expo][Expo-badge]][Expo-url]
* [![React Native][React-badge]][React-url]
* [![NestJS][NestJS-badge]][NestJS-url]
* [![NodeJS][Node-badge]][Node-url]
* [![FastAPI][FastAPI-badge]][FastAPI-url]
* [![Python][Python-badge]][Python-url]
* [![PostgreSQL][Postgres-badge]][Postgres-url]
* [![Docker][Docker-badge]][Docker-url]
* [![GitHub Actions][GitHub-badge]][GitHub-url]

---

## Repository Structure

```text
PandAI/
├── apps/
│   ├── mobile/  
│   └── api/       
├── ml-service/        
├── .github/
│   └── workflows/       
└── docker-compose.yml     
```

---

## Getting Started

This repository is structured as a lightweight monorepo containerized with Docker to ensure environment parity across development and testing.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- Node.js 26 LTS & Python 3.15.2 *(optional, required only for local virtual environment access outside containers)*
- Expo Go installed on your iOS or Android device

### Local Setup

1. **Spin up the Backend, ML Service, and Database**
   From the project root directory, build and start all containerized services:
   ```bash
   docker compose up -d --build
   ```

   | Service | Local Endpoint | Description |
   | :--- | :--- | :--- |
   | **NestJS API** | `http://localhost:3000` | Core backend & schedule constraint solver |
   | **FastAPI ML** | `http://localhost:8000` | Task duration prediction & calibration service |
   | **PostgreSQL** | `localhost:5432` | Primary relational database |

2. **Start the Mobile Client (Expo)**
   Open a separate terminal, navigate to the mobile workspace, install dependencies, and start the bundler:
   ```bash
   cd apps/mobile
   npm install
   npx expo start -c
   ```
   Scan the generated QR code in your terminal using **Expo Go**.

---

## Contributing & Git Workflow

This repository enforces a **strict branching model** and **Pull Request (PR)** review gates. Direct pushes to `main` and `integration/pandai` are restricted.

### Branching Strategy
- `main` &rarr; Production-ready, stable release branch.
- `integration/pandai` &rarr; Pre-production integration branch and target for feature PRs; triggers automated QA CI pipelines.
- `feature/*` &rarr; Scoped development branches (e.g., `feature/front-end`, `feature/back-end`, `feature/ML-Data`).

### Commit Message Convention
All commits must follow the Conventional Commits format linked to a valid issue key:

```text
<type>(KAN-xx): <concise description>
```

| Type | Purpose |
| :--- | :--- |
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without functional changes |
| `test` | Adding or updating automated tests |
| `docs` | Documentation updates |

**Example:** `feat(KAN-26): add regression endpoint for study duration prediction`

---

## Core Team

<div align="center">
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/diptaz">
        <img src="https://images.weserv.nl/?url=github.com/diptaz.png&w=160&h=160&fit=cover&mask=circle" width="80px;" alt="diptaz"/><br />
        <sub><b>I Gede Wahyu Dipta Pariandika</b></sub>
      </a><br />
      <sub>Product Owner</sub>
    </td>
    <td align="center">
      <a href="https://github.com/MaulidanFazri">
        <img src="https://images.weserv.nl/?url=github.com/MaulidanFazri.png&w=160&h=160&fit=cover&mask=circle" width="80px;" alt="MaulidanFazri"/><br />
        <sub><b>Maulidan Fazri</b></sub>
      </a><br />
      <sub>Quality Assurance</sub>
    </td>
    <td align="center">
      <a href="https://github.com/allanfisthiantara">
        <img src="https://images.weserv.nl/?url=github.com/allanfisthiantara.png&w=160&h=160&fit=cover&mask=circle" width="80px;" alt="allanfisthiantara"/><br />
        <sub><b>Bernardus Allan Fisthiantara</b></sub>
      </a><br />
      <sub>ML Engineer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/FriskaDeviana">
        <img src="https://images.weserv.nl/?url=github.com/FriskaDeviana.png&w=160&h=160&fit=cover&mask=circle" width="80px;" alt="FriskaDeviana"/><br />
        <sub><b>Friska Deviana</b></sub>
      </a><br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/AldridgeHanselRobin">
        <img src="https://images.weserv.nl/?url=github.com/AldridgeHanselRobin.png&w=160&h=160&fit=cover&mask=circle" width="80px;" alt="AldridgeHanselRobin"/><br />
        <sub><b>Aldridge Hansel Robin</b></sub>
      </a><br />
      <sub>Backend Developer</sub>
    </td>
  </tr>
</table>
</div>

<!-- MARKDOWN LINKS & IMAGES -->
[Expo-badge]: https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white
[Expo-url]: https://expo.dev/
[React-badge]: https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactnative.dev/
[NestJS-badge]: https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white
[NestJS-url]: https://nestjs.com/
[Node-badge]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[FastAPI-badge]: https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi
[FastAPI-url]: https://fastapi.tiangolo.com/
[Python-badge]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[Postgres-badge]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Docker-badge]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[GitHub-badge]: https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white
[GitHub-url]: https://github.com/features/actions
