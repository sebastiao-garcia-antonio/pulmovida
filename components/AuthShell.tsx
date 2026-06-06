import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#EFF6FF] px-4 py-8 flex items-center justify-center">
      <section className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3 text-[#16201E]">
          <span className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <span className="text-xl font-bold">Pulmo Vida</span>
        </Link>

        <div className="saas-card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-[#16201E]">{title}</h1>
            <p className="mt-2 text-sm text-[#746F70]">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-sm text-[#746F70]">{footer}</div>}
        </div>
      </section>
    </main>
  );
}
