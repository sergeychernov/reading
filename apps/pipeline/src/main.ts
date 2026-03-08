import 'reflect-metadata';
import type { NextFunction, Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? 3001;

/** Header expected when PIPELINE_API_SECRET is set. Callers must send this. */
export const INTERNAL_SECRET_HEADER = 'x-internal-secret';

function internalSecretMiddleware(req: Request, res: Response, next: NextFunction): void {
	const secret = process.env.PIPELINE_API_SECRET;
	if (!secret) {
		next();
		return;
	}
	if (!req.path.startsWith('/api/v1/')) {
		next();
		return;
	}
	const header = req.headers[INTERNAL_SECRET_HEADER];
	if (header !== secret) {
		res.status(401).json({ error: 'Unauthorized' }).end();
		return;
	}
	next();
}

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'log'],
	});

	app.use(internalSecretMiddleware);
	app.enableCors();

	await app.listen(PORT);

	console.log(`Pipeline server running on http://localhost:${PORT}`);
}

bootstrap().catch((err) => {
	console.error('Failed to start pipeline server:', err);
	process.exit(1);
});
