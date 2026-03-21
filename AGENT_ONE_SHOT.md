# One-shot prompt — run generation to completion

Copy the block below **in full** into a new Cursor chat (Agent mode) with this repository open. The agent should run steps **in order**, opening each task file on its own.

---

## Prompt (start copy)

You are working in the **GenTree** repository on the user’s machine.

1. Read **`AGENT_PLAYBOOK.md`** at the repo root — step order and stack are there.
2. Execute tasks from **`docs/agent-tasks/`** strictly in order: **01 → 02 → … → 09**.
3. For **each** `0N-*.md` file:
   - read goals, prerequisites, acceptance criteria;
   - implement code in the repository;
   - run the **Verification** section yourself (terminal commands);
   - fix all build/runtime errors **before** moving to the next number;
   - **do not** ask the user “continue?” — advance to the next file automatically.
4. If a step is **impossible** (environment blocker): create **`AGENT_BLOCKERS.md`** at the root with step number, symptom, and what you already tried; then stop.
5. After step 09: short report to the user — how to run (`npm run dev`), `.gentree.json` format, what the MVP includes.

Use subagents only if Cursor allows it **without losing** the overall plan; **do not** parallelize different steps 01–07 across branches without an explicit merge — prefer **one thread** until MVP is done.

## Prompt (end copy)

---

After the first run, keep **`AGENT_BLOCKERS.md`** in `.gitignore` or do not commit it — up to your team.
