import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/session";

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

export async function GET(req: NextRequest) {
  const { user } = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // path format: "bucket/key/to/file.jpg"
  const slashIdx = path.indexOf("/");
  if (slashIdx === -1) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const bucket = path.slice(0, slashIdx);
  const key = path.slice(slashIdx + 1);

  try {
    const response = await getS3Client().send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    const bytes = await response.Body!.transformToByteArray();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": response.ContentType ?? "image/jpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
