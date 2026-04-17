import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3Client() {
  return new S3Client({
    region: "us-east-1",
    endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/s3`,
    credentials: {
      accessKeyId: process.env.SUPABASE_S3_KEY_ID!,
      secretAccessKey: process.env.SUPABASE_S3_SECRET!,
    },
    forcePathStyle: true,
  });
}

export async function uploadFile(
  buffer: Buffer,
  path: string,
  contentType: string,
  bucket = "files"
): Promise<string> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `/api/storage?path=${bucket}/${path}`;
}
