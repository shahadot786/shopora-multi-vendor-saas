# 🧠 Full-Stack Learning Notes

> **Author:** MD. Shahadot Hossain  
> **Goal:** Build deep understanding across Backend, Frontend, and System Architecture using Nx Monorepo structure.  
> **Last Updated:** 2025-11-11

---

## 🗂️ 1. Monorepo & Nx

### 🔹 Overview

- What is a monorepo and why it’s used
- Nx features: caching, task orchestration, dependency graph

### 🔹 Key Concepts

- Nx Workspace structure
- Project generators
- `run-many` and `affected` commands
- Hot reload setup
- Environment handling

### 🔹 Code Snippets / Notes

```bash
npx nx generate @nx/express:application api-gateway
npx nx run-many --target=serve --all
```

---

## ⚙️ 2. Backend (Node.js + Express.js)

### 🔹 Core Concepts

- Request/Response cycle
- Middlewares (custom + built-in)
- Error handling patterns
- Asynchronous operations (async/await, Promises)

### 🔹 Important Tools

| Tool                   | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| **Express HTTP Proxy** | For routing API requests between services |
| **Express Rate Limit** | To prevent brute-force attacks            |
| **Morgan**             | HTTP request logging                      |
| **Redis**              | Caching & rate limit store                |
| **JWT**                | Authentication tokens                     |
| **Nodemailer**         | Email delivery system                     |
| **Cors**               | Cross-origin request handling             |
| **Cookie Parser**      | Parse cookies from headers                |
| **EJS**                | Templating for emails or SSR pages        |

### 🔹 Key Middleware Patterns

- `isAuthenticated`
- `errorHandler`
- `validateBody`
- `refreshTokenHandler`

### 🔹 Folder Structure Example

```
apps/
 └── api-gateway/
     ├── src/
     │   ├── middlewares/
     │   ├── controllers/
     │   ├── routes/
     │   ├── utils/
     │   ├── services/
     │   └── app.ts
```

### 🔹 Code Snippet

```ts
app.use("/api", isAuthenticated, apiRoutes);
```

---

## 🧩 3. Authentication & Tokens

### 🔹 Flow

- Access token (short-lived)
- Refresh token (long-lived)
- Redis for token blacklist/cache

### 🔹 Common Functions

- `generateAccessToken()`
- `generateRefreshToken()`
- `verifyToken()`
- `handleTokenRefresh()`

---

## 💾 4. Database Layer (Prisma + MongoDB)

### 🔹 Prisma Basics

- Schema definition
- CRUD operations
- Migrations

### 🔹 MongoDB Concepts

- Collections & documents
- Indexing
- Query optimization

### 🔹 Example

```ts
const user = await prisma.user.create({
  data: { name: "Shahadot", email: "example@gmail.com" },
});
```

---

## 🌐 5. Frontend (React + Next.js)

### 🔹 React Core

- JSX, Components, Props, State
- React Hook Form (validation, schema, dynamic fields)
- Tanstack Query (fetching, caching, mutation)

### 🔹 Next.js Concepts

- Pages, API Routes
- SSR, SSG, ISR
- Routing and Middleware

### 🔹 UI Tools

- Tailwind CSS (utility-first styling)
- React DOM (rendering)
- Axios (API calls)

### 🔹 Example

```tsx
const { register, handleSubmit } = useForm();
```

---

## 🧱 6. TypeScript + JS Foundation

### 🔹 TypeScript Concepts

- Interfaces, types, enums
- Generics
- tsconfig.json setup

### 🔹 JavaScript Concepts

- Scope, closure
- async/await
- ES6+ syntax

---

## 🛠️ 7. Tooling & Configurations

| Tool                       | Purpose                             |
| -------------------------- | ----------------------------------- |
| **Webpack**                | Module bundler                      |
| **Swagger Autogen**        | API documentation generation        |
| **tsconfig.json**          | TypeScript compiler settings        |
| **Nx.json / Project.json** | Build and run targets configuration |

---

## 🧰 8. Utilities & System Concepts

### 🔹 Proxy

- Why use proxy in microservices
- Setup with Express HTTP Proxy

### 🔹 Middleware Patterns

- `req.user` injection
- Global error handling
- Rate limiting middleware

### 🔹 Error Handling

- Status codes (200, 400, 401, 403, 500)
- `try/catch` with async functions

---

## 🚀 9. Sample API Flow

```plaintext
Client (React/Next)
  ↓
Axios → /api/auth/login
  ↓
Express Controller (authController)
  ↓
Service (authService)
  ↓
Prisma ORM → MongoDB
  ↓
Return JWT → Store in Cookie
```

---

## 📚 10. Notes & Insights

- Keep all services modular & independent
- Implement rate limiting + Redis caching early
- Always separate controllers, routes, and services
- Use `try/catch` + centralized error handler
- Use refresh token flow to keep users logged in

---

## 🧾 11. To-Learn Next

- WebSockets (Socket.io)
- Kafka or RabbitMQ (message queues)
- Docker + Deployment
- CI/CD pipeline
- Testing (Jest, Supertest)
