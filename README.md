# DocFlow: Full Stack Document Editor

DocFlow is a full-stack document editing application built with a modern technology stack, featuring real-time autosave, rich-text editing, and a premium UI.

## 1. Local Setup and Run Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase (or any PostgreSQL instance) for the database. Note: The Prisma schema has been configured to use `@prisma/adapter-pg` with a PostgreSQL backend.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with your `DATABASE_URL` (pointing to your Postgres/Supabase instance).
4. Push the Prisma schema to the database:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
The backend will run on `http://localhost:3001`.

### Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
The frontend will run on `http://localhost:5173`.

### Testing
To run the automated tests for the core business logic:
```bash
cd backend
npx vitest
```

---

## 2. Architecture

- **Frontend**: Built with **React, TypeScript, and Vite**. The UI is styled strictly with native CSS utilizing CSS variables to emulate a professional, light-themed Notion-like workspace. It completely avoids bloated UI component libraries, opting instead for a fast, custom design system.
- **Rich Text Editor**: Uses **Tiptap** (headless wrapper for ProseMirror). It is lightweight, highly extensible for React, and styled seamlessly into the canvas.
- **Backend**: Built with **Fastify and TypeScript**. Fastify was chosen for its high performance and low overhead compared to Express.
- **Database**: **PostgreSQL** via **Prisma ORM** (using Prisma 7 with the Supabase pg adapter). It provides robust relational data handling for Users, Documents, and Sharing permissions.
- **File Upload**: Handled via `@fastify/multipart`. Supports uploading `.txt`, `.md`, and `.docx` files and parsing their content.

---

## 3. AI Workflow

This project was built with the proper architecure setup and selective use of AI assistant. The workflow consisted of the following key phases:

1. **Initial Scaffold & Debugging**: 
   - The AI was instructed to work on the required codebase and set up an entrypoint for backend and React frontend. 
   - Encountered CORS issues blocking `PUT` and custom `x-user-id` headers. The AI diagnosed this by reading the network error logs and updated the `fastify-cors` configuration to properly handle preflight `OPTIONS` requests.
   - Addressed Prisma validation errors (P1012) by correctly configuring `prisma.config.ts` for Prisma 7+ and switching the database provider to PostgreSQL for Supabase compatibility.

2. **UI/UX Overhaul (Notion Aesthetic)**:
   - The AI was provided a comprehensive design analysis document of Notion.
   - It autonomously generated a frontend implementation plan to strip out the old dark/glassmorphism UI and replace it with a light, editorial design system.
   - Using native CSS variables in `index.css`, the AI restyled the Login, Dashboard, and Editor components to feature clean cards, ghost buttons, and pastel-tinted grids.
   - The AI utilized the `generate_image` tool to create a custom logo based on user requirements, embedded it into the `public` directory, and updated the header UI.

3. **Refining the User Experience**:
   - The AI was instructed to replace blocking native browser `alert()` and `confirm()` popups.
   - It built custom `ToastContext` and `ConfirmContext` providers from scratch, updating all 15+ occurrences across the app with sleek, non-blocking UI components.
   - Improved the Document Sharing UX by replacing a manual text input with a real-time autocomplete dropdown that filters the available users in the database as the user types.
