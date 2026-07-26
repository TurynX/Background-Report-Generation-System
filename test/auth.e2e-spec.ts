import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/lib/prisma.service';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
  override: true,
});

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let db: PrismaService;

  const email: string = `usertest${Date.now()}@test.com`;
  const password: string = `passwordtest${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    db = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    await db.product.deleteMany();
    await db.user.deleteMany();
  });

  it('/auth/register (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email: email,
        password: password,
      })
      .expect(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('email');
  });

  it('/auth/login (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email,
        password: password,
      })
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should return 429 if user tries to login more than 5 times in 1 minute', async () => {
    let res;
    for (let i = 0; i < 6; i++) {
      res = await request(app.getHttpServer()).post('/auth/login').send({
        email: email,
        password: password,
      });
    }

    expect(res.status).toBe(429);
  });

  afterAll(async () => {
    await app.close();
  });
});
