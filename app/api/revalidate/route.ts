import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  revalidatePath('/[locale]/menu', 'page');
  revalidatePath('/[locale]/blog', 'page');
  revalidatePath('/[locale]', 'page');

  return NextResponse.json({ revalidated: true, ts: Date.now() });
}
