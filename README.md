# Team Neuron - Dashboard (v2.4.1)

A high-performance research collaboration platform built for speed and scalability.

### Tech Stack & Efficiency
- **Frontend**: React + Vite (Ultra-fast build & HMR), TailwindCSS (Zero-runtime styles), Shadcn/UI (Radix primitives).
- **Backend**: Node.js + SQLite/libSQL (Low latency, single-file DB), Express.
- **Performance**: Optimized asset interactions, lazy loading, and minimal bundle size.

### Server Installation Steps - NoteToSelf

1.  **Prerequisites**: Install Node.js v20+, PM2, and Nginx.
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs nginx
    npm install -g pm2
    ```
2.  **Setup Backend**:
    - `cd server`, `npm install`, configure `.env` (PORT, JWT_SECRET).
    - `npm run build` -> `pm2 start dist/index.js --name "neuron-backend"`.
3.  **Setup Frontend**:
    - `cd ..`, `npm install`, configure `.env` (VITE_API_URL).
    - `npm run build`, `npm install -g serve`.
    - `pm2 start serve --name "neuron-frontend" -- --s dist -l 3000`.
4.  **Reverse Proxy**: Point Nginx `/` to port 3000 and `/api` to port 5000 (SSL handled by Certbot).

