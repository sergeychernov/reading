import 'reflect-metadata';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: INestApplication | undefined;

async function getApp(): Promise<INestApplication> {
	if (!app) {
		app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
		app.enableCors();
		await app.init();
	}
	return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
	const nestApp = await getApp();
	const server = nestApp.getHttpAdapter().getInstance();
	server(req, res);
}
