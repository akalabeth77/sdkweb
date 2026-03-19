import { SignInForm } from '@/components/SignInForm';

export default function SignInPage({ searchParams }: { searchParams?: { callbackUrl?: string } }) {
  const callbackUrl = searchParams?.callbackUrl || '/admin/users';

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <section className="card w-full space-y-4">
        <h1 className="text-2xl font-semibold">Prihlásenie do administrácie</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Prihlás sa účtom správcu alebo editora.</p>
        <SignInForm callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}
