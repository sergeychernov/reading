export interface GatewayConfig {
	model: string;
	maxTokens: number;
	/** Sampling temperature 0–2. Lower = more deterministic. Default 0.2. */
	temperature?: number;
}

export interface LlmAdapterConfig {
	adapter: 'gateway' | 'stub';
	gateway: GatewayConfig;
}

export const LLM_JOB_NAMES = [
	'extract-summary',
	'extract-idioms',
	'extract-phrasal-verbs',
	'extract-rare-words',
	'extract-rarity',
	'extract-meaning-en',
	'extract-meaning-ru',
] as const;

export type LlmJobName = (typeof LLM_JOB_NAMES)[number];

export interface LlmConfig {
	default: LlmAdapterConfig;
	jobs?: Partial<Record<LlmJobName, LlmAdapterConfig>>;
}

export interface GatewayModelOption {
	id: string;
	label: string;
	/** Provider key (e.g. anthropic, openai) for grouping. */
	provider: string;
	/** Version string for grouping (e.g. 4.6, 5.2, other). */
	version: string;
}

/** Ids of non–text models (image/embedding/video) to exclude from the dropdown. */
const NON_TEXT_MODEL_IDS = new Set([
	'google/gemini-2.5-flash-image',
	'google/gemini-3-pro-image',
	'google/gemini-3.1-flash-image-preview',
	'mistral/pixtral-12b',
	'mistral/pixtral-large',
]);

/**
 * All Vercel AI Gateway language (text) model ids with labels.
 * Sourced from @ai-sdk/gateway GatewayModelId, excluding image/embedding/video.
 * Only these models are shown in the admin form for chapter extraction.
 */
export const GATEWAY_MODELS: GatewayModelOption[] = [
	// Alibaba
	{ id: 'alibaba/qwen-3-14b', label: 'Qwen 3 14B (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen-3-235b', label: 'Qwen 3 235B (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen-3-30b', label: 'Qwen 3 30B (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen-3-32b', label: 'Qwen 3 32B (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-235b-a22b-thinking', label: 'Qwen3 235B Thinking (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-coder', label: 'Qwen3 Coder (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-coder-30b-a3b', label: 'Qwen3 Coder 30B (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-coder-next', label: 'Qwen3 Coder Next (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-coder-plus', label: 'Qwen3 Coder Plus (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-max', label: 'Qwen3 Max (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-max-preview', label: 'Qwen3 Max Preview (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-max-thinking', label: 'Qwen3 Max Thinking (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-next-80b-a3b-instruct', label: 'Qwen3 Next 80B Instruct (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-next-80b-a3b-thinking', label: 'Qwen3 Next 80B Thinking (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-vl-instruct', label: 'Qwen3 VL Instruct (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3-vl-thinking', label: 'Qwen3 VL Thinking (Alibaba)', provider: 'alibaba', version: '3' },
	{ id: 'alibaba/qwen3.5-flash', label: 'Qwen 3.5 Flash (Alibaba)', provider: 'alibaba', version: '3.5' },
	{ id: 'alibaba/qwen3.5-plus', label: 'Qwen 3.5 Plus (Alibaba)', provider: 'alibaba', version: '3.5' },
	// Amazon
	{ id: 'amazon/nova-2-lite', label: 'Nova 2 Lite (Amazon)', provider: 'amazon', version: '2' },
	{ id: 'amazon/nova-lite', label: 'Nova Lite (Amazon)', provider: 'amazon', version: 'other' },
	{ id: 'amazon/nova-micro', label: 'Nova Micro (Amazon)', provider: 'amazon', version: 'other' },
	{ id: 'amazon/nova-pro', label: 'Nova Pro (Amazon)', provider: 'amazon', version: 'other' },
	// Anthropic
	{ id: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (Anthropic)', provider: 'anthropic', version: '3' },
	{ id: 'anthropic/claude-3-opus', label: 'Claude 3 Opus (Anthropic)', provider: 'anthropic', version: '3' },
	{ id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (Anthropic)', provider: 'anthropic', version: '3.5' },
	{ id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)', provider: 'anthropic', version: '3.5' },
	{ id: 'anthropic/claude-3.5-sonnet-20240620', label: 'Claude 3.5 Sonnet 20240620 (Anthropic)', provider: 'anthropic', version: '3.5' },
	{ id: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet (Anthropic)', provider: 'anthropic', version: '3.7' },
	{ id: 'anthropic/claude-haiku-4.5', label: 'Claude Haiku 4.5 (Anthropic)', provider: 'anthropic', version: '4.5' },
	{ id: 'anthropic/claude-opus-4', label: 'Claude Opus 4 (Anthropic)', provider: 'anthropic', version: '4' },
	{ id: 'anthropic/claude-opus-4.1', label: 'Claude Opus 4.1 (Anthropic)', provider: 'anthropic', version: '4.1' },
	{ id: 'anthropic/claude-opus-4.5', label: 'Claude Opus 4.5 (Anthropic)', provider: 'anthropic', version: '4.5' },
	{ id: 'anthropic/claude-opus-4.6', label: 'Claude Opus 4.6 (Anthropic)', provider: 'anthropic', version: '4.6' },
	{ id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4 (Anthropic)', provider: 'anthropic', version: '4' },
	{ id: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5 (Anthropic)', provider: 'anthropic', version: '4.5' },
	{ id: 'anthropic/claude-sonnet-4.6', label: 'Claude Sonnet 4.6 (Anthropic)', provider: 'anthropic', version: '4.6' },
	// Arcee AI
	{ id: 'arcee-ai/trinity-large-preview', label: 'Trinity Large Preview (Arcee)', provider: 'arcee-ai', version: 'other' },
	{ id: 'arcee-ai/trinity-mini', label: 'Trinity Mini (Arcee)', provider: 'arcee-ai', version: 'other' },
	// Bytedance
	{ id: 'bytedance/seed-1.6', label: 'Seed 1.6 (Bytedance)', provider: 'bytedance', version: '1.6' },
	{ id: 'bytedance/seed-1.8', label: 'Seed 1.8 (Bytedance)', provider: 'bytedance', version: '1.8' },
	// Cohere
	{ id: 'cohere/command-a', label: 'Command A (Cohere)', provider: 'cohere', version: 'other' },
	// DeepSeek
	{ id: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (DeepSeek)', provider: 'deepseek', version: 'other' },
	{ id: 'deepseek/deepseek-v3', label: 'DeepSeek V3 (DeepSeek)', provider: 'deepseek', version: '3' },
	{ id: 'deepseek/deepseek-v3.1', label: 'DeepSeek V3.1 (DeepSeek)', provider: 'deepseek', version: '3.1' },
	{ id: 'deepseek/deepseek-v3.1-terminus', label: 'DeepSeek V3.1 Terminus (DeepSeek)', provider: 'deepseek', version: '3.1' },
	{ id: 'deepseek/deepseek-v3.2', label: 'DeepSeek V3.2 (DeepSeek)', provider: 'deepseek', version: '3.2' },
	{ id: 'deepseek/deepseek-v3.2-thinking', label: 'DeepSeek V3.2 Thinking (DeepSeek)', provider: 'deepseek', version: '3.2' },
	// Google (text only; image models excluded)
	{ id: 'google/gemini-2.0-flash', label: 'Gemini 2.0 Flash (Google)', provider: 'google', version: '2.0' },
	{ id: 'google/gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (Google)', provider: 'google', version: '2.0' },
	{ id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)', provider: 'google', version: '2.5' },
	{ id: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Google)', provider: 'google', version: '2.5' },
	{ id: 'google/gemini-2.5-flash-lite-preview-09-2025', label: 'Gemini 2.5 Flash Lite Preview (Google)', provider: 'google', version: '2.5' },
	{ id: 'google/gemini-2.5-flash-preview-09-2025', label: 'Gemini 2.5 Flash Preview (Google)', provider: 'google', version: '2.5' },
	{ id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (Google)', provider: 'google', version: '2.5' },
	{ id: 'google/gemini-3-flash', label: 'Gemini 3 Flash (Google)', provider: 'google', version: '3' },
	{ id: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro Preview (Google)', provider: 'google', version: '3' },
	{ id: 'google/gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite Preview (Google)', provider: 'google', version: '3.1' },
	{ id: 'google/gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview (Google)', provider: 'google', version: '3.1' },
	// Inception
	{ id: 'inception/mercury-coder-small', label: 'Mercury Coder Small (Inception)', provider: 'inception', version: 'other' },
	// Kwaipilot
	{ id: 'kwaipilot/kat-coder-pro-v1', label: 'Kat Coder Pro v1 (Kwaipilot)', provider: 'kwaipilot', version: 'other' },
	// Meituan
	{ id: 'meituan/longcat-flash-chat', label: 'Longcat Flash Chat (Meituan)', provider: 'meituan', version: 'other' },
	{ id: 'meituan/longcat-flash-thinking', label: 'Longcat Flash Thinking (Meituan)', provider: 'meituan', version: 'other' },
	// Meta
	{ id: 'meta/llama-3.1-70b', label: 'Llama 3.1 70B (Meta)', provider: 'meta', version: '3.1' },
	{ id: 'meta/llama-3.1-8b', label: 'Llama 3.1 8B (Meta)', provider: 'meta', version: '3.1' },
	{ id: 'meta/llama-3.2-11b', label: 'Llama 3.2 11B (Meta)', provider: 'meta', version: '3.2' },
	{ id: 'meta/llama-3.2-1b', label: 'Llama 3.2 1B (Meta)', provider: 'meta', version: '3.2' },
	{ id: 'meta/llama-3.2-3b', label: 'Llama 3.2 3B (Meta)', provider: 'meta', version: '3.2' },
	{ id: 'meta/llama-3.2-90b', label: 'Llama 3.2 90B (Meta)', provider: 'meta', version: '3.2' },
	{ id: 'meta/llama-3.3-70b', label: 'Llama 3.3 70B (Meta)', provider: 'meta', version: '3.3' },
	{ id: 'meta/llama-4-maverick', label: 'Llama 4 Maverick (Meta)', provider: 'meta', version: '4' },
	{ id: 'meta/llama-4-scout', label: 'Llama 4 Scout (Meta)', provider: 'meta', version: '4' },
	// Minimax
	{ id: 'minimax/minimax-m2', label: 'Minimax M2 (Minimax)', provider: 'minimax', version: '2' },
	{ id: 'minimax/minimax-m2.1', label: 'Minimax M2.1 (Minimax)', provider: 'minimax', version: '2.1' },
	{ id: 'minimax/minimax-m2.1-lightning', label: 'Minimax M2.1 Lightning (Minimax)', provider: 'minimax', version: '2.1' },
	{ id: 'minimax/minimax-m2.5', label: 'Minimax M2.5 (Minimax)', provider: 'minimax', version: '2.5' },
	// Mistral (text; pixtral excluded)
	{ id: 'mistral/codestral', label: 'Codestral (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/devstral-2', label: 'Devstral 2 (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/devstral-small', label: 'Devstral Small (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/devstral-small-2', label: 'Devstral Small 2 (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/magistral-medium', label: 'Magistral Medium (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/magistral-small', label: 'Magistral Small (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/ministral-14b', label: 'Ministral 14B (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/ministral-3b', label: 'Ministral 3B (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/ministral-8b', label: 'Ministral 8B (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/mistral-large-3', label: 'Mistral Large 3 (Mistral)', provider: 'mistral', version: '3' },
	{ id: 'mistral/mistral-medium', label: 'Mistral Medium (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/mistral-nemo', label: 'Mistral Nemo (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/mistral-small', label: 'Mistral Small (Mistral)', provider: 'mistral', version: 'other' },
	{ id: 'mistral/mixtral-8x22b-instruct', label: 'Mixtral 8x22B Instruct (Mistral)', provider: 'mistral', version: 'other' },
	// Moonshot
	{ id: 'moonshotai/kimi-k2', label: 'Kimi K2 (Moonshot)', provider: 'moonshotai', version: '2' },
	{ id: 'moonshotai/kimi-k2-0905', label: 'Kimi K2 0905 (Moonshot)', provider: 'moonshotai', version: '2' },
	{ id: 'moonshotai/kimi-k2-thinking', label: 'Kimi K2 Thinking (Moonshot)', provider: 'moonshotai', version: '2' },
	{ id: 'moonshotai/kimi-k2-thinking-turbo', label: 'Kimi K2 Thinking Turbo (Moonshot)', provider: 'moonshotai', version: '2' },
	{ id: 'moonshotai/kimi-k2-turbo', label: 'Kimi K2 Turbo (Moonshot)', provider: 'moonshotai', version: '2' },
	{ id: 'moonshotai/kimi-k2.5', label: 'Kimi K2.5 (Moonshot)', provider: 'moonshotai', version: '2.5' },
	// Morph
	{ id: 'morph/morph-v3-fast', label: 'Morph V3 Fast (Morph)', provider: 'morph', version: '3' },
	{ id: 'morph/morph-v3-large', label: 'Morph V3 Large (Morph)', provider: 'morph', version: '3' },
	// NVIDIA
	{ id: 'nvidia/nemotron-3-nano-30b-a3b', label: 'Nemotron 3 Nano 30B (NVIDIA)', provider: 'nvidia', version: '3' },
	{ id: 'nvidia/nemotron-nano-12b-v2-vl', label: 'Nemotron Nano 12B VL (NVIDIA)', provider: 'nvidia', version: 'other' },
	{ id: 'nvidia/nemotron-nano-9b-v2', label: 'Nemotron Nano 9B (NVIDIA)', provider: 'nvidia', version: 'other' },
	// OpenAI
	{ id: 'openai/codex-mini', label: 'Codex Mini (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)', provider: 'openai', version: '3.5' },
	{ id: 'openai/gpt-3.5-turbo-instruct', label: 'GPT-3.5 Turbo Instruct (OpenAI)', provider: 'openai', version: '3.5' },
	{ id: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)', provider: 'openai', version: '4' },
	{ id: 'openai/gpt-4.1', label: 'GPT-4.1 (OpenAI)', provider: 'openai', version: '4.1' },
	{ id: 'openai/gpt-4.1-mini', label: 'GPT-4.1 Mini (OpenAI)', provider: 'openai', version: '4.1' },
	{ id: 'openai/gpt-4.1-nano', label: 'GPT-4.1 Nano (OpenAI)', provider: 'openai', version: '4.1' },
	{ id: 'openai/gpt-4o', label: 'GPT-4o (OpenAI)', provider: 'openai', version: '4' },
	{ id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)', provider: 'openai', version: '4' },
	{ id: 'openai/gpt-4o-mini-search-preview', label: 'GPT-4o Mini Search Preview (OpenAI)', provider: 'openai', version: '4' },
	{ id: 'openai/gpt-5', label: 'GPT-5 (OpenAI)', provider: 'openai', version: '5' },
	{ id: 'openai/gpt-5-chat', label: 'GPT-5 Chat (OpenAI)', provider: 'openai', version: '5' },
	{ id: 'openai/gpt-5-codex', label: 'GPT-5 Codex (OpenAI)', provider: 'openai', version: '5' },
	{ id: 'openai/gpt-5-mini', label: 'GPT-5 Mini (OpenAI)', provider: 'openai', version: '5' },
	{ id: 'openai/gpt-5-nano', label: 'GPT-5 Nano (OpenAI)', provider: 'openai', version: '5' },
	{ id: 'openai/gpt-5-pro', label: 'GPT-5 Pro (OpenAI)', provider: 'openai', version: '5' },
	{ id: 'openai/gpt-5.1-codex', label: 'GPT-5.1 Codex (OpenAI)', provider: 'openai', version: '5.1' },
	{ id: 'openai/gpt-5.1-codex-max', label: 'GPT-5.1 Codex Max (OpenAI)', provider: 'openai', version: '5.1' },
	{ id: 'openai/gpt-5.1-codex-mini', label: 'GPT-5.1 Codex Mini (OpenAI)', provider: 'openai', version: '5.1' },
	{ id: 'openai/gpt-5.1-instant', label: 'GPT-5.1 Instant (OpenAI)', provider: 'openai', version: '5.1' },
	{ id: 'openai/gpt-5.1-thinking', label: 'GPT-5.1 Thinking (OpenAI)', provider: 'openai', version: '5.1' },
	{ id: 'openai/gpt-5.2', label: 'GPT-5.2 (OpenAI)', provider: 'openai', version: '5.2' },
	{ id: 'openai/gpt-5.2-chat', label: 'GPT-5.2 Chat (OpenAI)', provider: 'openai', version: '5.2' },
	{ id: 'openai/gpt-5.2-codex', label: 'GPT-5.2 Codex (OpenAI)', provider: 'openai', version: '5.2' },
	{ id: 'openai/gpt-5.2-pro', label: 'GPT-5.2 Pro (OpenAI)', provider: 'openai', version: '5.2' },
	{ id: 'openai/gpt-5.3-chat', label: 'GPT-5.3 Chat (OpenAI)', provider: 'openai', version: '5.3' },
	{ id: 'openai/gpt-5.3-codex', label: 'GPT-5.3 Codex (OpenAI)', provider: 'openai', version: '5.3' },
	{ id: 'openai/gpt-oss-120b', label: 'GPT OSS 120B (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/gpt-oss-20b', label: 'GPT OSS 20B (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/gpt-oss-safeguard-20b', label: 'GPT OSS Safeguard 20B (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/o1', label: 'o1 (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/o3', label: 'o3 (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/o3-deep-research', label: 'o3 Deep Research (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/o3-mini', label: 'o3 Mini (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/o3-pro', label: 'o3 Pro (OpenAI)', provider: 'openai', version: 'other' },
	{ id: 'openai/o4-mini', label: 'o4 Mini (OpenAI)', provider: 'openai', version: 'other' },
	// Perplexity
	{ id: 'perplexity/sonar', label: 'Sonar (Perplexity)', provider: 'perplexity', version: 'other' },
	{ id: 'perplexity/sonar-pro', label: 'Sonar Pro (Perplexity)', provider: 'perplexity', version: 'other' },
	{ id: 'perplexity/sonar-reasoning', label: 'Sonar Reasoning (Perplexity)', provider: 'perplexity', version: 'other' },
	{ id: 'perplexity/sonar-reasoning-pro', label: 'Sonar Reasoning Pro (Perplexity)', provider: 'perplexity', version: 'other' },
	// Prime Intellect
	{ id: 'prime-intellect/intellect-3', label: 'Intellect 3 (Prime Intellect)', provider: 'prime-intellect', version: '3' },
	// Vercel
	{ id: 'vercel/v0-1.0-md', label: 'V0 1.0 MD (Vercel)', provider: 'vercel', version: '1.0' },
	{ id: 'vercel/v0-1.5-md', label: 'V0 1.5 MD (Vercel)', provider: 'vercel', version: '1.5' },
	// xAI
	{ id: 'xai/grok-2-vision', label: 'Grok 2 Vision (xAI)', provider: 'xai', version: '2' },
	{ id: 'xai/grok-3', label: 'Grok 3 (xAI)', provider: 'xai', version: '3' },
	{ id: 'xai/grok-3-fast', label: 'Grok 3 Fast (xAI)', provider: 'xai', version: '3' },
	{ id: 'xai/grok-3-mini', label: 'Grok 3 Mini (xAI)', provider: 'xai', version: '3' },
	{ id: 'xai/grok-3-mini-fast', label: 'Grok 3 Mini Fast (xAI)', provider: 'xai', version: '3' },
	{ id: 'xai/grok-4', label: 'Grok 4 (xAI)', provider: 'xai', version: '4' },
	{ id: 'xai/grok-4-fast-non-reasoning', label: 'Grok 4 Fast Non-Reasoning (xAI)', provider: 'xai', version: '4' },
	{ id: 'xai/grok-4-fast-reasoning', label: 'Grok 4 Fast Reasoning (xAI)', provider: 'xai', version: '4' },
	{ id: 'xai/grok-4.1-fast-non-reasoning', label: 'Grok 4.1 Fast Non-Reasoning (xAI)', provider: 'xai', version: '4.1' },
	{ id: 'xai/grok-4.1-fast-reasoning', label: 'Grok 4.1 Fast Reasoning (xAI)', provider: 'xai', version: '4.1' },
	{ id: 'xai/grok-code-fast-1', label: 'Grok Code Fast 1 (xAI)', provider: 'xai', version: 'other' },
	// Xiaomi
	{ id: 'xiaomi/mimo-v2-flash', label: 'Mimo V2 Flash (Xiaomi)', provider: 'xiaomi', version: '2' },
	// ZAI
	{ id: 'zai/glm-4.5', label: 'GLM 4.5 (ZAI)', provider: 'zai', version: '4.5' },
	{ id: 'zai/glm-4.5-air', label: 'GLM 4.5 Air (ZAI)', provider: 'zai', version: '4.5' },
	{ id: 'zai/glm-4.5v', label: 'GLM 4.5V (ZAI)', provider: 'zai', version: '4.5' },
	{ id: 'zai/glm-4.6', label: 'GLM 4.6 (ZAI)', provider: 'zai', version: '4.6' },
	{ id: 'zai/glm-4.6v', label: 'GLM 4.6V (ZAI)', provider: 'zai', version: '4.6' },
	{ id: 'zai/glm-4.6v-flash', label: 'GLM 4.6V Flash (ZAI)', provider: 'zai', version: '4.6' },
	{ id: 'zai/glm-4.7', label: 'GLM 4.7 (ZAI)', provider: 'zai', version: '4.7' },
	{ id: 'zai/glm-4.7-flashx', label: 'GLM 4.7 FlashX (ZAI)', provider: 'zai', version: '4.7' },
	{ id: 'zai/glm-5', label: 'GLM 5 (ZAI)', provider: 'zai', version: '5' },
].filter((m) => !NON_TEXT_MODEL_IDS.has(m.id));

/** Provider key (id prefix) -> display label. */
const PROVIDER_LABELS: Record<string, string> = {
	alibaba: 'Alibaba',
	amazon: 'Amazon',
	anthropic: 'Anthropic',
	'arcee-ai': 'Arcee AI',
	bytedance: 'Bytedance',
	cohere: 'Cohere',
	deepseek: 'DeepSeek',
	google: 'Google',
	inception: 'Inception',
	kwaipilot: 'Kwaipilot',
	meituan: 'Meituan',
	meta: 'Meta',
	minimax: 'Minimax',
	mistral: 'Mistral',
	moonshotai: 'Moonshot',
	morph: 'Morph',
	nvidia: 'NVIDIA',
	openai: 'OpenAI',
	perplexity: 'Perplexity',
	'prime-intellect': 'Prime Intellect',
	vercel: 'Vercel',
	xai: 'xAI',
	xiaomi: 'Xiaomi',
	zai: 'ZAI',
};

export interface GatewayModelGroupVersion {
	versionLabel: string;
	models: GatewayModelOption[];
}

export interface GatewayModelGroupProvider {
	providerKey: string;
	providerLabel: string;
	versions: GatewayModelGroupVersion[];
}

/**
 * GATEWAY_MODELS grouped by provider and version (from model options, no parsing).
 * Use in Select with ListSubheader for provider and version, MenuItem for each model.
 */
export function getGroupedGatewayModels(): GatewayModelGroupProvider[] {
	const byProvider = new Map<string, GatewayModelOption[]>();
	for (const m of GATEWAY_MODELS) {
		const list = byProvider.get(m.provider) ?? [];
		list.push(m);
		byProvider.set(m.provider, list);
	}
	const result: GatewayModelGroupProvider[] = [];
	for (const [providerKey, models] of byProvider.entries()) {
		const byVersion = new Map<string, GatewayModelOption[]>();
		for (const m of models) {
			const v = m.version;
			const list = byVersion.get(v) ?? [];
			list.push(m);
			byVersion.set(v, list);
		}
		const versions: GatewayModelGroupVersion[] = [];
		for (const [ver, list] of byVersion.entries()) {
			versions.push({
				versionLabel: ver === 'other' ? 'Other' : `v${ver}`,
				models: list.sort((a, b) => a.label.localeCompare(b.label)),
			});
		}
		versions.sort((a, b) => {
			if (a.versionLabel === 'Other') return 1;
			if (b.versionLabel === 'Other') return -1;
			return b.versionLabel.localeCompare(a.versionLabel);
		});
		result.push({
			providerKey,
			providerLabel: PROVIDER_LABELS[providerKey] ?? providerKey,
			versions,
		});
	}
	result.sort((a, b) => a.providerLabel.localeCompare(b.providerLabel));
	return result;
}

export const DEFAULT_LLM_CONFIG: LlmConfig = {
	default: {
		adapter: 'stub',
		gateway: {
			model: 'anthropic/claude-sonnet-4.6',
			maxTokens: 4096,
			temperature: 0.2,
		},
	},
	jobs: {},
};
