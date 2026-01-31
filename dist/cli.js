#!/usr/bin/env node
"use strict";
/**
 * Agent Protocol Inspector CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
const validator_1 = require("./validator");
const visualizer_1 = require("./visualizer");
const analyzer_1 = require("./analyzer");
const mock_1 = require("./mock");
class CLI {
    validator = new validator_1.A2UIValidator();
    visualizer = new visualizer_1.A2UIVisualizer();
    analyzer = new analyzer_1.A2UIAnalyzer();
    mock = new mock_1.A2UIMock();
    async run(args) {
        const options = this.parseArgs(args);
        switch (options.command) {
            case 'validate':
                await this.validate(options);
                break;
            case 'visualize':
                await this.visualize(options);
                break;
            case 'analyze':
                await this.analyze(options);
                break;
            case 'debug':
                await this.debug(options);
                break;
            case 'mock':
                await this.mockGenerate(options);
                break;
            case 'format':
                await this.format(options);
                break;
            default:
                this.showHelp();
        }
    }
    parseArgs(args) {
        const parsed = { command: '' };
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            switch (arg) {
                case 'validate':
                case 'visualize':
                case 'analyze':
                case 'debug':
                case 'mock':
                case 'format':
                    parsed.command = arg;
                    break;
                case '--file':
                case '-f':
                    parsed.file = args[++i];
                    break;
                case '--tree':
                case '-t':
                    parsed.tree = true;
                    break;
                case '--data-model':
                case '-d':
                    parsed.dataModel = true;
                    break;
                case '--strict':
                case '-s':
                    parsed.strict = true;
                    break;
                case '--color':
                case '-c':
                    parsed.color = true;
                    break;
                case '--components':
                    parsed.components = parseInt(args[++i], 10);
                    break;
                case '--surface':
                    parsed.surface = args[++i];
                    break;
                case '--depth':
                    parsed.depth = parseInt(args[++i], 10);
                    break;
                case '--help':
                case '-h':
                    this.showHelp();
                    process.exit(0);
                default:
                    if (arg.startsWith('-')) {
                        console.error(`Unknown option: ${arg}`);
                        process.exit(1);
                    }
                    // Assume it's a file path
                    parsed.file = arg;
            }
        }
        return parsed;
    }
    async validate(options) {
        console.log('🔍 Validating A2UI stream...\n');
        const result = await this.validator.validate(options.file);
        if (result.valid) {
            console.log('✅ Stream is valid!\n');
            if (result.warnings.length > 0) {
                console.log(`⚠️  ${result.warnings.length} warning(s):\n`);
                for (const warning of result.warnings) {
                    console.log(`  Line ${warning.line || '?'}: ${warning.message}`);
                }
            }
        }
        else {
            console.log(`❌ Validation failed: ${result.errors.length} error(s)\n`);
            for (const error of result.errors) {
                console.log(`  Line ${error.line}: [${error.code}] ${error.message}`);
            }
        }
        process.exit(result.valid ? 0 : 1);
    }
    async visualize(options) {
        const parsed = await this.validator.parseStream(options.file);
        if (parsed.errors.length > 0) {
            console.log('⚠️  Stream has errors, showing visualization anyway...\n');
            for (const error of parsed.errors) {
                console.log(`  Line ${error.line}: ${error.message}`);
            }
            console.log();
        }
        if (parsed.surfaces.size === 0) {
            console.log('No surfaces found in stream');
            process.exit(1);
        }
        for (const [surfaceId, surface] of parsed.surfaces) {
            if (options.tree) {
                console.log(this.visualizer.visualizeTree(surface));
            }
            else {
                console.log(this.visualizer.toJSON(surface));
            }
            if (Array.from(parsed.surfaces.keys()).indexOf(surfaceId) < parsed.surfaces.size - 1) {
                console.log('\n' + '='.repeat(50) + '\n');
            }
        }
    }
    async analyze(options) {
        const parsed = await this.validator.parseStream(options.file);
        if (parsed.errors.length > 0) {
            console.log('⚠️  Stream has errors...\n');
            for (const error of parsed.errors) {
                console.log(`  Line ${error.line}: ${error.message}`);
            }
            console.log();
        }
        if (parsed.surfaces.size === 0) {
            console.log('No surfaces found in stream');
            process.exit(1);
        }
        for (const [surfaceId, surface] of parsed.surfaces) {
            console.log(this.analyzer.generateReport(surface));
            if (Array.from(parsed.surfaces.keys()).indexOf(surfaceId) < parsed.surfaces.size - 1) {
                console.log('\n' + '='.repeat(50) + '\n');
            }
        }
    }
    async debug(options) {
        console.log('🐛 Debugging A2UI stream...\n');
        const parsed = await this.validator.parseStream(options.file);
        // Show validation results
        if (parsed.errors.length > 0) {
            console.log(`❌ ${parsed.errors.length} error(s):\n`);
            for (const error of parsed.errors) {
                console.log(`  Line ${error.line}: [${error.code}] ${error.message}`);
            }
            console.log();
        }
        else {
            console.log('✅ No validation errors\n');
        }
        // Show message summary
        console.log(`📬 Messages: ${parsed.messages.length}`);
        console.log(`🖥️  Surfaces: ${parsed.surfaces.size}\n`);
        // Show component counts per surface
        for (const [surfaceId, surface] of parsed.surfaces) {
            console.log(`  ${surfaceId}: ${surface.components.size} components`);
        }
        // Show warnings if any
        const result = await this.validator.validate(options.file);
        if (result.warnings.length > 0) {
            console.log(`\n⚠️  ${result.warnings.length} warning(s):\n`);
            for (const warning of result.warnings) {
                console.log(`  [${warning.code}] ${warning.message}`);
            }
        }
        // If strict, exit on errors
        if (options.strict && parsed.errors.length > 0) {
            process.exit(1);
        }
    }
    async mockGenerate(options) {
        const stream = this.mock.generateStream({
            surfaceId: options.surface,
            components: options.components || 5,
            depth: options.depth || 2
        });
        console.log(stream);
    }
    async format(options) {
        const parsed = await this.validator.parseStream(options.file);
        console.log('📨 Formatted A2UI Stream:\n');
        for (const msg of parsed.messages) {
            console.log(JSON.stringify(msg, null, 2));
        }
    }
    showHelp() {
        console.log(`
Agent Protocol Inspector - A2UI Protocol Tools

Usage:
  a2ui <command> [options]

Commands:
  validate        Validate A2UI stream syntax and structure
  visualize       Visualize component tree (--tree) or JSON output
  analyze         Analyze data model and bindings
  debug           Full debug report with errors, warnings, stats
  mock            Generate sample A2UI stream
  format          Pretty-print JSONL stream

Options:
  -f, --file <path>        Input file path (default: stdin)
  -t, --tree               Show ASCII tree visualization
  -d, --data-model         Analyze data model only
  -s, --strict             Exit with non-zero on errors
  -c, --color              Enable colored output
  --components <n>         Mock: number of components (default: 5)
  --surface <id>           Mock: surface ID (default: 'sample')
  --depth <n>              Mock: tree depth (default: 2)
  -h, --help               Show this help

Examples:
  cat stream.jsonl | a2ui validate
  a2ui visualize --tree stream.jsonl
  a2ui analyze --data-model stream.jsonl
  a2ui mock --components 10 --depth 3

Learn more: https://github.com/orosha-ai/agent-protocol-inspector
`);
    }
}
exports.CLI = CLI;
// Run CLI
if (require.main === module) {
    const cli = new CLI();
    const args = process.argv.slice(2);
    cli.run(args).catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map