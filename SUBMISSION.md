# Submission Documentation

This document outlines exactly what is included in this repository for the DocFlow full-stack document editor task.

## Repository Structure

### 1. `backend/`
The Fastify REST API and PostgreSQL database configuration.
- **`src/app.ts`**: Core Fastify server setup, CORS configuration, and route registration.
- **`src/server.ts`**: Entry point that starts the server on port 3001.
- **`src/routes/`**: Contains the REST API endpoints:
  - `users.ts`: Handles creating, listing, and deleting users.
  - `documents.ts`: Handles CRUD operations for documents, file uploads, and the sharing/permissions logic.
- **`prisma/`**: Contains the Prisma schema (`schema.prisma`) defining the `User`, `Document`, and implicit many-to-many relationship for `sharedDocs`. 
- **`test/`**: Contains `vitest` integration tests (e.g., `docs.test.ts`) covering the document creation and sharing flows.

### 2. `frontend/`
The React, TypeScript, and Vite single-page application.
- **`public/`**: Contains the generated logo files (`logo.svg`, `logo_symbol.svg`, `logo.jpg`).
- **`src/App.tsx`**: The main routing component and top navigation bar.
- **`src/index.css`**: The core design system implemented entirely in native CSS variables, styling the app in a professional, Notion-esque light theme.
- **`src/contexts/`**:
  - `ToastContext.tsx`: A custom context providing a professional, non-blocking toast notification system (replacing `alert()`).
  - `ConfirmContext.tsx`: A custom context providing an elegant modal for destructive actions (replacing `confirm()`).
- **`src/components/`**:
  - `Login.tsx`: The authentication screen with user selection and creation.
  - `Dashboard.tsx`: The main workspace displaying owned and shared documents in a responsive, pastel-tinted card grid.
  - `Editor.tsx`: The core rich-text editing surface powered by Tiptap. Includes an autocomplete dropdown for sharing documents with other users.

### 3. Root Files
- **`README.md`**: Contains detailed local setup instructions, architecture breakdown, and the AI workflow used to build the project.
- **`SUBMISSION.md`**: This file, detailing the project contents.

## Key Features Implemented
1. **Rich Text Editing**: Bold, italic, underline, lists, and headings powered by Tiptap.
2. **PostgreSQL Persistence**: Fully integrated database via Prisma ORM for Users and Documents.
3. **Sharing System**: Real-time autocomplete dropdown to securely share documents between users.
4. **File Upload**: Direct parsing of `.txt`, `.md`, and `.docx` into the editor via `@fastify/multipart`.
5. **Premium UX**: A completely custom, lightweight CSS architecture styled like Notion, complete with Toast notifications and smooth Confirm modals.
