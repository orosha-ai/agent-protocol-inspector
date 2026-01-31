/**
 * A2UI Protocol Validator
 */

import * as fs from 'fs';
import { Readable } from 'stream';
import {
  A2UIMessage,
  SurfaceUpdate,
  DataModelUpdate,
  BeginRendering,
  DeleteSurface,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ParsedStream,
  SurfaceComponents
} from './types';

export class A2UIValidator {
  /**
   * Parse and validate a JSONL stream from a file path or stdin
   */
  async parseStream(inputPath?: string): Promise<ParsedStream> {
    let lines: string[];

    if (inputPath) {
      lines = fs.readFileSync(inputPath, 'utf8').trim().split('\n');
    } else {
      // Read from stdin
      lines = await this.readStdin();
    }

    const messages: Array<A2UIMessage & { line: number }> = [];
    const errors: ValidationError[] = [];
    const surfaces = new Map<string, SurfaceComponents>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const lineNum = i + 1;

      try {
        const parsed = JSON.parse(line) as A2UIMessage;

        // Validate message structure
        const msgErrors = this.validateMessage(parsed, lineNum);
        errors.push(...msgErrors);

        if (msgErrors.length === 0) {
          messages.push({ ...parsed, line: lineNum });
          this.processMessage(parsed, surfaces);
        }
      } catch (err) {
        errors.push({
          line: lineNum,
          message: `Invalid JSON: ${(err as Error).message}`,
          code: 'INVALID_JSON'
        });
      }
    }

    return { messages, surfaces, errors };
  }

  /**
   * Validate a single A2UI message
   */
  private validateMessage(msg: unknown, line: number): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!msg || typeof msg !== 'object') {
      errors.push({
        line,
        message: 'Message must be an object',
        code: 'NOT_OBJECT'
      });
      return errors;
    }

    const m = msg as Record<string, unknown>;

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
    if (!validTypes.includes(m.type as string)) {
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
        errors.push(...this.validateSurfaceUpdate(m as unknown as SurfaceUpdate, line));
        break;
      case 'dataModelUpdate':
        errors.push(...this.validateDataModelUpdate(m as unknown as DataModelUpdate, line));
        break;
      case 'beginRendering':
        errors.push(...this.validateBeginRendering(m as unknown as BeginRendering, line));
        break;
      case 'deleteSurface':
        // No additional fields required
        break;
    }

    return errors;
  }

  private validateSurfaceUpdate(msg: SurfaceUpdate, line: number): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!Array.isArray(msg.components)) {
      errors.push({
        line,
        message: '"components" must be an array',
        code: 'INVALID_COMPONENTS'
      });
      return errors;
    }

    // Validate each component
    const componentIds = new Set<string>();
    for (let i = 0; i < msg.components.length; i++) {
      const comp = msg.components[i];
      const idx = i + 1;

      if (!comp.id || typeof comp.id !== 'string') {
        errors.push({
          line,
          message: `Component ${idx}: missing or invalid "id"`,
          code: 'MISSING_COMPONENT_ID'
        });
      } else if (componentIds.has(comp.id)) {
        errors.push({
          line,
          message: `Component ${idx}: duplicate id "${comp.id}"`,
          code: 'DUPLICATE_COMPONENT_ID'
        });
      } else {
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

  private validateDataModelUpdate(msg: DataModelUpdate, line: number): ValidationError[] {
    const errors: ValidationError[] = [];

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

  private validateBeginRendering(msg: BeginRendering, line: number): ValidationError[] {
    const errors: ValidationError[] = [];

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
  private processMessage(msg: A2UIMessage, surfaces: Map<string, SurfaceComponents>): void {
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
        const su = msg as SurfaceUpdate;
        for (const comp of su.components) {
          surface!.components.set(comp.id, comp);
        }
        break;
      case 'dataModelUpdate':
        const dmu = msg as DataModelUpdate;
        if (dmu.replace) {
          surface!.dataModel = { ...dmu.dataModel };
        } else {
          surface!.dataModel = { ...(surface!.dataModel || {}), ...dmu.dataModel };
        }
        break;
      case 'beginRendering':
        const br = msg as BeginRendering;
        surface!.rootId = br.rootComponentId;
        if (br.catalog) {
          surface!.catalog = br.catalog;
        }
        break;
    }
  }

  /**
   * Generate full validation report
   */
  async validate(inputPath?: string): Promise<ValidationResult> {
    const parsed = await this.parseStream(inputPath);
    const warnings: ValidationWarning[] = [];

    // Check for orphaned components (no parent and not root)
    for (const [surfaceId, surface] of parsed.surfaces) {
      const allIds = new Set(surface.components.keys());
      const referencedIds = new Set<string>();

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
   * Read from stdin
   */
  private async readStdin(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      process.stdin.on('data', (chunk) => chunks.push(chunk));
      process.stdin.on('end', () => {
        const data = Buffer.concat(chunks).toString('utf8');
        resolve(data.trim().split('\n'));
      });
      process.stdin.on('error', reject);
    });
  }
}
