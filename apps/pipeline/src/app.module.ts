import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { NeurolineModule } from 'neuroline-nestjs';
import { waitUntil } from '@vercel/functions';
import { MongoPipelineStorage, PipelineSchema } from 'neuroline/mongo';
import type { MongoPipelineDocument } from 'neuroline/mongo';
import type { Model } from 'mongoose';
import { bookProcessingPipeline } from './pipeline/book-processing.pipeline';
import { chapterExtractionPipeline } from './pipeline/chapter-extraction.pipeline';
import { LlmAdapterProvider } from './providers/llm-adapter.provider';

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';

@Module({
	imports: [
		MongooseModule.forRoot(MONGODB_URI, { dbName: DB_NAME }),
		NeurolineModule.forRootAsync({
			imports: [
				MongooseModule.forFeature([
					{ name: 'Pipeline', schema: PipelineSchema },
				]),
			],
			useFactory: (pipelineModel: Model<MongoPipelineDocument>) =>
				new MongoPipelineStorage(pipelineModel),
			inject: [getModelToken('Pipeline')],
			onExecutionStart: process.env.VERCEL
				? (promise) => waitUntil(promise)
				: undefined,
			controllers: [
				{
					path: 'api/v1/book-processing',
					pipeline: bookProcessingPipeline,
				},
				{
					path: 'api/v1/chapter-extraction',
					pipeline: chapterExtractionPipeline,
				},
			],
		}),
	],
	providers: [LlmAdapterProvider],
})
export class AppModule {}
