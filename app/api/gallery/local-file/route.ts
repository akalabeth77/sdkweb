import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

function contentTypeFor(filePath: string): string {
  if (/\.png$/i.test(filePath)) return 'image/png';
  if (/\.jpe?g$/i.test(filePath)) return 'image/jpeg';
  if (/\.webp$/i.test(filePath)) return 'image/webp';
  if (/\.gif$/i.test(filePath)) return 'image/gif';
  return 'application/octet-stream';
}

export async function GET(request: Request) {
  const root = process.env.LOCAL_GALLERY_ROOT;
  if (!root) {
    return NextResponse.json({ error: 'LOCAL_GALLERY_ROOT is not configured.' }, { status: 503 });
  }

  const url = new URL(request.url);
  const relativePath = url.searchParams.get('path');
  if (!relativePath) {
    return NextResponse.json({ error: 'Missing file path.' }, { status: 400 });
  }

  const resolvedRoot = path.resolve(root);
  const targetPath = path.resolve(resolvedRoot, relativePath);
  if (!targetPath.startsWith(resolvedRoot)) {
    return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
  }

  try {
    const file = await readFile(targetPath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentTypeFor(targetPath),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  }
}
