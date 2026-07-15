import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
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
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    const fileUrl = `http://localhost:9000/${this.bucketName}/${fileName}`;

    return { url: fileUrl };
  }
}
