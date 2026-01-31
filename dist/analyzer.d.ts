/**
 * A2UI Data Model Analyzer
 */
import { SurfaceComponents } from './types';
export interface DataModelStats {
    surfaceId: string;
    totalKeys: number;
    valueTypes: Record<string, number>;
    boundComponents: number;
    dataPaths: string[];
}
export declare class A2UIAnalyzer {
    /**
     * Analyze data model for a surface
     */
    analyzeDataModel(surface: SurfaceComponents): DataModelStats;
    /**
     * Generate data model report
     */
    generateReport(surface: SurfaceComponents): string;
    private countTypes;
    private getType;
    private countKeys;
    private extractDataPaths;
    private formatDataModel;
    private formatValue;
    private collectBindings;
}
//# sourceMappingURL=analyzer.d.ts.map