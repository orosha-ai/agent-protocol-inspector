/**
 * A2UI Tree Visualizer
 */
import { SurfaceComponents } from './types';
export declare class A2UIVisualizer {
    /**
     * Generate ASCII tree representation of component hierarchy
     */
    visualizeTree(surface: SurfaceComponents): string;
    private renderNode;
    private formatValue;
    /**
     * Generate JSON representation of component tree
     */
    toJSON(surface: SurfaceComponents): string;
    private buildNode;
}
//# sourceMappingURL=visualizer.d.ts.map