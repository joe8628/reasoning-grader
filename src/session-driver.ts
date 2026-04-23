import type { createOpencodeClient, Part } from "@opencode-ai/sdk"
import { TraceCollector } from "./collector.js"
import type { TaskDefinition, TurnTrace } from "./types.js"

type Client = ReturnType<typeof createOpencodeClient>

const DEFAULT_TIMEOUT_MS = 90_000

export const TASK_MODEL = { providerID: "opencode", modelID: "minimax-m2.5-free" }

// Collects parts from every assistant message in order, capturing tool calls
// and reasoning blocks that occur across multiple intermediate turns.
function allAssistantParts(msgs: { info: { role: string }; parts?: Part[] }[] | null | undefined): Part[] {
  return (msgs ?? [])
    .filter(m => m.info.role === "assistant")
    .flatMap(m => m.parts ?? [])
}

export class SessionDriver {
  constructor(private client: Client, private timeoutMs = DEFAULT_TIMEOUT_MS) {}

  async runTask(task: TaskDefinition, prompt: string, tmpDir: string | null): Promise<TurnTrace> {
    const { data: session } = await this.client.session.create({ body: {} })
    const collector = new TraceCollector(task.id)
    let timedOut = false

    try {
      await Promise.race([
        this.client.session.prompt({
          path: { id: session!.id },
          query: tmpDir ? { directory: tmpDir } : {},
          body: { model: TASK_MODEL, parts: [{ type: "text", text: prompt }] },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), this.timeoutMs)),
      ])
    } catch (err) {
      if ((err as Error).message !== "timeout") throw err
      timedOut = true
    }

    // always fetch messages — even on timeout the model may have produced partial output
    try {
      const { data: msgs } = await this.client.session.messages({
        path: { id: session!.id },
        query: { limit: 100 },
      })
      collector.onParts(allAssistantParts(msgs))
    } catch { /* ignore fetch failures during recovery */ }

    const trace = collector.flush()
    trace.timedOut = timedOut
    return trace
  }

  async runMultiPrompt(
    task: TaskDefinition,
    prompt1: string,
    prompt2: string,
    _injectAfter: number,
    tmpDir: string | null,
  ): Promise<TurnTrace[]> {
    const { data: session } = await this.client.session.create({ body: {} })
    const traces: TurnTrace[] = []
    const dir = tmpDir ? { directory: tmpDir } : {}

    // Turn 1: capture all assistant messages produced so far
    const c1 = new TraceCollector(task.id, 1)
    await this.client.session.prompt({
      path: { id: session!.id },
      query: dir,
      body: { model: TASK_MODEL, parts: [{ type: "text", text: prompt1 }] },
    })
    const { data: msgs1 } = await this.client.session.messages({ path: { id: session!.id }, query: { limit: 100 } })
    c1.onParts(allAssistantParts(msgs1))
    const turn1MsgCount = msgs1?.length ?? 0
    traces.push(c1.flush())

    // Turn 2: slice off turn 1's messages so only turn 2's assistant parts are collected
    const c2 = new TraceCollector(task.id, 2)
    await this.client.session.prompt({
      path: { id: session!.id },
      query: dir,
      body: { model: TASK_MODEL, parts: [{ type: "text", text: prompt2 }] },
    })
    const { data: msgs2 } = await this.client.session.messages({ path: { id: session!.id }, query: { limit: 100 } })
    c2.onParts(allAssistantParts(msgs2?.slice(turn1MsgCount)))
    traces.push(c2.flush())

    return traces
  }
}
