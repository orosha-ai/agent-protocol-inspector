# Agent Protocol Inspector

**Validate, analyze, and debug A2UI agent-to-UI protocol streams.**

If you're building agent UIs, this catches silent protocol bugs before users see them.

A CLI tool for developers working with agent-driven interfaces. Inspect A2UI JSONL messages, visualize component trees, validate protocol compliance, and debug streaming issues.

## 💡 Why This Matters

A2UI is powerful — until it breaks silently. Unlike HTTP status codes or error throw traces, A2UI streams can fail in subtle ways:
- A component reference exists but never gets added → **rendering freeze**
- Data model keys drift from component bindings → **stale UI**
- Root component ID mismatch → **blank screen**

This tool catches these issues at the protocol level, before your users see broken UIs.

## 🎯 Common Bugs Caught

- **Missing root component** — `beginRendering` references an ID that was never added
- **Orphaned components** — Components added but never referenced by parent
- **Broken child references** — Parent points to non-existent child IDs
- **Circular dependencies** — Component references itself (infinite loop)
- **DataModel drift** — Component bindings point to keys that don't exist in data model
- **Duplicate IDs** — Two components with same ID (ambiguous updates)

## 🚀 Quick Start

```bash
npm install -g agent-protocol-inspector

# Validate a stream
cat a2ui-stream.jsonl | a2ui validate

# Visualize component tree
a2ui visualize --tree a2ui-stream.jsonl

# Analyze data model
a2ui analyze --data-model a2ui-stream.jsonl

# Generate mock stream
a2ui mock --components 10 > sample.jsonl
```

## 📋 Features

- **🔍 Validate** A2UI JSONL streams
- **🌳 Visualize** component trees (ASCII or JSON)
- **📊 Analyze** data models and bindings
- **🐛 Debug** protocol violations
- **🎨 Mock** generate sample messages
- **📜 Format** pretty-print for readability

## 🖼️ Example Output

```bash
$ a2ui visualize --tree test/fixtures/sample.jsonl

📊 Component Tree: dashboard
──────────────────────────────────────────────────

└── Container [padding=16] (root)
    ├── Text [text="Dashboard"] (header)
    └── Row [spacing=8] (content)
        ├── Text [text="Users: 1234"] (stats)
        └── Button [label="Refresh"] (actions)


📚 Component Catalog:
  Text → span
  Container → div
  Row → div.row
  Button → button
```

## 📖 Commands

### Validate

```bash
a2ui validate [file]
a2ui validate --json [file]
```

Validates A2UI stream syntax and structure. Returns exit code 0 on success, 1 on failure.

**JSON output:**
```bash
$ a2ui validate --json stream.jsonl

{
  "valid": true,
  "errors": [],
  "warnings": [],
  "stats": {
    "messageCount": 5,
    "surfaceCount": 1,
    "componentCount": 5
  }
}
```

### Visualize

```bash
a2ui visualize --tree [file]
```

Shows component hierarchy. Use `--tree` for ASCII art, or omit for JSON output.

### Analyze

```bash
a2ui analyze --data-model [file]
a2ui analyze --json [file]
```

Analyzes data model, value types, and component bindings.

**JSON output:**
```bash
$ a2ui analyze --json stream.jsonl

{
  "surfaces": [{
    "surfaceId": "dashboard",
    "surfaceAnalysis": {
      "totalKeys": 2,
      "valueTypes": { "string": 1, "number": 1 },
      "boundComponents": 0,
      "dataPaths": ["title", "users"],
      "warnings": [],
      "dataModelTree": { ... }
    }
  }],
  "errors": []
}
```

### Debug

```bash
a2ui debug --strict [file]
```

Full debug report with errors, warnings, and message statistics. Use `--strict` to fail on errors.

### Mock

```bash
a2ui mock --components 10 --surface dashboard --depth 3
```

Generates sample A2UI stream for testing.

### Format

```bash
a2ui format [file]
```

Pretty-prints JSONL stream for human readability.

## 📚 A2UI Protocol (v0.8)

### Server-to-Client Messages

| Type | Description |
|------|-------------|
| `surfaceUpdate` | Add/update components in a surface |
| `dataModelUpdate` | Update surface data model |
| `beginRendering` | Signal initial render (root + catalog) |
| `deleteSurface` | Remove a surface |

### Client-to-Server (via A2A)

| Type | Description |
|------|-------------|
| `userAction` | User-initiated action from component |
| `error` | Client-side error report |

### Example Stream

```jsonl
{"type":"surfaceUpdate","surfaceId":"dashboard","components":[{"id":"root","type":"Container","props":{"padding":16},"children":["header","content"]}]}
{"type":"surfaceUpdate","surfaceId":"dashboard","components":[{"id":"header","type":"Text","props":{"text":"Dashboard"}}]}
{"type":"dataModelUpdate","surfaceId":"dashboard","dataModel":{"title":"Overview","users":1234}}
{"type":"beginRendering","surfaceId":"dashboard","rootComponentId":"root","catalog":{"Text":"span","Container":"div"}}
```

## 🔗 Works Great With

- **MCP Registry Manager** — Validate UI tools before adding to registry
- **Agent Observability Dashboard** — UI health signal for your agent fleet
- **Agentic Compass** — Guardrail for "action → UI" loops

**Example pipeline:**
```
agent → generates A2UI stream → a2ui validate → dashboard alerts
```

## 🔧 Development

```bash
git clone https://github.com/orosha-ai/agent-protocol-inspector
cd agent-protocol-inspector
npm install
npm run build
npm run test
```

## 📚 Resources

- [A2UI Specification](https://a2ui.org/specification/v0.8-a2ui/)
- [Google A2UI Blog](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [AG-UI Overview](https://docs.ag-ui.com/introduction)
- [A2A Protocol](https://a2aprotocol.ai/)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

**Built by Orosha** 🦞
