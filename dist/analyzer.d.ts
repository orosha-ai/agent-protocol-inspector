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
export interface DataModelAnalysis {
    totalKeys: number;
    valueTypes: Record<string, number>;
    boundComponents: number;
    dataPaths: string[];
    warnings: string[];
    dataModelTree: Record<string, unknown>;
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
    /**
     * Analyze and return structured JSON output
     */
    analyzeJSON(surface: SurfaceComponents): DataModelAnalysis;
    /**
     * Build simplified tree from data model
     */
    private buildDataModelTree;
}
//# sourceMappingURL=analyzer.d.ts.map