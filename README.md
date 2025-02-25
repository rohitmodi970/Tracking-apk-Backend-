# 🚀 My Expo App

This project consists of a **React Native (Expo)** frontend and a **Node.js (Express + Mongoose)** backend.

---

## 🛠️ Project Setup

### 1️⃣ Clone the Repository  
```sh
[git clone https://github.com/rohitmodi970/Tracking-apk-Backend-.git]
cd your-repo-folder
```

---

## 📂 Backend Setup (Node.js + Express + MongoDB)

### 🔹 Install Dependencies  
```sh
cd my-expo-app backend
npm install
```

### 🔹 Start the Backend Server  
Ensure **MongoDB** is running, then start the backend:
```sh
nodemon app  # or npm start
```

### ⚙️ Backend Dependencies  
- **Express** (API framework)
- **Mongoose** (MongoDB ORM)
- **JSON Web Token (JWT)** (Authentication)
- **Bcrypt.js** (Password hashing)
- **Nodemon** (Auto-restart for development)

---

## 📱 Frontend Setup (React Native + Expo)

### 🔹 Install Dependencies  
```sh
cd my-expo-app
npm install
```

### 🔹 Run the Expo App  
- **For Android:**
  ```sh
  npm run android
  ```
- **For iOS:**
  ```sh
  npm run ios
  ```
- **For Web:**
  ```sh
  npm run web
  ```

### ⚙️ Frontend Dependencies  
- **React Navigation** (for screen navigation)
- **Axios** (for API requests)
- **React Native Vector Icons** (for icons)
- **Tailwind CSS** (for styling)
- **Async Storage** (for local storage)

---

## 🌍 Environment Variables
Create a **.env** file in the backend folder with:
```sh
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
Replace `your_mongodb_connection_string` and `your_jwt_secret` with actual values.

---

## 🚀 Features
✅ User authentication with JWT  
✅ Secure password storage with bcrypt.js  
✅ API calls using Axios  
✅ React Native navigation (bottom tabs, drawer, stack)  

---

## 🛠️ Troubleshooting
If you face issues, try the following:

### 🔹 Clear Metro Bundler cache  
```sh
expo start -c
```

### 🔹 Clear npm cache  
```sh
npm cache clean --force
```

### 🔹 Reset the backend  
```sh
rm -rf node_modules package-lock.json
npm install
```

---

## 💡 Contributing
Feel free to submit **issues** or **pull requests**! 🚀
