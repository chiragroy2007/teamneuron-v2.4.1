# Team Neuron Science Hub - Dashboard

This is the dashboard for Team Neuron Science Hub, featuring a React frontend and a Node.js/SQLite backend.

## Deployment Guide (Ubuntu VPS)

Follow these steps to deploy the application on a fresh Ubuntu server.

### 1. Prerequisites

Update your system and install necessary tools:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip
```

**Install Node.js (v20+):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
```

### 2. Clone the Repository

```bash
git clone https://github.com/TeamNeuron-blog/dashboard.git
cd dashboard
```

### 3. Backend Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    ```bash
    cp .env.example .env
    nano .env
    ```
    *   Set `PORT` (e.g., `5000`).
    *   Set a secure `JWT_SECRET`.
4.  Build the backend:
    ```bash
    npm run build
    ```
5.  Start with PM2:
    ```bash
    pm2 start dist/index.js --name "neuron-backend"
    ```

### 4. Frontend Setup

1.  Navigate to the project root:
    ```bash
    cd ..
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    ```bash
    cp .env.example .env
    nano .env
    ```
    *   Set `VITE_API_URL` to your domain/IP + Backend Port (e.g., `http://your-server-ip:5000` or `https://api.yourdomain.com`).
4.  Build the frontend:
    ```bash
    npm run build
    ```
5.  Serve with PM2 (using `serve`):
    ```bash
    sudo npm install -g serve
    pm2 start serve --name "neuron-frontend" -- --s dist -l 3000
    ```
    *(This serves the frontend on port 3000)*

### 5. Nginx Reverse Proxy (Optional, Recommended)

Install Nginx to serve on Port 80/443:

```bash
sudo apt install -y nginx
```

Configure Nginx (`/etc/nginx/sites-available/default`) to proxy traffic:
- `/api` -> `http://localhost:5000`
- `/` -> `http://localhost:3000`

### 6. Managing Ports

- **Backend Port**: Change `PORT` in `server/.env` and restart backend (`pm2 restart neuron-backend`).
- **Frontend Port**: Change the `-l 3000` flag in the PM2 start command.
