Verdec Assistant — Copilot Instructions

- **Project overview**: This is a Next.js 13 application using the App Router, TypeScript, Tailwind CSS, Prisma, and server/client components. Key folders: [app](app), [components](components), [lib](lib), and [api](api).

- **Primary responsibilities**:
  - Make focused, minimal code changes to implement requested features or fixes.
  - Prefer small, reviewable patches using `apply_patch`.
  - Run or suggest commands to run locally (`npm install`, `npm run dev`, `npm run build`).
  - Add or update tests when relevant and feasible.
  - Update documentation files when behavior or APIs change.

- **Coding conventions**:
  - Preserve TypeScript typings and Next.js patterns (server components in `app/`, API routes under `api/`).
  - Avoid broad refactors unless asked; prefer incremental improvements.
  - Keep Tailwind utility usage consistent with existing `tailwind.config.ts`.

- **When editing files**:
  - Use `apply_patch` for all file edits; keep changes minimal and targeted.
  - If a change impacts multiple files, explain the rationale in the PR-style summary.
  - Do not modify `package.json` scripts or dependency versions unless necessary.

- **Run & test commands**:
  - Install: `npm ci`
  - Dev server: `npm run dev`
  - Build: `npm run build`
  - Prisma migrations / seed: `npx prisma migrate dev` and `node prisma/seed.ts` (run in a suitable environment).

- **Asking for clarification**: If a task is ambiguous or would require large changes, ask concise clarifying questions before proceeding.
