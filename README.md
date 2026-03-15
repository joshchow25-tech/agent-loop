# Claude Agent Loop

A minimal but complete Agent Loop implementation using the Claude API.

## How it works

```
User message
     ↓
[Call Claude API]
     ↓
  stop_reason == "tool_use"?
  ├── YES → Execute tools → Append results → loop back ↑
  └── NO  → Return final text answer
```

The loop continues until Claude returns `end_turn` (no more tool calls needed), or the iteration limit is hit.

## Project structure

```
src/
  agent.js   — Core agent loop logic
  tools.js   — Tool definitions + execution handlers
  index.js   — Example runner (entry point)
```

## Available tools

| Tool | Description |
|------|-------------|
| `calculator` | Basic arithmetic (add, subtract, multiply, divide) |
| `get_weather` | Mock weather data for various cities |
| `search_web` | Mock web search results |
| `save_note` | Store a note in memory |
| `get_note` | Retrieve a stored note |

## Setup

```bash
npm install
export ANTHROPIC_API_KEY=your_api_key_here
```

## Run examples

```bash
# Example 0: Multi-step math (default)
node src/index.js 0

# Example 1: Weather + calculation
node src/index.js 1

# Example 2: Search + save/retrieve note
node src/index.js 2
```

## Use in your own code

```js
import { runAgent } from "./src/agent.js";

const result = await runAgent("What is 123 * 456?");
console.log(result.answer);
```
