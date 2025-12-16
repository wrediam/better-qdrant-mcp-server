# Better Qdrant MCP Server

A Model Context Protocol (MCP) server for enhanced Qdrant vector database functionality. This server provides tools for managing Qdrant collections, adding documents, and performing semantic searches.

<a href="https://glama.ai/mcp/servers/@wrediam/better-qdrant-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@wrediam/better-qdrant-mcp-server/badge" alt="Better Qdrant Server MCP server" />
</a>

## Features

- **List Collections**: View all available Qdrant collections
- **Add Documents**: Process and add documents to a Qdrant collection with various embedding services
- **Search**: Perform semantic searches across your vector database
- **Delete Collection**: Remove collections from your Qdrant database

## Installation

```bash
npm install -g better-qdrant-mcp-server
```

Or use it directly with npx:

```bash
npx better-qdrant-mcp-server
```

## Configuration

The server uses environment variables for configuration. You can set these in a `.env` file in your project root:

```
# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_api_key_if_needed

# Embedding Service API Keys
OPENAI_API_KEY=your_openai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OLLAMA_ENDPOINT=http://localhost:11434
```

## Supported Embedding Services

- **OpenAI**: Requires an API key
- **OpenRouter**: Requires an API key
- **Ollama**: Local embedding models (default endpoint: http://localhost:11434)
- **FastEmbed**: Local embedding models

## Usage with Claude

To use this MCP server with Claude, add it to your MCP settings configuration file:

```json
{
  "mcpServers": {
    "better-qdrant": {
      "command": "npx",
      "args": ["better-qdrant-mcp-server"],
      "env": {
        "QDRANT_URL": "http://localhost:6333",
        "QDRANT_API_KEY": "your_api_key_if_needed",
        "DEFAULT_EMBEDDING_SERVICE": "ollama",
        "OPENAI_API_KEY": "your_openai_api_key",
        "OPENAI_ENDPOINT": "https://api.openai.com/v1",
        "OPENROUTER_API_KEY": "your_openrouter_api_key",
        "OPENROUTER_ENDPOINT": "https://api.openrouter.com/v1",
        "OLLAMA_ENDPOINT": "http://localhost:11434",
        "OLLAMA_MODEL": "nomic-embed-text"
      }
    }
  }
}
```

### Example Commands

#### List Collections

```
use_mcp_tool
server_name: better-qdrant
tool_name: list_collections
arguments: {}
```

#### Add Documents

```
use_mcp_tool
server_name: better-qdrant
tool_name: add_documents
arguments: {
  "filePath": "/path/to/your/document.pdf",
  "collection": "my-collection",
  "embeddingService": "openai",
  "chunkSize": 1000,
  "chunkOverlap": 200
}
```

#### Search

```
use_mcp_tool
server_name: better-qdrant
tool_name: search
arguments: {
  "query": "your search query",
  "collection": "my-collection",
  "embeddingService": "openai",
  "limit": 5
}
```

#### Delete Collection

```
use_mcp_tool
server_name: better-qdrant
tool_name: delete_collection
arguments: {
  "collection": "my-collection"
}
```

## Requirements

- Node.js >= 18.0.0
- A running Qdrant server (local or remote)
- API keys for the embedding services you want to use

## License

MIT