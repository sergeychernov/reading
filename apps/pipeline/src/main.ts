import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? 3001;

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'log'],
	});

	app.enableCors();

	await app.listen(PORT);

	console.log(`Pipeline server running on http://localhost:${PORT}`);
}

bootstrap().catch((err) => {
	console.error('Failed to start pipeline server:', err);
	process.exit(1);
});
