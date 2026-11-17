<div align="center">
  <!-- Ganti link gambar ini dengan logo PandAI asli nanti -->
  <img src="https://github.com/user-attachments/assets/6dd06c2b-87bf-476c-8c98-7a8d30b1f81a" alt="PandAI Logo" width="120" height="120">

  <h1 align="center">PandAI: Intelligent Study Planner</h1>

  <p align="center">
    Aplikasi mobile cerdas untuk penjadwalan tugas adaptif dan prediksi durasi belajar mandiri.
    <br />
    <br />
    <a href="https://github.com/diptaz/PandAI/issues/new?labels=bug&template=bug_report.md">Report Bug</a>
    ·
    <a href="https://github.com/diptaz/PandAI/issues/new?labels=enhancement&template=user_story.md">Request Feature</a>
  </p>
</div>

---

## Tentang Project
**PandAI** adalah aplikasi *mobile* berbasis **Expo (React Native)** yang dirancang untuk membantu mahasiswa memecahkan masalah prokrastinasi dan tumpang tindih jadwal. Sistem ini didukung oleh **Back-End NestJS** untuk *constraint-solving* kalender dan **FastAPI Machine Learning** untuk mengkalibrasi estimasi durasi tugas berdasarkan kebiasaan (kecepatan kerja) masing-masing pengguna.

Proyek ini dibangun untuk memenuhi kriteria AoL *Software Engineering* dan *Machine Learning* (COMP6100001).


## Built With (Tech Stack)
Aplikasi ini dikembangkan menggunakan tumpukan teknologi *Latest Stable*:

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

## Menjalankan Aplikasi di Lokal (Docker Ready)

Proyek ini menggunakan konfigurasi *monorepo* ringan yang dibungkus dengan Docker untuk menyelaraskan *environment* seluruh tim.

### Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Wajib nyala)
- Node.js 26 LTS & Python 3.15.2 (Hanya untuk akses *Virtual Environment* lokal jika diperlukan)
- Expo Go ter-install di HP (iOS/Android)

### Langkah Setup

1. **Jalankan Backend & Database via Docker**
   Dari folder *root* proyek, nyalakan kontainer:
   ```bash
   docker compose up -d --build
   ```
   *Layanan yang berjalan:*
   - `localhost:5432` - PostgreSQL Database
   - `localhost:8000` - FastAPI ML Service
   - `localhost:3000` - NestJS Backend (Otomatis terkoneksi ke Postgres & FastAPI)

2. **Jalankan Aplikasi Mobile (Expo)**
   Buka terminal baru, masuk ke direktori mobile, install dependensi, lalu nyalakan:
   ```bash
   cd apps/mobile
   npm install
   npx expo start -c
   ```
   *Scan QR Code di terminal menggunakan Expo Go.*

---

## Struktur Monorepo

```text
PandAI/
├── apps/
│   ├── mobile/         
│   └── api/  
├── ml-service/         
├── .github/workflows/  
└── docker-compose.yml 
```

---

## Panduan Kontribusi Tim (Git Workflow)

Proyek ini menggunakan kebijakan **Strict Branching** dan **Pull Request (PR)**. Dilarang melakukan *push* langsung ke branch `main` atau `integration/pandai`.

### Alur Branching
- `main` &rarr; Versi final stabil (*Production-ready*).
- `integration/pandai` &rarr; Target *Pull Request* (PR) untuk penggabungan fitur dan Pengujian Otomatis (QA CI).
- `feature/*` &rarr; Area kerja harian (contoh: `feature/front-end`, `feature/back-end`, `feature/ML-Data`).

### Konvensi Commit Message
Gunakan format standar: `type(KAN-xx): deskripsi singkat`
* `feat:` Fitur baru
* `fix:` Perbaikan bug
* `refactor:` Restrukturisasi kode
* `test:` Penambahan pengujian
* `docs:` Pembaruan dokumentasi

*Contoh:* `feat(KAN-26): tambah endpoint regresi prediksi durasi`

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/diptaz">
        <img src="https://github.com/diptaz.png" width="80px;" alt="diptaz"/><br />
        <sub><b>I Gede Wahyu Dipta Pariandika</b></sub>
      </a><br />
      <sub>Product Owner</sub>
    </td>
    <td align="center">
      <a href="https://github.com/MaulidanFazri">
        <img src="https://github.com/MaulidanFazri.png" width="80px;" alt="MaulidanFazri"/><br />
        <sub><b>Maulidan Fazri</b></sub>
      </a><br />
      <sub>Quality Assurance</sub>
    </td>
     <td align="center">
      <a href="https://github.com/allanfisthiantara">
        <img src="https://github.com/allanfisthiantara.png" width="80px;" alt="allanfisthiantara"/><br />
        <sub><b>Bernardus Allan Fisthiantara</b></sub>
      </a><br />
      <sub>ML Engineer</sub>
    </td>
     <td align="center">
      <a href="https://github.com/FriskaDeviana">
        <img src="https://github.com/FriskaDeviana.png" width="80px;" alt="FriskaDeviana"/><br />
        <sub><b>Friska Deviana</b></sub>
      </a><br />
      <sub>Frontend Developer</sub>
    </td>
     <td align="center">
      <a href="https://github.com/AldridgeHanselRobin">
        <img src="https://github.com/AldridgeHanselRobin.png" width="80px;" alt="AldridgeHanselRobin"/><br />
        <sub><b>Aldridge Hansel Robin</b></sub>
      </a><br />
      <sub>Backend Developer</sub>
    </td>
  </tr>
</table>

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