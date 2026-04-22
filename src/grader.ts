import type { createOpencodeClient, TextPart, Part } from "@opencode-ai/sdk"
import type { TurnTrace, TaskDefinition, GradeResult } from "./types.js"

type Client = ReturnType<typeof createOpencodeClient>

const SYSTEM = `You are a reasoning quality grader. Given a task definition and an agent's reasoning trace, evaluate the trace against the target failure class.

Return ONLY valid JSON (no markdown fences) matching this schema:
{ "passed": boolean, "scores": { "coherence": 1-5, "decomposition": 1-5, "tool_grounding": 1-5, "uncertainty_handling": 1-5, "efficiency": 1-5 }, "errors": [{ "type": string, "severity": "low"|"medium"|"high", "excerpt": string }], "oracle_delta": string, "summary": string }

- passed=true means the target failure did NOT occur (agent behaved correctly)
- oracle_delta: one sentence describing the gap between agent output and the oracle answer
- Grade strictly against the grade_signal.look_for field
- Do not call any tools. Do not read any files.`

export class Grader {
  constructor(private client: Client) {}

  async grade(trace: TurnTrace, task: TaskDefinition): Promise<GradeResult> {
    const toolsSummary = trace.toolCalls.map(t => t.tool).join(", ") || "none"
    const thinkingSummary = trace.thinkingBlocks.join("\n---\n") || "(no thinking blocks)"
    const userMsg = [
      `TASK ID: ${task.id}`,
      `CLASS: ${task.class_name}`,
      `ORACLE: ${task.oracle}`,
      `TARGET_FAILURE: ${task.target_failure}`,
      `GRADE_SIGNAL: ${JSON.stringify(task.grade_signal)}`,
      ``,
      `TRACE:`,
      `thinking:\n${thinkingSummary}`,
      `tools_called: ${toolsSummary}`,
      `final_response: ${trace.finalResponse}`,
    ].join("\n")

    const { data: session } = await this.client.session.create({ body: {} })
    const { data: resp, error } = await this.client.session.prompt({
      path: { id: session!.id },
      body: { system: SYSTEM, parts: [{ type: "text", text: userMsg }] },
    })

    if (error) throw new Error(`Grader prompt failed: ${JSON.stringify(error)}`)
    const raw = (resp?.parts?.find((p: Part) => p.type === "text") as TextPart | undefined)?.text
    if (!raw) throw new Error("Grader returned no text content")
    const jsonMatch = raw.match(/```json\n?([\s\S]+?)\n?```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : raw
    const parsed = JSON.parse(jsonStr.trim())
    return { taskId: task.id, targetClass: task.class_name, ...parsed }
  }
}
