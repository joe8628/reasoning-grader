import { createHash } from "crypto"
import type { Part, ReasoningPart, TextPart, ToolPart } from "@opencode-ai/sdk"
import type { TurnTrace } from "./types.js"

export type { Part }

export class TraceCollector {
  private thinkingBlocks: string[] = []
  private toolCalls: TurnTrace["toolCalls"] = []
  private finalResponse = ""

  constructor(private taskId: string, private turn = 1) {}

  onParts(parts: Part[]) {
    for (const part of parts) {
      if (part.type === "reasoning") {
        this.thinkingBlocks.push((part as ReasoningPart).text)
      } else if (part.type === "text") {
        const tp = part as TextPart
        if (tp.text && !tp.synthetic) this.finalResponse += tp.text
      } else if (part.type === "tool") {
        const tp = part as ToolPart
        const argsHash = createHash("sha256")
          .update(JSON.stringify(tp.state?.input ?? {}))
          .digest("hex")
          .slice(0, 8)
        const resultSummary =
          tp.state?.status === "completed" ? tp.state.output.slice(0, 200) : ""
        this.toolCalls.push({ tool: tp.tool, argsHash, resultSummary })
      }
    }
  }

  flush(): TurnTrace {
    return {
      taskId: this.taskId,
      turn: this.turn,
      thinkingBlocks: this.thinkingBlocks,
      toolCalls: this.toolCalls,
      finalResponse: this.finalResponse,
      tokensThinking: 0,
      tokensOutput: 0,
    }
  }
}
