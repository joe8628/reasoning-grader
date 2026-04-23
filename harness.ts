import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { homedir } from "os"
import { fileURLToPath } from "url"
import { randomUUID } from "crypto"
import * as readline from "readline"
import { createOpencodeServer, createOpencodeClient } from "@opencode-ai/sdk"
import { TaskRegistry } from "./src/registry.js"
import { FixtureManager } from "./src/fixture-manager.js"
import { SessionDriver, TASK_MODEL } from "./src/session-driver.js"
import { Grader, GRADER_MODEL } from "./src/grader.js"
import { ManualGrader } from "./src/manual-grader.js"
import { buildReport } from "./src/report.js"

const root = join(fileURLToPath(import.meta.url), "..")

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag: string) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : undefined
  }
  return {
    port: get("--port") !== undefined ? parseInt(get("--port")!, 10) : 4096,
    taskId: get("--task"),
    errorClass: get("--class") !== undefined ? parseInt(get("--class")!, 10) : undefined,
  }
}

function promptMenu(): Promise<"api" | "manual"> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(
      "\nGrading mode:\n  [1] API Grader (automatic)\n  [2] Manual Grader (markdown file)\nChoice [1/2]: ",
      answer => {
        rl.close()
        resolve(answer.trim() === "2" ? "manual" : "api")
      },
    )
  })
}

async function main() {
  const { port, taskId, errorClass } = parseArgs()
  const mode = await promptMenu()

  console.log(`\nStarting opencode server on port ${port} ...`)
  const server = await createOpencodeServer({ port })
  const client = createOpencodeClient({ baseUrl: server.url })

  try {
    const registry = new TaskRegistry(join(root, "tasks"))
    const fm = new FixtureManager(join(root, "fixtures"))
    const driver = new SessionDriver(client)

    let tasks = registry.all()
    if (errorClass !== undefined) tasks = registry.byClass(errorClass)
    if (taskId) tasks = [registry.getById(taskId)].filter(Boolean) as typeof tasks

    if (tasks.length === 0) {
      console.error("No tasks matched the given filters.")
      process.exit(1)
    }

    const runId = randomUUID()
    const outDir = join(homedir(), ".local/share/opencode/reasoning-grades", runId)
    mkdirSync(outDir, { recursive: true })

    const graderPromptPath = join(outDir, "grader-prompt.md")
    const grader = mode === "manual"
      ? new ManualGrader(graderPromptPath)
      : new Grader(client)

    console.log(`Run ID: ${runId}`)
    console.log(`Mode: ${mode === "manual" ? "manual grader" : "API grader"}`)
    console.log(`Running ${tasks.length} task(s) ...\n`)

    const results = []
    for (const task of tasks) {
      process.stdout.write(`  ${task.id} (${task.class_name}) ... `)
      const tmpDir = await fm.setup(task.fixture)
      const prompt = fm.injectPaths(task.prompt, tmpDir)
      const traces = task.multi_prompt
        ? await driver.runMultiPrompt(
            task, prompt,
            task.multi_prompt.second_prompt,
            task.multi_prompt.inject_after_tool_calls,
            tmpDir,
          )
        : [await driver.runTask(task, prompt, tmpDir)]
      for (const trace of traces) {
        console.log(`\n--- Trace for ${trace.taskId} (turn ${trace.turn}) ---`)
        console.log(`Tool calls: ${trace.toolCalls.length === 0 ? "(none)" : trace.toolCalls.map(t => t.tool).join(", ")}`)
        console.log(`Reasoning blocks: ${trace.thinkingBlocks.length === 0 ? "(none captured)" : trace.thinkingBlocks.length}`)
        if (trace.thinkingBlocks.length > 0) {
          trace.thinkingBlocks.forEach((block, i) =>
            console.log(`[block ${i + 1}]\n${block}`))
        }
        console.log("--- End trace ---\n")
        results.push(await grader.grade(trace, task))
      }
      await fm.teardown(tmpDir)
      const last = results[results.length - 1]
      console.log(mode === "manual" ? "RECORDED" : last.passed ? "PASS" : "FAIL")
    }

    if (mode === "manual") {
      console.log(`\nGrader prompt written to ${graderPromptPath}`)
    } else {
      const { jsonl, markdown } = buildReport(results, tasks, TASK_MODEL, GRADER_MODEL)
      writeFileSync(join(outDir, "grades.jsonl"), jsonl)
      writeFileSync(join(outDir, "report.md"), markdown)
      console.log(`\nReport written to ${outDir}`)
      console.log(`Passed: ${results.filter(r => r.passed).length}/${results.length}`)
    }
  } finally {
    server.close()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
