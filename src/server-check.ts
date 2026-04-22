import type { createOpencodeClient } from "@opencode-ai/sdk"

type Client = ReturnType<typeof createOpencodeClient>

const CHECK_TIMEOUT_MS = 3_000

export async function checkServer(client: Client, serverUrl: string): Promise<void> {
  const timeoutSignal = AbortSignal.timeout(CHECK_TIMEOUT_MS)
  try {
    await Promise.race([
      client.session.list({ query: {} }),
      new Promise<never>((_, reject) => {
        timeoutSignal.addEventListener("abort", () =>
          reject(new Error("timeout")))
      }),
    ])
  } catch {
    console.error(`Error: opencode server not reachable at ${serverUrl}`)
    console.error("Start opencode and try again.")
    process.exit(1)
  }
}
