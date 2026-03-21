# AI-assisted development

This repository was designed so an **autonomous coding agent** can implement or extend the app by following **numbered task files** and a single **playbook**.

## Entry points for humans and agents

- **[AGENT_PLAYBOOK.md](../AGENT_PLAYBOOK.md)** — fixed stack, strict order of tasks `01` → `09`, and rules for non-stop runs vs blockers.
- **[AGENT_ONE_SHOT.md](../AGENT_ONE_SHOT.md)** — copy-paste prompt to start a long Cursor session that walks the task list.
- **`docs/agent-tasks/`** — one markdown file per step with goals, acceptance criteria, and verification commands.

## Forking and extending

You can fork this repo and:

- Continue from the last completed task, or
- Replace the task list with your own roadmap while keeping [docs/CURSOR_REPO_GUIDE.md](CURSOR_REPO_GUIDE.md) updated so tools (and humans) know where logic lives.

## Cursor-specific help

For day-to-day edits, the repository includes **[docs/CURSOR_REPO_GUIDE.md](CURSOR_REPO_GUIDE.md)** and a Cursor rule under **`.cursor/rules/`** so agents are nudged to read that guide before structural changes.
