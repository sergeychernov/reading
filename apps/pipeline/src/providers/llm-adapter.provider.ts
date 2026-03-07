import { Injectable } from '@nestjs/common';
import type { LlmAdapter } from '../llm/adapter';
import { DynamicAdapter } from '../llm/dynamic-adapter';

export const LLM_ADAPTER = Symbol('LLM_ADAPTER');

/**
 * NestJS provider for the LLM adapter.
 * Returns a DynamicAdapter that reads the active config from MongoDB on every call,
 * reflecting changes made in the admin panel without a server restart.
 */
@Injectable()
export class LlmAdapterProvider {
	private readonly adapter: LlmAdapter = new DynamicAdapter();

	getAdapter(): LlmAdapter {
		return this.adapter;
	}
}
