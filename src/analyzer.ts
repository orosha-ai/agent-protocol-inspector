/**
 * A2UI Data Model Analyzer
 */

import { SurfaceComponents, Component } from './types';

export interface DataModelStats {
  surfaceId: string;
  totalKeys: number;
  valueTypes: Record<string, number>;
  boundComponents: number;
  dataPaths: string[];
}

export interface DataModelAnalysis {
  totalKeys: number;
  valueTypes: Record<string, number>;
  boundComponents: number;
  dataPaths: string[];
  warnings: string[];
  dataModelTree: Record<string, unknown>;
}

export class A2UIAnalyzer {
  /**
   * Analyze data model for a surface
   */
  analyzeDataModel(surface: SurfaceComponents): DataModelStats {
    const dataModel = surface.dataModel || {};

    // Count value types
    const valueTypes: Record<string, number> = {};
    this.countTypes(dataModel, valueTypes);

    // Find data binding paths
    const dataPaths = this.extractDataPaths(dataModel);

    // Count components with data bindings
    let boundComponents = 0;
    for (const comp of surface.components.values()) {
      if (comp.dataBindings && comp.dataBindings.length > 0) {
        boundComponents++;
      }
    }

    return {
      surfaceId: surface.surfaceId,
      totalKeys: this.countKeys(dataModel),
      valueTypes,
      boundComponents,
      dataPaths
    };
  }

  /**
   * Generate data model report
   */
  generateReport(surface: SurfaceComponents): string {
    const stats = this.analyzeDataModel(surface);

    let output = `📊 Data Model Analysis: ${surface.surfaceId}\n`;
    output += `${'─'.repeat(50)}\n\n`;

    output += `Total keys: ${stats.totalKeys}\n\n`;

    output += `Value Types:\n`;
    for (const [type, count] of Object.entries(stats.valueTypes).sort(
      (a, b) => b[1] - a[1]
    )) {
      const bar = '█'.repeat(Math.min(count, 20));
      output += `  ${type.padEnd(10)} ${bar} ${count}\n`;
    }

    output += `\nComponents with bindings: ${stats.boundComponents}\n`;

    if (stats.dataPaths.length > 0) {
      output += `\nData Paths:\n`;
      for (const path of stats.dataPaths) {
        output += `  • ${path}\n`;
      }
    }

    // Show actual data model
    if (surface.dataModel) {
      output += `\n📄 Data Model:\n`;
      output += this.formatDataModel(surface.dataModel, '  ');
    }

    // Show bindings
    const bindings = this.collectBindings(surface);
    if (bindings.length > 0) {
      output += `\n🔗 Data Bindings:\n`;
      for (const binding of bindings) {
        output += `  ${binding.component} → ${binding.source}`;
        if (binding.transform) {
          output += ` (transform: ${binding.transform})`;
        }
        output += '\n';
      }
    }

    return output;
  }

  private countTypes(obj: Record<string, unknown>, result: Record<string, number>): void {
    for (const value of Object.values(obj)) {
      const type = this.getType(value);
      result[type] = (result[type] || 0) + 1;
    }
  }

  private getType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  private countKeys(obj: Record<string, unknown>): number {
    let count = 0;

    for (const value of Object.values(obj)) {
      count++;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count += this.countKeys(value as Record<string, unknown>);
      }
    }

    return count;
  }

  private extractDataPaths(obj: Record<string, unknown>, prefix = ''): string[] {
    const paths: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      paths.push(path);

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        paths.push(...this.extractDataPaths(value as Record<string, unknown>, path));
      }
    }

    return paths;
  }

  private formatDataModel(obj: Record<string, unknown>, indent: string): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        lines.push(`${indent}${key}:`);
        lines.push(this.formatDataModel(value as Record<string, unknown>, indent + '  '));
      } else if (Array.isArray(value)) {
        lines.push(`${indent}${key}: [${value.length} items]`);
      } else {
        lines.push(`${indent}${key}: ${this.formatValue(value)}`);
      }
    }

    return lines.join('\n');
  }

  private formatValue(value: unknown): string {
    if (typeof value === 'string') {
      if (value.length > 50) {
        return `"${value.substring(0, 47)}..."`;
      }
      return `"${value}"`;
    }
    return JSON.stringify(value);
  }

  private collectBindings(surface: SurfaceComponents): Array<{
    component: string;
    source: string;
    transform?: string;
  }> {
    const bindings: Array<{ component: string; source: string; transform?: string }> = [];

    for (const [id, comp] of surface.components.entries()) {
      if (comp.dataBindings) {
        for (const binding of comp.dataBindings) {
          bindings.push({
            component: `${comp.type}(${id})`,
            source: binding.source,
            transform: binding.transform
          });
        }
      }
    }

    return bindings;
  }

  /**
   * Analyze and return structured JSON output
   */
  analyzeJSON(surface: SurfaceComponents): DataModelAnalysis {
    const stats = this.analyzeDataModel(surface);
    const warnings: string[] = [];

    // Collect warnings
    if (stats.boundComponents === 0 && surface.components.size > 5) {
      warnings.push(`Large component tree (${surface.components.size} comps) but no data bindings detected`);
    }

    if (stats.totalKeys === 0 && surface.components.size > 0) {
      warnings.push(`No data model defined, but ${surface.components.size} components exist`);
    }

    // Build simplified data model tree
    const dataModelTree = this.buildDataModelTree(surface.dataModel || {});

    const { surfaceId: _surfaceId, ...rest } = stats;
    return {
      ...rest,
      warnings,
      dataModelTree
    };
  }

  /**
   * Build simplified tree from data model
   */
  private buildDataModelTree(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
    if (depth > 5) {
      return { _maxDepth: true };
    }

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.buildDataModelTree(value as Record<string, unknown>, depth + 1);
      } else if (Array.isArray(value)) {
        result[key] = { _type: 'array', _length: value.length };
      } else {
        result[key] = { _type: typeof value, _value: value };
      }
    }

    return result;
  }
}
