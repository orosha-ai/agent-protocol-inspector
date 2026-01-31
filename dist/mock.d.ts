/**
 * A2UI Mock Message Generator
 */
export declare class A2UIMock {
    /**
     * Generate a sample A2UI stream
     */
    generateStream(options: {
        surfaceId?: string;
        components?: number;
        dataModel?: boolean;
        depth?: number;
    }): string;
    /**
     * Generate component definitions
     */
    private generateComponents;
    /**
     * Generate component props
     */
    private generateProps;
    /**
     * Generate data model
     */
    private generateDataModel;
    /**
     * Generate component catalog
     */
    private generateCatalog;
    /**
     * Write mock stream to file
     */
    writeToFile(path: string, options?: Parameters<typeof this.generateStream>[0]): void;
}
//# sourceMappingURL=mock.d.ts.map