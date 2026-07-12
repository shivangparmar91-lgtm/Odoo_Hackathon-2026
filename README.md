# AssetFlow ERP - Frontend

AssetFlow is a modern, comprehensive Enterprise Asset & Resource Management System. This repository contains the **frontend web application**.

## 🚀 Technologies Used
- **HTML5 & Vanilla JavaScript** for core logic
- **Vanilla CSS3** (Custom properties, Flexbox/Grid layouts, Glassmorphism)
- **Responsive Design** for desktop and mobile environments
- **Fetch API** for REST communication with the backend

## ✨ Features
- **Dashboard Overview**: Real-time metrics and dynamic data charting.
- **Department Management**: Add, edit, and organize departments.
- **Asset Tracking**: Register and manage hardware, software, and furniture.
- **Employee Directory**: Manage roles and assignments.
- **JWT Authentication**: Secure login flow with quick-login capabilities.
- **Rich UI/UX**: Custom toast notifications, smooth animations, modal systems, and dynamic skeletons.

## ⚙️ Setup & Installation

Since this is a vanilla frontend, you do not need Node.js or npm to build it. You simply need a local web server to serve the files.

1. **Clone the repository:**
   ```bash
   git clone -b frontend https://github.com/shivangparmar91-lgtm/Odoo_Hackathon-2026.git
   ```

2. **Serve the application:**
   You can use any local server, such as VS Code's "Live Server" extension, or Python's built-in HTTP server:
   ```bash
   python -m http.server 5500
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5500`

## 🔗 Backend Connection
Make sure your Spring Boot backend is running locally on `http://localhost:8080`. The API requests are automatically mapped via `js/api.js`.
