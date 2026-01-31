#!/usr/bin/env node
/**
 * Agent Protocol Inspector CLI
 */
declare class CLI {
    private validator;
    private visualizer;
    private analyzer;
    private mock;
    run(args: string[]): Promise<void>;
    private parseArgs;
    private validate;
    private visualize;
    private analyze;
    private debug;
    private mockGenerate;
    private format;
    private showHelp;
}
export { CLI };
//# sourceMappingURL=cli.d.ts.map