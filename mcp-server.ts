import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Server(
  {
    name: "genesis-lab-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool definitions
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_site_metadata",
        description: "Get metadata for the Genesis Lab 3D site",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_pages",
        description: "List all available pages in the application",
        inputSchema: {
          type: "object",
          properties: {},
        },
      }
    ],
  };
});

/**
 * Tool execution handlers
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_site_metadata": {
      try {
        const metadataPath = path.join(process.cwd(), "metadata.json");
        const metadata = await fs.readFile(metadataPath, "utf-8");
        return {
          content: [{ type: "text", text: metadata }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error reading metadata: ${error}` }],
          isError: true,
        };
      }
    }

    case "list_pages": {
      try {
        const pagesDir = path.join(process.cwd(), "src", "pages");
        const files = await fs.readdir(pagesDir);
        const pages = files
          .filter(f => f.endsWith(".tsx"))
          .map(f => f.replace(".tsx", ""));
        
        return {
          content: [{ type: "text", text: `Available Pages: ${pages.join(", ")}` }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing pages: ${error}` }],
          isError: true,
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Genesis Lab MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});
