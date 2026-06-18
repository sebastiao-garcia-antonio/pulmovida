'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-[#0A192F]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Fique por dentro das novidades
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Cadastre-se em nossa newsletter e receba atualizações sobre saúde inteligente, novos serviços e dicas de bem-estar.
        </p>
        {status === 'success' ? (
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#1E3A5F] text-white rounded-xl border border-[#3B82F6]/30">
            <svg className="w-6 h-6 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Inscrição realizada com sucesso!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="saas-input flex-1 px-5 py-4 text-base"
            />
            <button
              type="submit"
              className="saas-button bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-4 text-base font-semibold shadow-sm"
            >
              Inscrever-se
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
