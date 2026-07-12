# AssetFlow ERP - Backend

AssetFlow is a modern, comprehensive Enterprise Asset & Resource Management System. This repository contains the **backend REST API**, built using Spring Boot.

## 🚀 Technologies Used
- **Java 21**
- **Spring Boot 3** (Web, Data JPA, Security)
- **MySQL Database**
- **JWT (JSON Web Tokens)** for secure stateless authentication
- **Lombok** for boilerplate reduction
- **Maven** for dependency management

## ✨ Key Features
- **Secure Authentication**: Role-based access control (Admin, Department Head, Employee).
- **Core Entities**: Full CRUD management for Departments, Asset Categories, Assets, and Employees.
- **Auto Data Seeding**: Automatically generates mock data (`sysadmin`, `departments`, `assets`) if the database is empty upon startup.
- **Global Error Handling**: Standardized API error responses across all controllers.
- **Pagination & Sorting**: Built-in support for large datasets using Spring Data JPA.

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone -b backend https://github.com/shivangparmar91-lgtm/Odoo_Hackathon-2026.git
   ```

2. **Configure Database:**
   Ensure you have a local MySQL server running on port `3306`.
   - The application is configured to use the `assetflow` database, and will automatically create it if it doesn't exist.
   - You can verify the connection settings in `src/main/resources/application.yml`.

3. **Run the Application:**
   Navigate to the backend directory and run the Spring Boot application using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The server will start on `http://localhost:8080`.*
