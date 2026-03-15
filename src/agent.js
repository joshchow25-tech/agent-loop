import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, executeTool } from "./tools.js";

const MODEL = "claude-opus-4-6";
const MAX_ITERATIONS = 10; // Safety limit to prevent infinite loops

/**
 * Core Agent Loop
 *
 * Flow:
 *  1. Send messages to Claude
 *  2. If response has tool_use blocks → execute tools → append results → loop back
 *  3. If response is end_turn (text only) → return final answer
 */
export async function runAgent(userMessage, systemPrompt = null, verbose = true) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const messages = [{ role: "user", content: userMessage }];

  if (verbose) {
    console.log("\n" + "=".repeat(60));
    console.log("🤖 Agent started");
    console.log("=".repeat(60));
    console.log(`👤 User: ${userMessage}\n`);
  }

  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    if (verbose) {
      console.log(`--- Iteration ${iteration} ---`);
    }

    // Step 1: Call Claude API
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt || "You are a helpful assistant with access to various tools. Use them when needed to answer the user's question accurately.",
      tools: toolDefinitions,
      messages
    });

    if (verbose) {
      console.log(`Stop reason: ${response.stop_reason}`);
    }

    // Step 2: Check if Claude wants to use tools
    if (response.stop_reason === "tool_use") {
      // Append Claude's response (which includes tool_use blocks) to messages
      messages.push({ role: "assistant", content: response.content });

      // Process each tool call
      const toolResults = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          if (verbose) {
            console.log(`\n🔧 Tool call: ${block.name}`);
            console.log(`   Input: ${JSON.stringify(block.input, null, 2)}`);
          }

          // Execute the tool
          const result = await executeTool(block.name, block.input);

          if (verbose) {
            console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
          }

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result)
          });
        } else if (block.type === "text" && block.text && verbose) {
          // Claude may include thinking text alongside tool calls
          console.log(`\n💭 Claude thinking: ${block.text}`);
        }
      }

      // Append all tool results as a single user message
      messages.push({ role: "user", content: toolResults });

      // Continue the loop — Claude will now process the tool results
      continue;
    }

    // Step 3: Claude is done (stop_reason === "end_turn")
    // Extract the final text response
    const finalText = response.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("\n");

    if (verbose) {
      console.log("\n" + "=".repeat(60));
      console.log("✅ Agent finished");
      console.log("=".repeat(60));
      console.log(`\n🤖 Assistant: ${finalText}\n`);
    }

    return {
      answer: finalText,
      iterations: iteration,
      messages
    };
  }

  throw new Error(`Agent exceeded maximum iterations (${MAX_ITERATIONS})`);
}
