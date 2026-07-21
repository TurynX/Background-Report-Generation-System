import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/lib/prisma.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
  override: true,
});

describe('ReportController (e2e)', () => {
  let app: INestApplication<App>;
  let db: PrismaService;

  async function createUser() {
    const email = `usertest${Date.now()}@test.com`;
    const password = `passwordtest${Date.now()}`;
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'John Doe',
      email: email,
      password: password,
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email,
        password: password,
      });
    return loginRes.body.data.accessToken;
  }

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

  it('should start generating a sales summary report', async () => {
    const token = await createUser();
    const res = await request(app.getHttpServer())
      .post('/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'SALES_SUMMARY',
        filters: {},
      })
      .expect(201);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Report is being generated');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('type');
    expect(res.body.data).toHaveProperty('userId');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
  });

  it('should get the generated report with the fileUrl', async () => {
    const token = await createUser();
    const res = await request(app.getHttpServer())
      .post('/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'SALES_SUMMARY',
        filters: {},
      })
      .expect(201);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Report generated successfully');
    expect(res.body.data).toHaveProperty('fileUrl');
    expect(res.body.data.fileUrl).toBeDefined();
    console.log(res.body.data.fileUrl);
  });

  afterAll(async () => {
    await app.close();
  });
});
