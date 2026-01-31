/**
 * A2UI Protocol (v0.8) Types
 */
export interface A2UIMessage {
    type: 'surfaceUpdate' | 'dataModelUpdate' | 'beginRendering' | 'deleteSurface';
    surfaceId: string;
}
export interface SurfaceUpdate extends A2UIMessage {
    type: 'surfaceUpdate';
    surfaceId: string;
    components: Component[];
}
export interface DataModelUpdate extends A2UIMessage {
    type: 'dataModelUpdate';
    surfaceId: string;
    dataModel: Record<string, unknown>;
    replace?: boolean;
}
export interface BeginRendering extends A2UIMessage {
    type: 'beginRendering';
    surfaceId: string;
    rootComponentId: string;
    catalog?: ComponentCatalog;
}
export interface DeleteSurface extends A2UIMessage {
    type: 'deleteSurface';
    surfaceId: string;
}
export interface Component {
    id: string;
    type: string;
    props?: Record<string, unknown>;
    children?: string[];
    dataBindings?: DataBinding[];
}
export interface DataBinding {
    source: string;
    target: string;
    transform?: string;
}
export interface ComponentCatalog {
    [componentType: string]: string;
}
export interface UserAction {
    type: 'userAction';
    componentId: string;
    action: string;
    payload?: Record<string, unknown>;
}
export interface ClientError {
    type: 'error';
    message: string;
    details?: Record<string, unknown>;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    line: number;
    message: string;
    code: string;
}
export interface ValidationWarning {
    line: number;
    message: string;
    code: string;
}
export interface ParsedStream {
    messages: Array<A2UIMessage & {
        line: number;
    }>;
    surfaces: Map<string, SurfaceComponents>;
    errors: ValidationError[];
}
export interface SurfaceComponents {
    surfaceId: string;
    components: Map<string, Component>;
    rootId?: string;
    catalog?: ComponentCatalog;
    dataModel?: Record<string, unknown>;
}
//# sourceMappingURL=types.d.ts.map