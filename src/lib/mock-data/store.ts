// Compatibility facade; pages and mutations intentionally share the same repository.
export * from '../factory/store';
export { generateAnalysis as generateMockAnalysis, generateAudit as generateMockAudit, generateScore as generateMockScore } from '../factory/store';
export { generateExport as generateMockExport } from '../factory/export';
