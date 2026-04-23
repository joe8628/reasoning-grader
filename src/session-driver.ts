import type { createOpencodeClient } from "@opencode-ai/sdk"
import { TraceCollector } from "./collector.js"
import type { TaskDefinition, TurnTrace } from "./types.js"

type Client = ReturnType<typeof createOpencodeClient>

const DEFAULT_TIMEOUT_MS = 90_000

export const TASK_MODEL = { providerID: "opencode", modelID: "minimax-m2.5-free" }

export class SessionDriver {
  constructor(private client: Client, private timeoutMs = DEFAULT_TIMEOUT_MS) {}

  async runTask(task: TaskDefinition, prompt: string, tmpDir: string | null): Promise<TurnTrace> {
    const { data: session } = await this.client.session.create({ body: {} })
    const collector = new TraceCollector(task.id)
    try {
      const run = this.client.session.prompt({
        path: { id: session!.id },
        query: tmpDir ? { directory: tmpDir } : {},
        body: {
          model: TASK_MODEL,
          parts: [{ type: "text", text: prompt }] },
      })
      const resp = await Promise.race([
        run,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), this.timeoutMs)),
      ])
      collector.onParts(resp.data?.parts ?? [])
    } catch {
      const trace = collector.flush()
      trace.timedOut = true
      return trace
    }
    return collector.flush()
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

    const c1 = new TraceCollector(task.id, 1)
    const r1 = await this.client.session.prompt({
      path: { id: session!.id },
      query: dir,
      body: { model: TASK_MODEL, parts: [{ type: "text", text: prompt1 }] },
    })
    c1.onParts(r1.data?.parts ?? [])
    traces.push(c1.flush())

    const c2 = new TraceCollector(task.id, 2)
    const r2 = await this.client.session.prompt({
      path: { id: session!.id },
      query: dir,
      body: { model: TASK_MODEL, parts: [{ type: "text", text: prompt2 }] },
    })
    c2.onParts(r2.data?.parts ?? [])
    traces.push(c2.flush())

    return traces
  }
}
