import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutBucketLifecycleConfigurationCommand,
} from '@aws-sdk/client-s3';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class S3StorageService implements OnModuleInit {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
    } catch (error: any) {
      console.log(error);
      if (error.$metadata.httpStatusCode === 404) {
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.bucketName }),
        );
      }
    }
  }

  private async makeBucketPublic() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`], // Allows reading all files inside
        },
      ],
    };

    await this.s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify(policy),
      }),
    );
  }

  private async setLifeCycle() {
    const comand = new PutBucketLifecycleConfigurationCommand({
      Bucket: this.bucketName,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: 'DeleteReportsAfter7days',
            Status: 'Enabled',
            Filter: {
              Prefix: '',
            },
            Expiration: {
              Days: 7,
            },
          },
        ],
      },
    });

    await this.s3Client.send(comand);
  }

  constructor() {
    this.bucketName = process.env.BUCKET_NAME!;
    this.s3Client = new S3Client({
      region: process.env.BUCKET_REGION!,
      endpoint: process.env.BUCKET_ENDPOINT!,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.BUCKET_SECRET_KEY!,
      },
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
    await this.makeBucketPublic();
    await this.setLifeCycle();
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    const fileUrl = `${process.env.MINIO_ENDPOINT}/${this.bucketName}/${fileName}`;

    return { url: fileUrl };
  }
}
