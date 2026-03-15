import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { runAgent } from "./agent.js";

// Load .env using an absolute path derived from this file's location,
// so it works regardless of which directory the user runs `node` from.
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const raw = readFileSync(join(__dirname, "../.env"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  // .env is optional — user may have set env vars another way
}

// Example tasks that demonstrate multi-step tool use
const examples = [
  {
    title: "Multi-step math",
    prompt: "Calculate (25 * 4) + (100 / 5), then multiply the result by 3."
  },
  {
    title: "Weather + calculation",
    prompt: "What's the weather like in Beijing and Shanghai? Also tell me the average temperature between the two cities."
  },
  {
    title: "Search + save note",
    prompt: "Search for information about 'Claude AI', then save a brief summary as a note with key 'claude_summary'. Finally, retrieve that note to confirm it was saved."
  }
];

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Error: ANTHROPIC_API_KEY environment variable is not set.");
    console.error("   Either add it to .env or run: export ANTHROPIC_API_KEY=your_key");
    process.exit(1);
  }

  // Pick which example to run via CLI arg, default to first
  const exampleIndex = parseInt(process.argv[2] ?? "0", 10);
  const example = examples[exampleIndex] ?? examples[0];

  console.log(`\nRunning example ${exampleIndex}: "${example.title}"`);

  try {
    const result = await runAgent(example.prompt);
    console.log(`\nCompleted in ${result.iterations} iteration(s).`);
  } catch (err) {
    console.error("\n❌ Agent error:", err.message);
    process.exit(1);
  }
}

main();
