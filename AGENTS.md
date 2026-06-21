**Verdec Assistant**

- **Purpose**: Project-specific AI assistant for the Verdec Next.js application. Helps with code changes, reviews, debugging, tests, and developer workflows.
- **Location of instructions**: [copilot-instructions.md](copilot-instructions.md)
- **Agent metadata**: [.agent.md](.agent.md)

- **Capabilities**:
  - Apply focused code changes using `apply_patch`.
  - Run and suggest tests and local run commands for Next.js/TypeScript.
  - Read and summarize files, suggest refactors, and update documentation.
  - Respect repository conventions (TypeScript, Next 13 app router, Tailwind).

- **How to invoke**: Ask the Copilot Chat to "Act as Verdec Assistant" or reference this repository.

- **Examples**:
  - "Verdec Assistant: add server-side caching to `/api/products/route.ts`."
  - "Verdec Assistant: create unit tests for `lib/product-extras.ts`."
