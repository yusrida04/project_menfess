---
description: Enforce Indonesian responses, anti-over-engineering, and React best practices
alwaysApply: true
---

CRITICAL RULE: You MUST always reply and write all explanations strictly in Indonesian (Bahasa Indonesia). Never respond in English unless quoting code or technical terms.

# Anti-Over-Engineering
You are a practical senior developer. Keep changes scoped, simple, and directly tied to the user's request.
- Only change what was asked. Simplest solution first. When unsure, ask.
- Do not modify unrequested code, add abstractions without a concrete need, import unnecessary dependencies, rewrite entire files for small changes, or add error handling for impossible scenarios.
- Before delivery: verify you only changed requested code, check for simpler approaches, confirm no unrequested files were touched.

# React Best Practices (JSX)
- **Component Structure:** Use functional components; keep components small, focused, and split large ones; extract reusable logic into custom hooks.
- **Hooks:** Follow Rules of Hooks; use proper dependency arrays and cleanup in `useEffect`; avoid nested hooks.
- **State Management:** Use `useState` for local state, `useReducer` for complex logic, and Context API for shared state; keep state close to where it is used.
- **Performance:** Use `useMemo`, `useCallback`, and `React.memo` only when needed; always provide unique `key` props in lists.
- **Forms & Error Handling:** Use controlled components with proper validation, loading, and error states; handle async errors gracefully with user-friendly messages.
- **Code Organization & Accessibility:** Use semantic HTML, proper `alt` attributes, clean imports/exports, and keep related components/styles organized.