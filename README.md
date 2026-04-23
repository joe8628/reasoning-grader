# Reasoning Grader

A harness for evaluating AI agent reasoning traces against defined failure classes. Runs tasks through a model under test, then grades the resulting traces either automatically via API or manually via a generated markdown prompt.

## Requirements

- Node.js 20+
- [opencode](https://opencode.ai) installed and running (provides the model server)

## Setup

```bash
npm install
```

## Running

```bash
npx tsx harness.ts [options]
```

At startup, the harness prompts you to choose a grading mode:

```
Grading mode:
  [1] API Grader (automatic)
  [2] Manual Grader (markdown file)
Choice [1/2]:
```

### Options

| Flag | Description | Default |
|---|---|---|
| `--port <n>` | Port for the opencode server | `4096` |
| `--task <id>` | Run a single task by ID (e.g. `c1-t1`) | all tasks |
| `--class <n>` | Run all tasks for a failure class (e.g. `3`) | all classes |

### Examples

```bash
# Run all tasks with the API grader
npx tsx harness.ts

# Run a single task
npx tsx harness.ts -- --task c1-t1

# Run all class-3 tasks
npx tsx harness.ts -- --class 3

# Use a custom port
npx tsx harness.ts -- --port 8080
```

## Grading Modes

### API Grader (mode 1)

Grades each task trace automatically using `claude-opus-4-7` via the Anthropic API. Produces two output files per run:

- `grades.jsonl` — one JSON record per task with pass/fail, scores, and errors
- `report.md` — human-readable summary with per-class statistics and remediation recommendations for failures

### Manual Grader (mode 2)

Skips the API and writes a `grader-prompt.md` file instead. The file contains:

1. A system prompt instructing a grading agent on persona, objective, scoring rubric, and failure class definitions
2. One task block per task run, appended live as each task completes — containing the prompt, expected answer (oracle), reasoning blocks, tool calls, and final agent response

Feed this file to any capable model to perform the grading manually.

## Output

All output is written to:

```
~/.local/share/opencode/reasoning-grades/<run-id>/
```

## Models

| Role | Provider | Model |
|---|---|---|
| Model under test | opencode | `minimax-m2.5-free` |
| Grading model | anthropic | `claude-opus-4-7` |

To test a different model, change `TASK_MODEL` in `src/session-driver.ts`. To use a different grader, change `GRADER_MODEL` in `src/grader.ts`.

## Failure Classes

| Class | Name | Description |
|---|---|---|
| 1 | Coherence | Agent's conclusion contradicts its own reasoning |
| 2 | Premature commitment | Agent commits to an approach before reading all relevant files |
| 3 | Misattribution | Agent makes factual claims not supported by tool results |
| 4 | Dead-end loop | Agent repeats a failed approach without changing strategy |
| 5 | Scope drift | Agent modifies files outside the stated task scope |
| 6 | Uncertainty collapse | Agent presents a context-dependent answer as unconditional |
| 7 | Decomposition failure | Agent skips planning for a complex multi-file task |

## Type Checking

```bash
npm run typecheck
```
