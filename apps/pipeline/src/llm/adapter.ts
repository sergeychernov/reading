/**
 * Re-export LlmAdapter from @reading/jobs so pipeline adapters (DynamicAdapter,
 * GatewayAdapter, StubAdapter) implement the same interface used by jobs.
 */
export type { LlmAdapter } from '@reading/jobs';
