import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/lib/prisma.service';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ReportLifeCycleWorker } from 'src/report/application/worker/report-life-cycle.worker';
import { setTimeout } from 'timers/promises';

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
      .post('/reports/create')
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
    const createReport = await request(app.getHttpServer())
      .post('/reports/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'SALES_SUMMARY',
        filters: {},
      })
      .expect(201);

    let res;
    for (let i = 0; i < 5; i++) {
      res = await request(app.getHttpServer())
        .get(`/reports/getReport/${createReport.body.data.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      if (res.body.data.status === 'COMPLETED') {
        break;
      }

      await setTimeout(3000);
    }

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Report retrieved successfully');
    expect(res.body.data).toHaveProperty('fileUrl');
    expect(res.body.data.fileUrl).toBeDefined();
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('should delete the report after 7 days', async () => {
    const token = await createUser();
    const res = await request(app.getHttpServer())
      .post('/reports/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'SALES_SUMMARY',
        filters: {},
      });

    await setTimeout(1000);

    const updatedReport = await db.report.update({
      where: {
        id: res.body.data.id,
      },
      data: {
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(updatedReport);

    const cleanupWorker = app.get(ReportLifeCycleWorker);
    await cleanupWorker.markExpiredReports();

    const checkReportExpiredDeleted = await request(app.getHttpServer())
      .get(`/reports/getReport/${res.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(checkReportExpiredDeleted.body).toHaveProperty('message');
    expect(checkReportExpiredDeleted.body.message).toBe('Report expired');
  });

  afterAll(async () => {
    await app.close();
  });
});
