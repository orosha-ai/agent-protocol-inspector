# Agent Protocol Inspector

**Validate, analyze, and debug A2UI agent-to-UI protocol streams.**

A CLI tool for developers working with agent-driven interfaces. Inspect A2UI JSONL messages, visualize component trees, validate protocol compliance, and debug streaming issues.

## Features

- **🔍 Validate** A2UI JSONL streams
- **🌳 Visualize** component trees
- **📊 Analyze** data models and updates
- **🐛 Debug** protocol violations
- **🎨 Mock** generate sample messages
- **📜 Format** pretty-print for readability

## Installation

```bash
npm install -g agent-protocol-inspector
```

## Usage

### Validate a stream
```bash
cat a2ui-stream.jsonl | a2ui validate
```

### Visualize component tree
```bash
cat a2ui-stream.jsonl | a2ui visualize --tree
```

### Analyze data model updates
```bash
cat a2ui-stream.jsonl | a2ui analyze --data-model
```

### Debug protocol violations
```bash
cat a2ui-stream.jsonl | a2ui debug --strict
```

### Generate mock A2UI stream
```bash
a2ui mock --components 5 --surface dashboard
```

### Format (pretty-print)
```bash
cat a2ui-stream.jsonl | a2ui format --color
```

## A2UI Protocol (v0.8)

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

## Example A2UI Stream

```jsonl
{"type":"surfaceUpdate","surfaceId":"dashboard","components":[{"id":"root","type":"Container","props":{"padding":16},"children":["header","content"]}]}
{"type":"surfaceUpdate","surfaceId":"dashboard","components":[{"id":"header","type":"Text","props":{"text":"Dashboard"}}]}
{"type":"beginRendering","surfaceId":"dashboard","rootComponentId":"root","catalog":{"Text":"text","Container":"container"}}
```

## Resources

- [A2UI Specification](https://a2ui.org/specification/v0.8-a2ui/)
- [Google A2UI Blog](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [AG-UI Overview](https://docs.ag-ui.com/introduction)
- [A2A Protocol](https://a2aprotocol.ai/)

## Version

v0.1 - MVP: Validate, visualize, analyze A2UI streams
