/**
 * Agent Protocol Inspector
 *
 * Main entry point for programmatic usage
 */

export { A2UIValidator } from './validator';
export { A2UIVisualizer } from './visualizer';
export { A2UIAnalyzer } from './analyzer';
export { A2UIMock } from './mock';

export type {
  A2UIMessage,
  SurfaceUpdate,
  DataModelUpdate,
  BeginRendering,
  DeleteSurface,
  Component,
  ComponentCatalog,
  UserAction,
  ClientError,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ParsedStream,
  SurfaceComponents
} from './types';
