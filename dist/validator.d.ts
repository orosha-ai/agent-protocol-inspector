/**
 * A2UI Protocol Validator
 */
import { ValidationResult, ParsedStream } from './types';
export declare class A2UIValidator {
    /**
     * Parse and validate a JSONL stream from a file path or stdin
     */
    parseStream(inputPath?: string): Promise<ParsedStream>;
    /**
     * Validate a single A2UI message
     */
    private validateMessage;
    private validateSurfaceUpdate;
    private validateDataModelUpdate;
    private validateBeginRendering;
    /**
     * Process a valid message and update surface state
     */
    private processMessage;
    /**
     * Generate full validation report
     */
    validate(inputPath?: string): Promise<ValidationResult>;
    /**
     * Read from stdin
     */
    private readStdin;
}
//# sourceMappingURL=validator.d.ts.map