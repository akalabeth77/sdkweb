import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { getServerMessages } from '@/lib/i18n-server';
import { getEventCategoryLabel, toDateLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function RegistrationsPage() {
  const session = await getServerSession(authOptions);
  const { locale, t } = getServerMessages();

  if (!session?.user?.id) {
    notFound();
  }

  const prisma = new PrismaClient();

  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            start: true,
            end: true,
            location: true,
            category: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const activeRegistrations = registrations.filter(r => r.status !== 'cancelled');
    const cancelledRegistrations = registrations.filter(r => r.status === 'cancelled');

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/profile" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Späť na profil
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Moje registrácie</h1>

        {/* Active Registrations */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Aktívne registrácie</h2>
          {activeRegistrations.length === 0 ? (
            <p className="text-gray-600">Zatiaľ nemáte žiadne registrácie.</p>
          ) : (
            <div className="space-y-4">
              {activeRegistrations.map((reg) => (
                <div key={reg.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link 
                        href={`/events/${encodeURIComponent(reg.event.id)}`}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                      >
                        {reg.event.title}
                      </Link>
                      <div className="text-sm text-gray-600 mt-1">
                        {new Date(reg.event.start).toLocaleString(toDateLocale(locale))}
                        {reg.event.location && ` · ${reg.event.location}`}
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded $`}>
                          {reg.status === 'registered' ? 'Registrovaný' : 
                           reg.status === 'waiting' ? 'Čakacia lista' : 
                           reg.status === 'attended' ? 'Zúčastnil sa' : reg.status}
                        </span>
                        <span className="ml-2 inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                          {getEventCategoryLabel(locale, reg.event.category)}
                        </span>
                      </div>
                    </div>
                    {reg.status !== 'cancelled' && (
                      <form action={`/api/v1/events/${reg.event.id}/register`} method="POST">
                        <input type="hidden" name="_method" value="DELETE" />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800 text-sm"
                          onClick={(e) => {
                            if (!confirm('Naozaj chcete zrušiť registráciu?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Zrušiť registráciu
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cancelled Registrations */}
        {cancelledRegistrations.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Zrušené registrácie</h2>
            <div className="space-y-4">
              {cancelledRegistrations.map((reg) => (
                <div key={reg.id} className="bg-gray-50 border rounded-lg p-4">
                  <Link 
                    href={`/events/${encodeURIComponent(reg.event.id)}`}
                    className="text-lg font-semibold text-gray-600 hover:underline"
                  >
                    {reg.event.title}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(reg.event.start).toLocaleString(toDateLocale(locale))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  } finally {
    await prisma.$disconnect();
  }
}