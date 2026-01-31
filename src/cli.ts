#!/usr/bin/env node
/**
 * Agent Protocol Inspector CLI
 */

import { A2UIValidator } from './validator';
import { A2UIVisualizer } from './visualizer';
import { A2UIAnalyzer, DataModelAnalysis } from './analyzer';
import { A2UIMock } from './mock';

interface CLIOptions {
  command: string;
  file?: string;
  tree?: boolean;
  dataModel?: boolean;
  strict?: boolean;
  json?: boolean;
  color?: boolean;
  components?: number;
  surface?: string;
  depth?: number;
}

class CLI {
  private validator = new A2UIValidator();
  private visualizer = new A2UIVisualizer();
  private analyzer = new A2UIAnalyzer();
  private mock = new A2UIMock();

  async run(args: string[]): Promise<void> {
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

  private parseArgs(args: string[]): CLIOptions {
    const parsed: Partial<CLIOptions> = { command: '' };

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
        case '--json':
        case '-j':
          parsed.json = true;
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

    return parsed as CLIOptions;
  }

  private async validate(options: CLIOptions): Promise<void> {
    if (options.json) {
      const result = await this.validator.validateJSON(options.file);
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.valid ? 0 : 1);
      return;
    }

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
    } else {
      console.log(`❌ Validation failed: ${result.errors.length} error(s)\n`);

      for (const error of result.errors) {
        console.log(`  Line ${error.line}: [${error.code}] ${error.message}`);
      }
    }

    process.exit(result.valid ? 0 : 1);
  }

  private async visualize(options: CLIOptions): Promise<void> {
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
      } else {
        console.log(this.visualizer.toJSON(surface));
      }

      if (Array.from(parsed.surfaces.keys()).indexOf(surfaceId) < parsed.surfaces.size - 1) {
        console.log('\n' + '='.repeat(50) + '\n');
      }
    }
  }

  private async analyze(options: CLIOptions): Promise<void> {
    const parsed = await this.validator.parseStream(options.file);

    if (options.json) {
      if (parsed.surfaces.size === 0) {
        console.log(JSON.stringify({ error: 'No surfaces found' }));
        process.exit(1);
        return;
      }

      const results: Array<{
        surfaceId: string;
        surfaceAnalysis: DataModelAnalysis;
      }> = [];
      for (const [surfaceId, surface] of parsed.surfaces) {
        results.push({ surfaceId, surfaceAnalysis: this.analyzer.analyzeJSON(surface) });
      }

      console.log(JSON.stringify({ surfaces: results, errors: parsed.errors }, null, 2));
      return;
    }

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

  private async debug(options: CLIOptions): Promise<void> {
    console.log('🐛 Debugging A2UI stream...\n');

    const parsed = await this.validator.parseStream(options.file);

    // Show validation results
    if (parsed.errors.length > 0) {
      console.log(`❌ ${parsed.errors.length} error(s):\n`);
      for (const error of parsed.errors) {
        console.log(`  Line ${error.line}: [${error.code}] ${error.message}`);
      }
      console.log();
    } else {
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

  private async mockGenerate(options: CLIOptions): Promise<void> {
    const stream = this.mock.generateStream({
      surfaceId: options.surface,
      components: options.components || 5,
      depth: options.depth || 2
    });

    console.log(stream);
  }

  private async format(options: CLIOptions): Promise<void> {
    const parsed = await this.validator.parseStream(options.file);

    console.log('📨 Formatted A2UI Stream:\n');

    for (const msg of parsed.messages) {
      console.log(JSON.stringify(msg, null, 2));
    }
  }

  private showHelp(): void {
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
  -j, --json              Output structured JSON for CI/automation
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

// Run CLI
if (require.main === module) {
  const cli = new CLI();
  const args = process.argv.slice(2);
  cli.run(args).catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export { CLI };
