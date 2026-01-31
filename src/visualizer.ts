/**
 * A2UI Tree Visualizer
 */

import { SurfaceComponents, Component } from './types';

export class A2UIVisualizer {
  /**
   * Generate ASCII tree representation of component hierarchy
   */
  visualizeTree(surface: SurfaceComponents): string {
    if (!surface.rootId) {
      return '⚠️  No root component specified (no beginRendering message)';
    }

    const root = surface.components.get(surface.rootId);
    if (!root) {
      return `⚠️  Root component "${surface.rootId}" not found`;
    }

    let output = `📊 Component Tree: ${surface.surfaceId}\n`;
    output += `${'─'.repeat(50)}\n\n`;
    output += this.renderNode(root, surface.components, '', true);
    output += '\n';

    // Add catalog info if available
    if (surface.catalog && Object.keys(surface.catalog).length > 0) {
      output += `\n📚 Component Catalog:\n`;
      for (const [type, impl] of Object.entries(surface.catalog)) {
        output += `  ${type} → ${impl}\n`;
      }
    }

    return output;
  }

  private renderNode(
    node: Component,
    components: Map<string, Component>,
    prefix: string,
    isLast: boolean
  ): string {
    const connector = isLast ? '└──' : '├──';
    const childPrefix = isLast ? '    ' : '│   ';

    let output = `${prefix}${connector} ${node.type}`;

    // Show props
    if (node.props && Object.keys(node.props).length > 0) {
      const propsStr = Object.entries(node.props)
        .map(([k, v]) => `${k}=${this.formatValue(v)}`)
        .join(', ');
      output += ` [${propsStr}]`;
    }

    output += ` (${node.id})\n`;

    // Render children
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        const childId = node.children[i];
        const child = components.get(childId);

        if (child) {
          const isLastChild = i === node.children.length - 1;
          output += this.renderNode(child, components, prefix + childPrefix, isLastChild);
        } else {
          const isLastChild = i === node.children.length - 1;
          output += `${prefix}${childPrefix}${isLastChild ? '└──' : '├──'} ❌ Missing: ${childId}\n`;
        }
      }
    }

    return output;
  }

  private formatValue(value: unknown): string {
    if (typeof value === 'string') {
      if (value.length > 30) {
        return `"${value.substring(0, 27)}..."`;
      }
      return `"${value}"`;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (value === null) {
      return 'null';
    }
    return JSON.stringify(value);
  }

  /**
   * Generate JSON representation of component tree
   */
  toJSON(surface: SurfaceComponents): string {
    if (!surface.rootId) {
      return JSON.stringify({ error: 'No root component' }, null, 2);
    }

    const root = surface.components.get(surface.rootId);
    if (!root) {
      return JSON.stringify({ error: 'Root component not found' }, null, 2);
    }

    const tree = this.buildNode(root, surface.components);
    return JSON.stringify(tree, null, 2);
  }

  private buildNode(node: Component, components: Map<string, Component>): Record<string, unknown> {
    const result: Record<string, unknown> = {
      id: node.id,
      type: node.type
    };

    if (node.props) {
      result.props = node.props;
    }

    if (node.children && node.children.length > 0) {
      result.children = node.children
        .map((childId) => {
          const child = components.get(childId);
          return child ? this.buildNode(child, components) : { id: childId, error: 'not found' };
        })
        .filter((c) => c !== undefined);
    }

    return result;
  }
}
