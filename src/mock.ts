/**
 * A2UI Mock Message Generator
 */

import {
  SurfaceUpdate,
  DataModelUpdate,
  BeginRendering,
  Component,
  ComponentCatalog
} from './types';

export class A2UIMock {
  /**
   * Generate a sample A2UI stream
   */
  generateStream(options: {
    surfaceId?: string;
    components?: number;
    dataModel?: boolean;
    depth?: number;
  }): string {
    const surfaceId = options.surfaceId || 'sample';
    const componentCount = options.components || 5;
    const withDataModel = options.dataModel !== false;
    const depth = options.depth || 2;

    const lines: string[] = [];

    // Generate component hierarchy
    const components = this.generateComponents(componentCount, depth);

    // First batch: surfaceUpdate
    lines.push(
      JSON.stringify({
        type: 'surfaceUpdate',
        surfaceId,
        components: components.slice(0, Math.ceil(componentCount / 2))
      } satisfies SurfaceUpdate)
    );

    // Second batch: more components
    lines.push(
      JSON.stringify({
        type: 'surfaceUpdate',
        surfaceId,
        components: components.slice(Math.ceil(componentCount / 2))
      } satisfies SurfaceUpdate)
    );

    // Data model update (optional)
    if (withDataModel) {
      lines.push(
        JSON.stringify({
          type: 'dataModelUpdate',
          surfaceId,
          dataModel: this.generateDataModel(),
          replace: false
        } satisfies DataModelUpdate)
      );
    }

    // Begin rendering
    lines.push(
      JSON.stringify({
        type: 'beginRendering',
        surfaceId,
        rootComponentId: components[0]?.id,
        catalog: this.generateCatalog()
      } satisfies BeginRendering)
    );

    return lines.join('\n') + '\n';
  }

  /**
   * Generate component definitions
   */
  private generateComponents(count: number, maxDepth: number): Component[] {
    const components: Component[] = [];
    const componentTypes = ['Container', 'Text', 'Button', 'Card', 'Row', 'Column'];

    for (let i = 0; i < count; i++) {
      const id = `comp_${i}`;
      const type = componentTypes[i % componentTypes.length];
      const isContainer = ['Container', 'Row', 'Column'].includes(type);
      const depth = Math.floor(Math.random() * maxDepth);

      const comp: Component = {
        id,
        type,
        props: this.generateProps(type)
      };

      // Add children for containers (not leaf nodes)
      if (isContainer && depth < maxDepth) {
        const childCount = Math.floor(Math.random() * 3) + 1;
        const startIdx = (i + 1) % count;
        comp.children = [];
        for (let j = 0; j < childCount && i + j + 1 < count; j++) {
          comp.children.push(`comp_${(startIdx + j) % count}`);
        }
      }

      components.push(comp);
    }

    return components;
  }

  /**
   * Generate component props
   */
  private generateProps(type: string): Record<string, unknown> {
    const baseProps: Record<string, unknown> = {
      style: {
        padding: Math.floor(Math.random() * 20) + 8,
        margin: Math.floor(Math.random() * 10)
      }
    };

    switch (type) {
      case 'Text':
        return {
          ...baseProps,
          text: ['Hello World', 'Dashboard', 'Welcome', 'System Status'][
            Math.floor(Math.random() * 4)
          ],
          fontSize: [14, 16, 18, 24][Math.floor(Math.random() * 4)]
        };
      case 'Button':
        return {
          ...baseProps,
          label: ['Click Me', 'Submit', 'Cancel', 'Save'][Math.floor(Math.random() * 4)],
          disabled: Math.random() > 0.8,
          variant: ['primary', 'secondary', 'outline'][Math.floor(Math.random() * 3)]
        };
      case 'Card':
        return {
          ...baseProps,
          elevation: Math.floor(Math.random() * 4),
          radius: 8
        };
      default:
        return baseProps;
    }
  }

  /**
   * Generate data model
   */
  private generateDataModel(): Record<string, unknown> {
    return {
      user: {
        name: 'Alice',
        role: 'Admin',
        active: true
      },
      dashboard: {
        title: 'Overview',
        stats: {
          users: 1234,
          sessions: 5678,
          revenue: 12345.67
        }
      },
      notifications: [
        { id: 1, read: false, message: 'New user registered' },
        { id: 2, read: true, message: 'System update available' }
      ]
    };
  }

  /**
   * Generate component catalog
   */
  private generateCatalog(): ComponentCatalog {
    return {
      Container: 'div',
      Text: 'span',
      Button: 'button',
      Card: 'div.card',
      Row: 'div.row',
      Column: 'div.column',
      Icon: 'i'
    };
  }

  /**
   * Write mock stream to file
   */
  writeToFile(path: string, options?: Parameters<typeof this.generateStream>[0]): void {
    const fs = require('fs');
    const stream = this.generateStream(options || {});
    fs.writeFileSync(path, stream, 'utf8');
    console.log(`✓ Wrote mock stream to ${path}`);
  }
}
