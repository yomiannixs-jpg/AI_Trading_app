# Run AITrade on Windows PowerShell

## Requirements

- Node.js 18 or 20 LTS
- MongoDB Community Server, Docker Desktop, or MongoDB Atlas
- Git

## 1. Open the project folder

```powershell
cd C:\Users\HP\Downloads\AI_Trading_App_Rebuilt\AI_Trading_App
```

## 2. Create the environment file

The included `.env` contains placeholders. At minimum, change `JWT_SECRET`. For local MongoDB, keep:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai-trading-app
JWT_SECRET=replace-this-with-a-long-random-secret
```

## 3. Install packages

From the project root:

```powershell
npm install
cd frontend
npm install
cd ..
```

## 4. Start MongoDB

With a local MongoDB Windows service:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

Or use Docker:

```powershell
docker run --name aitrade-mongo -p 27017:27017 -d mongo:7
```

## 5. Start backend and frontend

From the project root:

```powershell
npm run dev
```

Alternatively, use two terminals:

Terminal 1:

```powershell
npm start
```

Terminal 2:

```powershell
cd frontend
npm start
```

Open `http://localhost:3000`.

Backend health check: `http://localhost:5000/health`.

## 6. Commit the rebuilt project

```powershell
git add .
git commit -m "Rebuild frontend and fix runtime errors"
git push origin main
```

## Common Windows fix

When dependency installation behaves strangely, remove cached installations and retry:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item frontend\package-lock.json -ErrorAction SilentlyContinue
npm cache verify
npm install
cd frontend
npm install
```
