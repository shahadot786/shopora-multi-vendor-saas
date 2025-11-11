# 🛍️ Shopora — Full Stack eCommerce Platform

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer">
  <img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45" />
</a>

Shopora is a **modern full-stack eCommerce platform** built using an **Nx monorepo** architecture.  
It integrates multiple services — such as authentication, product management, and order processing — under a single scalable workspace.

---

## 🚀 Tech Stack Overview

### 🧩 Backend

- **Node.js + Express.js**
- **Prisma ORM + MongoDB**
- **JWT Authentication**
- **Redis** (caching & rate limiting)
- **Nodemailer** (email service)

### 💻 Frontend

- **React / Next.js**
- **React Hook Form** for forms
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **Axios** for API calls

### ⚙️ Dev Tools

- **Nx Monorepo** for code organization
- **TypeScript** for static typing
- **Swagger Autogen** for API documentation
- **Webpack** for builds

---

## 🧱 Project Structure

```bash
apps/
 ├── api-gateway/       # Main Express API gateway
 ├── auth-service/      # Authentication microservice
 ├── product-service/   # Product & category management
 ├── order-service/     # Orders & payments
 └── web/               # Frontend (Next.js or React app)

libs/
 ├── shared/            # Shared utilities, types, and constants
 └── ui/                # Shared React components
```

---

## 🧰 Commands

Run the development server for any app:

```bash
npx nx serve <app-name>
```

Build an app for production:

```bash
npx nx build <app-name>
```

View dependency graph:

```bash
npx nx graph
```

List available tasks for a project:

```bash
npx nx show project <project-name>
```

---

## 🧑‍💻 Development Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set environment variables**
   Create `.env` files for each service inside their respective `apps/<service>` folder.

3. **Run the backend services**

   ```bash
   npx nx serve auth-service
   npx nx serve api-gateway
   ```

4. **Run the frontend**
   ```bash
   npx nx serve web
   ```

---

## 🗓️ Regular Update Pattern

Log ongoing progress and features:

### ✅ Completed Features

- [x] Authentication & Authorization (JWT + Refresh Token)
- [x] User Registration & Email Verification
- [x] Seller Registration & Email Verification
  <!-- - [x] Product CRUD + Pagination -->
  <!-- - [x] Cart & Checkout Flow -->

### 🚧 In Progress

- [ ] Admin Dashboard (Sales Analytics)
- [ ] Payment Gateway Integration

### 🧩 Upcoming

- [ ] Real-time Order Tracking (WebSocket)
- [ ] Product Recommendation Engine
- [ ] CI/CD Pipeline Integration

---

## 🧾 Notes

- Keep your services modular and independent.
- Use Redis for caching + rate limiting.
- Update this file regularly to track project growth and structure.

---

## 📚 Useful Nx Commands

| Command                                  | Description                          |
| ---------------------------------------- | ------------------------------------ |
| `npx nx graph`                           | Visualize workspace dependency graph |
| `npx nx run-many --target=serve --all`   | Run all apps simultaneously          |
| `npx nx build-many --target=build --all` | Build all projects                   |
| `npx nx list`                            | List installed Nx plugins            |

---

## 🤝 Contributing

To add new projects, use Nx generators:

```bash
npx nx g @nx/node:app new-service
npx nx g @nx/react:app new-frontend
```

For libraries:

```bash
npx nx g @nx/js:lib shared-utils
```

---

## 🧠 Learn More

- [Nx Documentation](https://nx.dev)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Prisma ORM Docs](https://www.prisma.io/docs)
- [MongoDB Docs](https://www.mongodb.com/docs/)

---

**Author:** MD. Shahadot Hossain  
**Last Updated:** 2025-11-11
