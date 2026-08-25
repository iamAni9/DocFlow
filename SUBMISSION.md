# DocFlow - Final Submission

<div align="center">
  <img src="frontend/public/logo_symbol.svg" width="100" alt="DocFlow Logo" />
  <h2>A Full-Stack Document Editor</h2>
</div>

---

## 🔗 Key Links

- **GitHub Repository**: [https://github.com/iamAni9/DocFlow](https://github.com/iamAni9/DocFlow)
- **Live Demo URL**: [https://docflowlite.vercel.app](https://docflowlite.vercel.app)

---

## 📁 Where to Find What (Repository Structure)

This project is built as a monorepo containing both the React frontend and the Fastify backend.

### 1. `backend/` (Fastify + Prisma + PostgreSQL)
Contains the REST API and database configuration.
- **`src/app.ts`**: Core Fastify server setup, CORS configuration, and route registrations.
- **`src/routes/`**:
  - `users.ts`: Handles creating, listing, and deleting users.
  - `documents.ts`: Handles CRUD operations for documents, file uploads, and the sharing/permissions logic.
- **`prisma/schema.prisma`**: The database schema defining the `User`, `Document`, and implicit many-to-many relationship for `sharedDocs`. 
- **`test/docs.test.ts`**: Integration tests (using `vitest`) covering the document creation and sharing flows.

### 2. `frontend/` (React + TypeScript + Vite)
Contains the single-page application and UI components.
- **`src/index.css`**: The core design system implemented entirely in native CSS variables, styling the app in a professional, Notion-esque light theme.
- **`src/components/`**:
  - `Login.tsx`: The authentication screen with user selection and creation.
  - `Dashboard.tsx`: The main workspace displaying owned and shared documents in a responsive, pastel-tinted card grid.
  - `Editor.tsx`: The core rich-text editing surface powered by Tiptap. Includes a real-time autocomplete dropdown for sharing documents with other users.
- **`src/contexts/`**:
  - `ToastContext.tsx`: A custom context providing a professional, non-blocking toast notification system.
  - `ConfirmContext.tsx`: A custom context providing an elegant modal for destructive actions.
- **`public/`**: Contains the generated logo files (`logo.svg`, `logo_symbol.svg`, `logo.jpg`).

### 3. Root Level Files
- **`README.md`**: Contains detailed local setup instructions, architectural decisions, and an overview of the AI workflow used to build the project.
- **`SUBMISSION.md`**: This file, outlining the project structure and links.

---

## 🚀 Key Features Highlight
1. **Rich Text Editing**: Bold, italic, underline, lists, and headings powered by Tiptap.
2. **Robust Persistence**: Fully integrated PostgreSQL database via Prisma ORM for Users and Documents.
3. **Smart Sharing System**: Real-time autocomplete dropdown to securely share documents between users.
4. **File Parsing**: Direct parsing of `.txt`, `.md`, and `.docx` into the editor via `@fastify/multipart`.
5. **Premium UX**: A completely custom, lightweight CSS architecture styled like Notion, complete with custom Toast notifications and smooth Confirm modals (no blocking browser alerts).
