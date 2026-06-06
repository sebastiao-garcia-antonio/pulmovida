'use client';

import Link from 'next/link';

const LungsIcon = ({ className, strokeWidth }: { className?: string, strokeWidth?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 6c-2.07-2-5.93-2-8 0-1.04 1-1.5 2.5-1.5 4 0 2 2 5 4 7 1.83 1.83 3.5 3 4.5 4M13 6c2.07-2 5.93-2 8 0 1.04 1 1.5 2.5 1.5 4 0 2-2 5-4 7-1.83 1.83-3.5 3-4.5 4"/>
    <path d="M12 2v6"/>
    <path d="M12 12v.01"/>
  </svg>
);

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-lg border-b border-[#BFDBFE]/50 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B82F6]/25">
            <LungsIcon className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-bold text-[#16201E] tracking-tight">Pulmo Vida</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#inicio" className="text-sm font-medium text-[#746F70] hover:text-[#3B82F6] transition-colors">Início</a>
          <a href="#sobre" className="text-sm font-medium text-[#746F70] hover:text-[#3B82F6] transition-colors">Sobre</a>
          <a href="#servicos" className="text-sm font-medium text-[#746F70] hover:text-[#3B82F6] transition-colors">Serviços</a>
          <a href="#contato" className="text-sm font-medium text-[#746F70] hover:text-[#3B82F6] transition-colors">Contato</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[#16201E] hover:text-[#3B82F6] transition-colors">
            Entrar
          </Link>
          <Link href="/register" className="text-sm font-medium text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#3A9888] px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#3B82F6]/25 hover:shadow-xl hover:shadow-[#3B82F6]/30">
            Registrar
          </Link>
        </div>
      </div>
    </header>
  );
}
