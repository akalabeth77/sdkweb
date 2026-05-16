import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMobileUser } from '@/lib/mobile-auth';
import { prisma } from '@/lib/db';

const schema = z.object({
  title: z.string().min(2),
  sourceType: z.string().min(1),
  sourceRef: z.string().min(1),
  isActive: z.boolean().default(true),
  visibility: z.enum(['public', 'members']).default('public'),
});

function isEditorOrAdmin(role: string) {
  return role === 'admin' || role === 'editor';
}

export async function GET(request: Request) {
  const user = getMobileUser(request);
  if (!user || !isEditorOrAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const albums = await prisma.galleryAlbum.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ albums });
}

export async function POST(request: Request) {
  const user = getMobileUser(request);
  if (!user || !isEditorOrAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const album = await prisma.galleryAlbum.create({
    data: { id: crypto.randomUUID(), ...parsed.data },
  });
  return NextResponse.json({ ok: true, album });
}
