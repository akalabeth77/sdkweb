import { redirect } from 'next/navigation';
import { getCurrentUser, listManagedUsers } from '@/lib/auth';
import { UsersAdminPanel } from '@/components/UsersAdminPanel';

export default async function UsersAdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin?callbackUrl=/admin/users');
  }

  if (user.role !== 'ADMIN') {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <h1 className="text-2xl font-semibold">Nedostatočné oprávnenia</h1>
        <p>Do správy používateľov má prístup len admin.</p>
      </main>
    );
  }

  const users = await listManagedUsers();

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Správa používateľov</h1>
      </div>

      <UsersAdminPanel initialUsers={users} />
    </main>
  );
}
