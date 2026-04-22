import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { homedir } from "os"
import { fileURLToPath } from "url"
import { createOpencodeServer, createOpencodeClient } from "@opencode-ai/sdk"
import { TaskRegistry } from "./src/registry.js"
import { FixtureManager } from "./src/fixture-manager.js"
import { SessionDriver } from "./src/session-driver.js"
import { Grader } from "./src/grader.js"
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

async function main() {
  const { port, taskId, errorClass } = parseArgs()

  console.log(`Starting opencode server on port ${port} ...`)
  const server = await createOpencodeServer({ port })
  const client = createOpencodeClient({ baseUrl: server.url })

  try {
    const registry = new TaskRegistry(join(root, "tasks"))
    const fm = new FixtureManager(join(root, "fixtures"))
    const driver = new SessionDriver(client)
    const grader = new Grader(client)

    let tasks = registry.all()
    if (errorClass !== undefined) tasks = registry.byClass(errorClass)
    if (taskId) tasks = [registry.getById(taskId)].filter(Boolean) as typeof tasks

    if (tasks.length === 0) {
      console.error("No tasks matched the given filters.")
      process.exit(1)
    }

    console.log(`Running ${tasks.length} task(s) ...`)

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
      for (const trace of traces) results.push(await grader.grade(trace, task))
      await fm.teardown(tmpDir)
      const last = results[results.length - 1]
      console.log(last.passed ? "PASS" : "FAIL")
    }

    const { jsonl, markdown } = buildReport(results, tasks)
    const outDir = join(
      homedir(),
      ".local/share/opencode/reasoning-grades",
      new Date().toISOString().slice(0, 10),
    )
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, "grades.jsonl"), jsonl)
    writeFileSync(join(outDir, "report.md"), markdown)

    console.log(`\nReport written to ${outDir}`)
    console.log(`Passed: ${results.filter(r => r.passed).length}/${results.length}`)
  } finally {
    server.close()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
