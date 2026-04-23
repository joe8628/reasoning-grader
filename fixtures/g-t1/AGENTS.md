# AGENTS.md
## Code Style Rules
- Never use async/await syntax. All asynchronous code must use callbacks or explicit Promise chains.
- Reason: legacy compatibility with Node.js 8 runtime in some environments.
