import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMobileUser } from '@/lib/mobile-auth';
import { prisma } from '@/lib/db';

const schema = z.object({
  title: z.string().min(2).optional(),
  sourceType: z.string().min(1).optional(),
  sourceRef: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  visibility: z.enum(['public', 'members']).optional(),
});

function isEditorOrAdmin(role: string) {
  return role === 'admin' || role === 'editor';
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = getMobileUser(request);
  if (!user || !isEditorOrAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await prisma.galleryAlbum.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = getMobileUser(_req);
  if (!user || !isEditorOrAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.galleryAlbum.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
