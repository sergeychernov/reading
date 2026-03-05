import { Injectable } from '@nestjs/common';
import type { LlmAdapter } from '../llm/adapter';
import { StubAdapter } from '../llm/stub-adapter';

export const LLM_ADAPTER = Symbol('LLM_ADAPTER');

/**
 * NestJS provider for the LLM adapter.
 * Replace StubAdapter with a real implementation when LLM provider is configured.
 */
@Injectable()
export class LlmAdapterProvider {
	private readonly adapter: LlmAdapter;

	constructor() {
		// When an LLM provider is configured, swap StubAdapter here:
		// if (process.env.OPENAI_API_KEY) {
		//     this.adapter = new OpenAiAdapter();
		// } else {
		this.adapter = new StubAdapter();
		// }
	}

	getAdapter(): LlmAdapter {
		return this.adapter;
	}
}
