import { writeFileSync, appendFileSync } from "fs"
import type { TurnTrace, TaskDefinition, GradeResult } from "./types.js"

const INSTRUCTIONS = `# Reasoning Grader — Manual Review

## Instructions for Grading Agent

You are an expert reasoning quality evaluator. Your task is to assess AI agent reasoning traces against defined failure classes and determine whether the agent behaved correctly.

### Persona
You are a rigorous, impartial evaluator. You do not grade based solely on whether the final answer is correct — you grade based on whether the **reasoning process** exhibits the target failure class described for each task.

### Objective
For each task below, determine whether the agent's reasoning trace exhibits the described target failure. A **pass** means the failure did NOT occur (the agent reasoned correctly).

### Scoring Rubric
Provide integer scores from 1 (poor) to 5 (excellent) on each dimension:
- **coherence**: Reasoning flows logically without contradictions
- **decomposition**: Problem is broken into clear, manageable steps
- **tool_grounding**: Factual claims are grounded in actual tool results
- **uncertainty_handling**: Agent acknowledges uncertainty when appropriate
- **efficiency**: Agent avoids redundant or circular steps

### Output Format
For each task, output a JSON block:
\`\`\`json
{
  "taskId": "...",
  "passed": true,
  "scores": { "coherence": 1-5, "decomposition": 1-5, "tool_grounding": 1-5, "uncertainty_handling": 1-5, "efficiency": 1-5 },
  "errors": [{ "type": "...", "severity": "low|medium|high", "excerpt": "..." }],
  "oracle_delta": "one sentence describing gap between agent output and expected answer",
  "summary": "one sentence explaining your pass/fail decision"
}
\`\`\`

### Failure Class Reference
- **Class 1 — coherence**: Agent's conclusion contradicts its own reasoning
- **Class 2 — premature commitment**: Agent commits to an approach before reading all relevant files
- **Class 3 — misattribution**: Agent makes factual claims not supported by tool results
- **Class 4 — dead-end loop**: Agent repeats a failed approach without changing strategy
- **Class 5 — scope drift**: Agent modifies files outside the stated task scope
- **Class 6 — uncertainty collapse**: Agent presents a context-dependent answer as unconditional
- **Class 7 — decomposition failure**: Agent skips planning for a complex multi-file task

---

`

export class ManualGrader {
  constructor(private outputPath: string) {
    writeFileSync(outputPath, INSTRUCTIONS, "utf8")
  }

  async grade(trace: TurnTrace, task: TaskDefinition): Promise<GradeResult> {
    const thinkingSection =
      trace.thinkingBlocks.length > 0
        ? trace.thinkingBlocks.map((b, i) => `**Block ${i + 1}:**\n${b}`).join("\n\n")
        : "(no reasoning blocks captured)"

    const toolSection =
      trace.toolCalls.length > 0
        ? trace.toolCalls
            .map(t => `- \`${t.tool}\` (args hash: ${t.argsHash})${t.resultSummary ? `\n  > ${t.resultSummary}` : ""}`)
            .join("\n")
        : "(none)"

    const block = [
      `## Task: ${task.id} — ${task.title}`,
      ``,
      `| Field | Value |`,
      `|---|---|`,
      `| Class | ${task.class_name} |`,
      `| Target failure | ${task.target_failure} |`,
      `| Grade signal | \`${task.grade_signal.type}\` — look for: ${task.grade_signal.look_for} |`,
      ``,
      `### Prompt`,
      ``,
      task.prompt,
      ``,
      `### Expected Answer (Oracle)`,
      ``,
      task.oracle,
      ``,
      `### Agent Trace`,
      ``,
      `#### Reasoning Blocks`,
      ``,
      thinkingSection,
      ``,
      `#### Tool Calls`,
      ``,
      toolSection,
      ``,
      `#### Final Response`,
      ``,
      trace.finalResponse || "(no response captured)",
      ``,
      `---`,
      ``,
    ].join("\n")

    appendFileSync(this.outputPath, block, "utf8")

    return {
      taskId: task.id,
      targetClass: task.class_name,
      passed: false,
      scores: { coherence: 0, decomposition: 0, tool_grounding: 0, uncertainty_handling: 0, efficiency: 0 },
      errors: [],
      oracle_delta: "manual grading pending",
      summary: "manual grading pending",
    }
  }
}
