/**
 * A2UI Protocol Validator
 */
import { ValidationResult, ValidationError, ValidationWarning, ParsedStream } from './types';
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
     * Validate and return structured JSON output
     */
    validateJSON(inputPath?: string): Promise<{
        valid: boolean;
        errors: ValidationError[];
        warnings: ValidationWarning[];
        stats: {
            messageCount: number;
            surfaceCount: number;
            componentCount: number;
        };
    }>;
    /**
     * Read from stdin
     */
    private readStdin;
}
//# sourceMappingURL=validator.d.ts.map