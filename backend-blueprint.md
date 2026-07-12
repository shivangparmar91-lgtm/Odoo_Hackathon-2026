# AssetFlow - Backend Blueprint

As requested in the Master Prompt, no Java/Spring Boot code has been generated. Below is the comprehensive architecture and database blueprint designed for the **AssetFlow – Enterprise Asset & Resource Management System**.

## 1. System Architecture

The backend will be built as a RESTful API using **Java 21** and **Spring Boot 3.2+**.
It will follow a standard N-Tier architecture:
*   **Presentation Layer:** Spring Web MVC (`@RestController`) handles incoming HTTP requests, performs input validation (Hibernate Validator), and returns structured JSON responses.
*   **Service Layer:** Business logic resides here (`@Service`). Transactions are managed at this level (`@Transactional`).
*   **Data Access Layer:** Spring Data JPA (`@Repository`) provides database abstraction and querying capabilities.
*   **Security Layer:** Spring Security with JWT (JSON Web Tokens) for stateless authentication and Role-Based Access Control (RBAC).

## 2. Core Dependencies (Maven)

*   `spring-boot-starter-web`: REST endpoints, Tomcat server.
*   `spring-boot-starter-data-jpa`: Hibernate, data persistence.
*   `spring-boot-starter-security`: Authentication and Authorization.
*   `spring-boot-starter-validation`: JSR-380 validation.
*   `mysql-connector-j`: MySQL database driver.
*   `lombok`: Boilerplate reduction.
*   `jjwt-api`, `jjwt-impl`, `jjwt-jackson`: JWT token generation and validation.

## 3. Database Design (Entity Relationships)

The relational database schema is designed for MySQL.

### Core Entities:
1.  **Users / Employees (`users` table):**
    *   `id` (PK), `first_name`, `last_name`, `email` (Unique), `password_hash`, `role` (Enum: ADMIN, ASSET_MANAGER, DEPT_HEAD, EMPLOYEE), `department_id` (FK).
2.  **Departments (`departments` table):**
    *   `id` (PK), `name`, `code`, `head_employee_id` (FK to users).
3.  **Asset Categories (`categories` table):**
    *   `id` (PK), `name`, `type` (Enum: HARDWARE, SOFTWARE, etc.), `depreciation_rate`.
4.  **Assets (`assets` table):**
    *   `id` (PK), `asset_tag` (Unique), `name`, `category_id` (FK), `status` (Enum: AVAILABLE, ALLOCATED, IN_MAINTENANCE, RETIRED), `condition`, `purchase_cost`, `purchase_date`.
5.  **Allocations (`allocations` table):**
    *   `id` (PK), `asset_id` (FK), `user_id` (FK), `assigned_date`, `return_date`, `status` (Enum: ACTIVE, RETURNED).
6.  **Maintenance Tickets (`maintenance_tickets` table):**
    *   `id` (PK), `ticket_id` (Unique), `asset_id` (FK), `reported_by` (FK to users), `issue_type`, `description`, `status` (Enum: PENDING, IN_PROGRESS, COMPLETED), `cost`.
7.  **Resource Bookings (`bookings` table):**
    *   `id` (PK), `resource_name`, `user_id` (FK), `start_time`, `end_time`, `purpose`, `status`.

## 4. Security & Authentication

*   **Login Flow:** Client sends POST `/api/v1/auth/login` with email/password. Server validates and returns a JWT token.
*   **Authorization:** The `Authorization: Bearer <token>` header is required for all protected endpoints.
*   **Role-Based Access:** 
    *   `@PreAuthorize("hasRole('ADMIN')")` for sensitive operations like user management.
    *   `@PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")` for asset lifecycle operations.

## 5. API Endpoint Design

### Authentication
*   `POST /api/v1/auth/login` - Authenticate and get JWT.
*   `POST /api/v1/auth/forgot-password` - Trigger OTP generation.

### Users & Departments
*   `GET /api/v1/users` - List all employees (supports search/filter).
*   `GET /api/v1/departments` - List departments.
*   `POST /api/v1/departments` - Create a department.

### Asset Lifecycle
*   `POST /api/v1/assets` - Register a new asset (supports multipart file upload for photos).
*   `GET /api/v1/assets` - Retrieve asset directory (paginated, sorted, filtered).
*   `GET /api/v1/assets/{id}` - Retrieve detailed asset information and timeline.
*   `POST /api/v1/assets/{id}/allocate` - Allocate asset to user.
*   `POST /api/v1/assets/{id}/return` - Return asset to inventory.

### Maintenance & Audits
*   `POST /api/v1/maintenance` - Report an issue.
*   `PATCH /api/v1/maintenance/{id}/status` - Update ticket status.
*   `GET /api/v1/audits` - List audit cycles.

### Dashboard & Reports
*   `GET /api/v1/dashboard/metrics` - High-level KPIs (Total Assets, Active Allocations).
*   `GET /api/v1/dashboard/charts` - Data for charting (Status distribution, monthly activity).

## 6. Exception Handling

Implement a `@RestControllerAdvice` to handle exceptions globally and return standard JSON error responses (e.g., standardizing 400 Bad Request for validation errors, 404 Not Found, 401 Unauthorized, and 403 Forbidden).

```json
{
  "timestamp": "2024-03-24T12:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Asset with ID 102 not found.",
  "path": "/api/v1/assets/102"
}
```
