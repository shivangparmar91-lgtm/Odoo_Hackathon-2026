<h1 align="center">
  <br>
  ⚡ AssetFlow ERP
  <br>
</h1>

<h4 align="center">Enterprise Asset & Resource Management System — Built for Scale, Designed for Clarity.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.2.4-6DB33F?style=for-the-badge&logo=spring-boot" />
  <img src="https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-blue?style=for-the-badge&logo=html5" />
  <img src="https://img.shields.io/badge/Database-MySQL%20%2F%20H2-4479A1?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-user-roles">User Roles</a> •
  <a href="#-application-flow">Application Flow</a>
</p>

---

## 📌 Overview

**AssetFlow ERP** is a full-stack Enterprise Asset & Resource Management platform built for the **Odoo Hackathon 2026**. It enables organizations to track the complete lifecycle of physical and digital assets — from procurement to retirement — across departments, employees, and locations.

> One platform to track, manage, and optimize every asset across your organization.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based login, role-based access, forgot-password with OTP, demo login |
| 📦 **Asset Lifecycle** | Register, allocate, transfer, return, and retire assets with full history |
| 🔧 **Maintenance** | Log and track maintenance tickets with status workflows |
| 📅 **Resource Booking** | Book shared resources (rooms, equipment) with conflict detection |
| 🏢 **Department & Employee Mgmt** | Manage org hierarchy, departments, and employee profiles |
| 🗂️ **Asset Categories** | Categorize assets with depreciation rates and type enumerations |
| 📊 **Dashboard & Reports** | Real-time KPIs, charts, and exportable reports |
| 🔔 **Notifications** | Smart in-app alerts for allocations, returns, and maintenance updates |
| 📋 **Audit Cycles** | Schedule and manage physical asset audits |
| 🗒️ **Activity Logs** | Complete audit trail of all system actions |

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Structure | HTML5 (Semantic) |
| Styling | Vanilla CSS (Design system with tokens, glassmorphism, animations) |
| Logic | Vanilla JavaScript (ES6+ modules) |
| Design | Dark mode, gradients, micro-animations, responsive layout |

### Backend
| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.2.4 |
| Security | Spring Security + JWT (JJWT 0.11.5) |
| ORM | Spring Data JPA / Hibernate |
| Database | MySQL (production) / H2 (local dev) |
| Validation | Hibernate Validator (JSR-380) |
| Build Tool | Maven |

---

## 📁 Project Structure

```
hakathon-frontend demo/
│
├── assetflow-frontend/               # Frontend (Vanilla HTML/CSS/JS)
│   ├── index.html                    # Login page
│   ├── dashboard.html                # Main dashboard
│   ├── signup.html                   # Registration page
│   ├── forgot-password.html          # Password recovery
│   │
│   ├── css/
│   │   ├── main.css                  # Core design system & variables
│   │   ├── components.css            # Reusable UI components
│   │   ├── animations.css            # Micro-animations & transitions
│   │   └── sidebar.css               # Navigation sidebar styles
│   │
│   ├── js/
│   │   ├── api.js                    # Centralized API client (fetch wrapper)
│   │   ├── auth.js                   # Authentication helpers
│   │   ├── utils.js                  # Shared utilities (Toast, validation, etc.)
│   │   ├── sidebar.js                # Sidebar navigation logic
│   │   ├── dashboard.js              # Dashboard charts & KPIs
│   │   ├── asset-directory.js        # Asset listing & filters
│   │   ├── asset-details.js          # Single asset view & timeline
│   │   ├── asset-registration.js     # Asset create/edit form
│   │   ├── categories.js             # Category management
│   │   ├── allocation.js             # Allocate / transfer assets
│   │   ├── return.js                 # Asset return workflow
│   │   ├── transfer.js               # Inter-department transfers
│   │   ├── maintenance.js            # Maintenance ticket management
│   │   ├── booking.js                # Resource booking calendar
│   │   ├── departments.js            # Department management
│   │   ├── employees.js              # Employee management
│   │   ├── audit.js                  # Audit cycle management
│   │   ├── activity-logs.js          # System activity log viewer
│   │   └── reports.js                # Reports & export
│   │
│   ├── audit/                        # Audit HTML pages
│   ├── booking/                      # Booking HTML pages
│   ├── logs/                         # Activity log HTML pages
│   ├── maintenance/                  # Maintenance HTML pages
│   ├── notifications/                # Notification HTML pages
│   ├── organization/                 # Department & employee HTML pages
│   ├── profile/                      # User profile HTML pages
│   ├── reports/                      # Report HTML pages
│   ├── settings/                     # Settings HTML pages
│   └── assets/                       # Static images, icons
│
└── assetflow-backend/                # Backend (Spring Boot)
    ├── pom.xml                       # Maven build configuration
    └── src/main/java/com/assetflow/backend/
        ├── BackendApplication.java   # Spring Boot entry point
        ├── config/                   # Security & CORS configuration
        ├── security/                 # JWT filter, UserDetailsService
        ├── models/                   # JPA entities
        │   ├── User.java
        │   ├── Asset.java
        │   ├── Allocation.java
        │   ├── Department.java
        │   ├── Category.java
        │   ├── Maintenance.java
        │   ├── Booking.java
        │   ├── Transfer.java
        │   ├── Audit.java / AuditItem.java
        │   ├── Notification.java
        │   ├── ActivityLog.java
        │   └── AssetReturn.java
        ├── controllers/              # REST API controllers
        │   ├── AuthController.java
        │   ├── AssetController.java
        │   ├── AllocationController.java
        │   ├── DashboardController.java
        │   ├── DepartmentController.java
        │   ├── EmployeeController.java
        │   ├── CategoryController.java
        │   ├── MaintenanceController.java
        │   ├── BookingController.java
        │   ├── TransferController.java
        │   ├── AuditController.java
        │   ├── NotificationController.java
        │   ├── ActivityLogController.java
        │   └── AssetReturnController.java
        ├── repositories/             # Spring Data JPA repositories
        └── payload/                  # Request/Response DTOs
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** (JDK) — [Download](https://adoptium.net/)
- **Maven 3.9+** — [Download](https://maven.apache.org/download.cgi)
- **MySQL 8+** (optional; H2 is used by default for local dev)
- Any modern browser (Chrome, Firefox, Edge)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/assetflow-erp.git
cd "hakathon-frontend demo"
```

---

### 2. Run the Backend

```bash
cd assetflow-backend
mvn spring-boot:run
```

The backend starts at **`http://localhost:8080`** by default using the **H2 in-memory database** — no setup required.

> **To use MySQL instead**, update `src/main/resources/application.properties`:
> ```properties
> spring.datasource.url=jdbc:mysql://localhost:3306/assetflow_db
> spring.datasource.username=root
> spring.datasource.password=yourpassword
> spring.jpa.hibernate.ddl-auto=update
> ```

---

### 3. Run the Frontend

The frontend is a static website — no build step needed. Simply open `assetflow-frontend/index.html` in your browser, or serve it with any static file server:

```bash
# Option A: Use VS Code Live Server extension (recommended)
# Right-click index.html → Open with Live Server

# Option B: Use Python
cd assetflow-frontend
python -m http.server 5500

# Option C: Use Node.js
npx serve .
```

Open **`http://localhost:5500`** in your browser.

---

### 4. Demo Login

On the login page, use the quick-access demo buttons:

| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@assetflow.io` | `Admin@123` |
| 👤 Employee | `emp@assetflow.io` | `Emp@1234` |

> Demo mode bypasses the API and mocks a valid JWT token client-side for fast exploration.

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

### 🔐 Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Login and receive JWT token |
| `POST` | `/auth/forgot-password` | Trigger OTP for password reset |
| `POST` | `/auth/logout` | Invalidate session token |

### 📦 Assets
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/assets` | List assets (paginated, filtered) |
| `POST` | `/assets` | Register a new asset |
| `GET` | `/assets/{id}` | Get asset details & history timeline |

### 👥 Users & Departments
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/employees` | List employees (`?page&size&search&status`) |
| `GET` | `/departments` | List departments |
| `POST` | `/departments` | Create department |
| `PUT` | `/departments/{id}` | Update department |

### 🔄 Allocations & Transfers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/allocations` | List allocations |
| `POST` | `/allocations` | Allocate asset to employee |
| `POST` | `/allocations/{id}/return` | Return asset to inventory |
| `GET` | `/transfers` | List inter-department transfers |
| `POST` | `/transfers` | Request an asset transfer |

### 🔧 Maintenance & Bookings
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/maintenance` | List maintenance tickets |
| `POST` | `/maintenance` | Report a new issue |
| `POST` | `/maintenance/{id}/complete` | Mark ticket as resolved |
| `GET` | `/bookings` | List resource bookings |
| `POST` | `/bookings` | Book a shared resource |

### 📊 Dashboard & Reports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/metrics` | KPIs: total assets, active allocations, etc. |
| `GET` | `/dashboard/charts` | Chart data: status distribution, trends |
| `GET` | `/reports/*` | Report data or PDF/Excel export |

### 🗒️ Audits & Logs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/audits` | List audit cycles |
| `GET` | `/activity-logs` | System activity history |
| `GET` | `/notifications` | User notifications |

---

### Standard Error Response

```json
{
  "timestamp": "2026-07-12T12:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Asset with ID 102 not found.",
  "path": "/api/v1/assets/102"
}
```

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| `ADMIN` | Full access: user management, all asset operations, system settings |
| `ASSET_MANAGER` | Asset lifecycle: register, allocate, transfer, maintenance |
| `DEPT_HEAD` | View department assets, approve transfer requests |
| `EMPLOYEE` | View own allocations, report maintenance issues, book resources |

---

## 🔄 Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

  [ Login / Signup ]
        │
        ▼
  [ Dashboard ]  ──► KPIs, Charts, Recent Activity
        │
        ├──► [ Asset Directory ]
        │         ├── Register New Asset
        │         ├── View Asset Details + Timeline
        │         └── Filter by Category / Status / Department
        │
        ├──► [ Allocations ]
        │         ├── Assign Asset → Employee
        │         ├── Transfer → Another Department
        │         └── Return Asset → Inventory
        │
        ├──► [ Maintenance ]
        │         ├── Report Issue (Ticket Created)
        │         ├── Track Status (Pending → In Progress → Completed)
        │         └── Log Maintenance Cost
        │
        ├──► [ Resource Bookings ]
        │         └── Book Shared Resources (Rooms, Equipment)
        │
        ├──► [ Organization ]
        │         ├── Manage Departments
        │         └── Manage Employees
        │
        ├──► [ Audits ]
        │         └── Schedule & Verify Physical Asset Audits
        │
        ├──► [ Reports ]
        │         └── Export Asset / Allocation / Maintenance Reports
        │
        └──► [ Notifications & Activity Logs ]
                  └── Real-time alerts & complete audit trail
```

---

## 🗄️ Database Schema (ERD Summary)

```
users ──────────────── departments
  │                        │
  │  (many-to-one)         │ (one-to-many)
  ▼                        ▼
allocations ────────── assets ──────── categories
  │                     │
  │                     ├── maintenance_tickets
  │                     ├── transfers
  │                     ├── audit_items
  │                     └── asset_returns
  │
  └── bookings
```

---

## 🔒 Security Architecture

- **Stateless JWT Authentication** — No server-side sessions
- **Token Expiry** — Short-lived access tokens
- **Role-Based Access Control (RBAC)** via `@PreAuthorize` annotations
- **CORS** configured for frontend origin
- **Password Hashing** via BCrypt
- **Global Exception Handler** (`@RestControllerAdvice`) for uniform error responses

---

## 🎨 Design System

The frontend uses a custom CSS design system with:
- **CSS Custom Properties** (variables) for consistent theming
- **Dark mode** first with indigo/violet accent palette (`#6366f1`)
- **Glassmorphism** cards with backdrop blur
- **Micro-animations** via `animations.css` (fade-up, stagger, skeleton loaders)
- **Responsive** layout with sidebar collapse on mobile

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the <strong>Odoo Hackathon 2026</strong>
  <br/>
  <sub>AssetFlow — Enterprise Asset Management, Simplified.</sub>
</p>
