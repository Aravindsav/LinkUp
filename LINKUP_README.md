# LinkUp – Video Chat Web App

**LinkUp** is a full-stack web application that allows users to register, log in, and host or join video meetings in real-time. It leverages WebRTC and Socket.IO for peer-to-peer communication.

🌐 **Live Demo**: [https://linkup-frontend-w8ki.onrender.com](https://linkup-frontend-w8ki.onrender.com)

---

## 🚀 Features

- User registration & login with token-based authentication
- Secure password hashing with bcrypt
- Join/Host meetings via unique meeting codes
- Real-time video and audio via WebRTC
- Chat functionality (optional)
- Meeting history saved per user

---

## 🛠 Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO, MongoDB (Mongoose)
- **Deployment**: Render

---

## 📁 Folder Structure

```
linkup/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── index.js
└── frontend/
    ├── src/
    ├── public/
    └── tailwind.config.js
```

---

## 🔐 Environment Variables

In the backend `.env` file:

```env
PORT=8000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

> Don't forget to whitelist your IP (or use `0.0.0.0/0` temporarily) on MongoDB Atlas.

---

## 🧪 Running Locally

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd linkup
```

2. **Backend Setup**

```bash
cd backend
npm install
# Add your .env file
npm start
```

3. **Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

4. Open `http://localhost:5173` in your browser.

---

## ✨ API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST   | `/api/v1/users/register` | Register new user |
| POST   | `/api/v1/users/login`    | Login with credentials |
| GET    | `/api/v1/users/history`  | Get user's meeting history |
| POST   | `/api/v1/users/add`      | Save new meeting code |

---

## 📦 Deployment (Render)

- Deploy **frontend** and **backend** as two separate services
- Set environment variables on backend Render service manually

---

## 🧠 Notes

- Uses WebRTC for peer-to-peer video communication
- Socket.IO handles signaling and meeting code rooms

---

## 📜 License

MIT

---

© 2025 LinkUp Project