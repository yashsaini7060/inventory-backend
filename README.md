# Inventory Management Backend

## Overview

This is a comprehensive backend for an Inventory Management System built with **Node.js**, **Express.js**, and **MongoDB**. The system supports multiple user roles with granular permissions.

---

## Features

- **User Authentication** (SuperAdmin, Admin, User)
- **Inventory Management**
- **Order Processing**
- **Dispatch Order Tracking**
- **Comprehensive Audit Logging**

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose)
- **JSON Web Token (JWT)** for Authentication
- **Bcrypt** for Password Hashing

---

## Prerequisites

- **Node.js** (v16+)
- **MongoDB** (v4.4+)
- **npm** or **yarn**

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://your-repo-url.git
   cd inventory-management-backend
   ```

2. **Install dependencies**\
   Using npm:

   ```bash
   npm install
   ```

   Or, using yarn:

   ```bash
   yarn install
   ```

3. **Create ********************`.env`******************** file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in the `.env` file.

5. **Start the server**

   - Development mode:
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

---

## User Roles and Permissions

### SuperAdmin

- Full system access
- Manage user roles and permissions
- Create/Update/Delete inventory items
- Full access to orders and dispatch orders

### Admin

- Add and manage inventory items
- Create and manage orders
- Manage dispatch orders
- Grant specific permissions to users

### User

- Create orders (with specific permissions)
- View inventory and orders
- Limited access based on admin-granted permissions

---

## API Endpoints

### Authentication

- **POST** `/api/users/register`
- **POST** `/api/users/login`
- **GET** `/api/users/profile`

### Inventory

- **POST** `/api/inventory` (Admin/SuperAdmin)
- **PATCH** `/api/inventory/:id` (Admin/SuperAdmin)
- **DELETE** `/api/inventory/:id` (SuperAdmin)
- **GET** `/api/inventory`

### Orders

- **POST** `/api/orders`
- **PATCH** `/api/orders/:id/status`
- **GET** `/api/orders`
- **GET** `/api/orders/:id`

### Dispatch Orders

- **POST** `/api/dispatch`
- **PATCH** `/api/dispatch/:id`
- **GET** `/api/dispatch`

---

## Testing

Run tests with:

```bash
npm test
```

---

## Security Considerations

- Passwords are hashed using **bcrypt**
- **JWT** is used for secure authentication
- Role-based access control ensures proper authorization
- Comprehensive error handling for secure and robust operations
- Transaction support ensures data integrity

---

## Logging

- Uses **Winston** for comprehensive logging and tracking.

---

### License

This project is licensed under [Your Preferred License].

