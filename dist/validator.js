"use strict";
/**
 * A2UI Protocol Validator
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.A2UIValidator = void 0;
const fs = __importStar(require("fs"));
class A2UIValidator {
    /**
     * Parse and validate a JSONL stream from a file path or stdin
     */
    async parseStream(inputPath) {
        let lines;
        if (inputPath) {
            lines = fs.readFileSync(inputPath, 'utf8').trim().split('\n');
        }
        else {
            // Read from stdin
            lines = await this.readStdin();
        }
        const messages = [];
        const errors = [];
        const surfaces = new Map();
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line)
                continue;
            const lineNum = i + 1;
            try {
                const parsed = JSON.parse(line);
                // Validate message structure
                const msgErrors = this.validateMessage(parsed, lineNum);
                errors.push(...msgErrors);
                if (msgErrors.length === 0) {
                    messages.push({ ...parsed, line: lineNum });
                    this.processMessage(parsed, surfaces);
                }
            }
            catch (err) {
                errors.push({
                    line: lineNum,
                    message: `Invalid JSON: ${err.message}`,
                    code: 'INVALID_JSON'
                });
            }
        }
        return { messages, surfaces, errors };
    }
    /**
     * Validate a single A2UI message
     */
    validateMessage(msg, line) {
        const errors = [];
        if (!msg || typeof msg !== 'object') {
            errors.push({
                line,
                message: 'Message must be an object',
                code: 'NOT_OBJECT'
            });
            return errors;
        }
        const m = msg;
        // Check required 'type' field
        if (!m.type || typeof m.type !== 'string') {
            errors.push({
                line,
                message: 'Missing or invalid "type" field',
                code: 'MISSING_TYPE'
            });
            return errors;
        }
        const validTypes = ['surfaceUpdate', 'dataModelUpdate', 'beginRendering', 'deleteSurface'];
        if (!validTypes.includes(m.type)) {
            errors.push({
                line,
                message: `Invalid type "${m.type}". Must be one of: ${validTypes.join(', ')}`,
                code: 'INVALID_TYPE'
            });
            return errors;
        }
        // Check required 'surfaceId' field
        if (!m.surfaceId || typeof m.surfaceId !== 'string') {
            errors.push({
                line,
                message: 'Missing or invalid "surfaceId" field',
                code: 'MISSING_SURFACE_ID'
            });
            return errors;
        }
        // Type-specific validation
        switch (m.type) {
            case 'surfaceUpdate':
                errors.push(...this.validateSurfaceUpdate(m, line));
                break;
            case 'dataModelUpdate':
                errors.push(...this.validateDataModelUpdate(m, line));
                break;
            case 'beginRendering':
                errors.push(...this.validateBeginRendering(m, line));
                break;
            case 'deleteSurface':
                // No additional fields required
                break;
        }
        return errors;
    }
    validateSurfaceUpdate(msg, line) {
        const errors = [];
        if (!Array.isArray(msg.components)) {
            errors.push({
                line,
                message: '"components" must be an array',
                code: 'INVALID_COMPONENTS'
            });
            return errors;
        }
        // Validate each component
        const componentIds = new Set();
        for (let i = 0; i < msg.components.length; i++) {
            const comp = msg.components[i];
            const idx = i + 1;
            if (!comp.id || typeof comp.id !== 'string') {
                errors.push({
                    line,
                    message: `Component ${idx}: missing or invalid "id"`,
                    code: 'MISSING_COMPONENT_ID'
                });
            }
            else if (componentIds.has(comp.id)) {
                errors.push({
                    line,
                    message: `Component ${idx}: duplicate id "${comp.id}"`,
                    code: 'DUPLICATE_COMPONENT_ID'
                });
            }
            else {
                componentIds.add(comp.id);
            }
            if (!comp.type || typeof comp.type !== 'string') {
                errors.push({
                    line,
                    message: `Component ${idx}: missing or invalid "type"`,
                    code: 'MISSING_COMPONENT_TYPE'
                });
            }
        }
        // Check for circular dependencies in children
        for (const comp of msg.components) {
            if (comp.children && Array.isArray(comp.children)) {
                for (const childId of comp.children) {
                    if (childId === comp.id) {
                        errors.push({
                            line,
                            message: `Component "${comp.id}": cannot have itself as child`,
                            code: 'CIRCULAR_DEPENDENCY'
                        });
                    }
                }
            }
        }
        return errors;
    }
    validateDataModelUpdate(msg, line) {
        const errors = [];
        if (!msg.dataModel || typeof msg.dataModel !== 'object') {
            errors.push({
                line,
                message: '"dataModel" must be an object',
                code: 'INVALID_DATA_MODEL'
            });
        }
        if (msg.replace !== undefined && typeof msg.replace !== 'boolean') {
            errors.push({
                line,
                message: '"replace" must be a boolean',
                code: 'INVALID_REPLACE_FLAG'
            });
        }
        return errors;
    }
    validateBeginRendering(msg, line) {
        const errors = [];
        if (!msg.rootComponentId || typeof msg.rootComponentId !== 'string') {
            errors.push({
                line,
                message: '"rootComponentId" must be a string',
                code: 'MISSING_ROOT_COMPONENT_ID'
            });
        }
        if (msg.catalog && typeof msg.catalog !== 'object') {
            errors.push({
                line,
                message: '"catalog" must be an object',
                code: 'INVALID_CATALOG'
            });
        }
        return errors;
    }
    /**
     * Process a valid message and update surface state
     */
    processMessage(msg, surfaces) {
        let surface = surfaces.get(msg.surfaceId);
        if (msg.type === 'deleteSurface') {
            surfaces.delete(msg.surfaceId);
            return;
        }
        if (!surface) {
            surface = {
                surfaceId: msg.surfaceId,
                components: new Map()
            };
            surfaces.set(msg.surfaceId, surface);
        }
        switch (msg.type) {
            case 'surfaceUpdate':
                const su = msg;
                for (const comp of su.components) {
                    surface.components.set(comp.id, comp);
                }
                break;
            case 'dataModelUpdate':
                const dmu = msg;
                if (dmu.replace) {
                    surface.dataModel = { ...dmu.dataModel };
                }
                else {
                    surface.dataModel = { ...(surface.dataModel || {}), ...dmu.dataModel };
                }
                break;
            case 'beginRendering':
                const br = msg;
                surface.rootId = br.rootComponentId;
                if (br.catalog) {
                    surface.catalog = br.catalog;
                }
                break;
        }
    }
    /**
     * Generate full validation report
     */
    async validate(inputPath) {
        const parsed = await this.parseStream(inputPath);
        const warnings = [];
        // Check for orphaned components (no parent and not root)
        for (const [surfaceId, surface] of parsed.surfaces) {
            const allIds = new Set(surface.components.keys());
            const referencedIds = new Set();
            // Find all referenced IDs
            for (const comp of surface.components.values()) {
                if (comp.children) {
                    for (const childId of comp.children) {
                        referencedIds.add(childId);
                    }
                }
            }
            // Check root is defined if beginRendering was sent
            if (surface.rootId && !allIds.has(surface.rootId)) {
                warnings.push({
                    line: 0,
                    message: `Surface "${surfaceId}": root component "${surface.rootId}" not found`,
                    code: 'ROOT_NOT_FOUND'
                });
            }
            // Check for orphaned components
            for (const id of allIds) {
                if (id !== surface.rootId && !referencedIds.has(id)) {
                    warnings.push({
                        line: 0,
                        message: `Surface "${surfaceId}": component "${id}" has no parent`,
                        code: 'ORPHANED_COMPONENT'
                    });
                }
            }
            // Check for missing child references
            for (const comp of surface.components.values()) {
                if (comp.children) {
                    for (const childId of comp.children) {
                        if (!allIds.has(childId)) {
                            warnings.push({
                                line: 0,
                                message: `Surface "${surfaceId}": component "${comp.id}" references missing child "${childId}"`,
                                code: 'MISSING_CHILD_REFERENCE'
                            });
                        }
                    }
                }
            }
        }
        return {
            valid: parsed.errors.length === 0,
            errors: parsed.errors,
            warnings
        };
    }
    /**
     * Validate and return structured JSON output
     */
    async validateJSON(inputPath) {
        const parsed = await this.parseStream(inputPath);
        const warnings = [];
        // Count messages
        const messageCount = parsed.messages.length;
        // Count surfaces and components
        let surfaceCount = 0;
        let componentCount = 0;
        for (const surface of parsed.surfaces.values()) {
            surfaceCount++;
            componentCount += surface.components.size;
        }
        // Generate warnings (same as validate())
        for (const [surfaceId, surface] of parsed.surfaces) {
            const allIds = new Set(surface.components.keys());
            const referencedIds = new Set();
            for (const comp of surface.components.values()) {
                if (comp.children) {
                    for (const childId of comp.children) {
                        referencedIds.add(childId);
                    }
                }
            }
            if (surface.rootId && !allIds.has(surface.rootId)) {
                warnings.push({
                    line: 0,
                    message: `Surface "${surfaceId}": root component "${surface.rootId}" not found`,
                    code: 'ROOT_NOT_FOUND'
                });
            }
            for (const id of allIds) {
                if (id !== surface.rootId && !referencedIds.has(id)) {
                    warnings.push({
                        line: 0,
                        message: `Surface "${surfaceId}": component "${id}" has no parent`,
                        code: 'ORPHANED_COMPONENT'
                    });
                }
            }
            for (const comp of surface.components.values()) {
                if (comp.children) {
                    for (const childId of comp.children) {
                        if (!allIds.has(childId)) {
                            warnings.push({
                                line: 0,
                                message: `Surface "${surfaceId}": component "${comp.id}" references missing child "${childId}"`,
                                code: 'MISSING_CHILD_REFERENCE'
                            });
                        }
                    }
                }
            }
        }
        return {
            valid: parsed.errors.length === 0,
            errors: parsed.errors,
            warnings,
            stats: {
                messageCount,
                surfaceCount,
                componentCount
            }
        };
    }
    /**
     * Read from stdin
     */
    async readStdin() {
        return new Promise((resolve, reject) => {
            const chunks = [];
            process.stdin.on('data', (chunk) => chunks.push(chunk));
            process.stdin.on('end', () => {
                const data = Buffer.concat(chunks).toString('utf8');
                resolve(data.trim().split('\n'));
            });
            process.stdin.on('error', reject);
        });
    }
}
exports.A2UIValidator = A2UIValidator;
//# sourceMappingURL=validator.js.map