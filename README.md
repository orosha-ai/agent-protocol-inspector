# Agent Protocol Inspector

**Validate, analyze, and debug A2UI agent-to-UI protocol streams.**

A CLI tool for developers working with agent-driven interfaces. Inspect A2UI JSONL messages, visualize component trees, validate protocol compliance, and debug streaming issues.

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

## 📖 Commands

### Validate

```bash
a2ui validate [file]
```

Validates A2UI stream syntax and structure. Returns exit code 0 on success, 1 on failure.

### Visualize

```bash
a2ui visualize --tree [file]
```

Shows component hierarchy. Use `--tree` for ASCII art, or omit for JSON output.

### Analyze

```bash
a2ui analyze --data-model [file]
```

Analyzes data model, value types, and component bindings.

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
