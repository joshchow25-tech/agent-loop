// Tool definitions for the agent
export const toolDefinitions = [
  {
    name: "calculator",
    description: "Perform basic arithmetic calculations. Supports add, subtract, multiply, divide.",
    input_schema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["add", "subtract", "multiply", "divide"],
          description: "The arithmetic operation to perform"
        },
        a: { type: "number", description: "First operand" },
        b: { type: "number", description: "Second operand" }
      },
      required: ["operation", "a", "b"]
    }
  },
  {
    name: "get_weather",
    description: "Get the current weather for a given city (mock data for demo purposes)",
    input_schema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The name of the city"
        }
      },
      required: ["city"]
    }
  },
  {
    name: "search_web",
    description: "Search for information on the web (mock data for demo purposes)",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "save_note",
    description: "Save a note to memory for later retrieval",
    input_schema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Note identifier" },
        content: { type: "string", description: "Note content to save" }
      },
      required: ["key", "content"]
    }
  },
  {
    name: "get_note",
    description: "Retrieve a previously saved note by key",
    input_schema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Note identifier to retrieve" }
      },
      required: ["key"]
    }
  }
];

// In-memory note storage
const notes = {};

// Tool execution handlers
export async function executeTool(toolName, toolInput) {
  switch (toolName) {
    case "calculator": {
      const { operation, a, b } = toolInput;
      let result;
      switch (operation) {
        case "add":      result = a + b; break;
        case "subtract": result = a - b; break;
        case "multiply": result = a * b; break;
        case "divide":
          if (b === 0) return { error: "Division by zero" };
          result = a / b;
          break;
      }
      return { result, expression: `${a} ${operation} ${b} = ${result}` };
    }

    case "get_weather": {
      // Mock weather data
      const weatherData = {
        "Beijing":   { temp: 15, condition: "Sunny",    humidity: 40 },
        "Shanghai":  { temp: 22, condition: "Cloudy",   humidity: 65 },
        "New York":  { temp: 8,  condition: "Rainy",    humidity: 80 },
        "London":    { temp: 12, condition: "Overcast", humidity: 75 },
        "Tokyo":     { temp: 18, condition: "Partly Cloudy", humidity: 55 },
        "default":   { temp: 20, condition: "Unknown",  humidity: 50 }
      };
      const data = weatherData[toolInput.city] || weatherData["default"];
      return {
        city: toolInput.city,
        temperature: `${data.temp}°C`,
        condition: data.condition,
        humidity: `${data.humidity}%`
      };
    }

    case "search_web": {
      // Mock search results
      return {
        query: toolInput.query,
        results: [
          { title: `Top result for "${toolInput.query}"`, url: "https://example.com/1", snippet: `This is a mock search result about ${toolInput.query}. It contains relevant information.` },
          { title: `Another result for "${toolInput.query}"`, url: "https://example.com/2", snippet: `More information about ${toolInput.query} from a different source.` },
          { title: `Deep dive into "${toolInput.query}"`, url: "https://example.com/3", snippet: `Comprehensive guide covering all aspects of ${toolInput.query}.` }
        ],
        total: 3
      };
    }

    case "save_note": {
      notes[toolInput.key] = toolInput.content;
      return { success: true, message: `Note saved with key: "${toolInput.key}"` };
    }

    case "get_note": {
      const content = notes[toolInput.key];
      if (!content) {
        return { success: false, message: `No note found with key: "${toolInput.key}"` };
      }
      return { success: true, key: toolInput.key, content };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
