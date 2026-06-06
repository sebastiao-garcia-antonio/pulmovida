'use client';

const services = [
  {
    id: 1,
    title: 'Triagem Inteligente',
    description: 'Análise de sintomas com IA avançada para encaminhamento preciso e rápido.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Agendamento Online',
    description: 'Marque consultas com especialistas 24/7 através da nossa plataforma digital.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Telemedicina',
    description: 'Consultas por vídeo com médicos qualificados de qualquer lugar do país.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Prontuário Digital',
    description: 'Seu histórico médico seguro, organizado e acessível a qualquer momento.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Análise Preditiva',
    description: 'Algoritmos que identificam riscos à saúde antes mesmo dos sintomas aparecerem.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 6,
    title: 'Suporte 24/7',
    description: 'Atendimento humanizado e disponível todos os dias, a qualquer hora.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12v.01M12 18v.01M12 6v.01" />
      </svg>
    ),
  },
];

export default function ServiceCards() {
  return (
    <section id="servicos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-[#3B82F6] text-sm font-semibold">Serviços</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#16201E] mb-4">
            Soluções completas para sua saúde
          </h2>
          <p className="text-lg text-[#746F70] max-w-2xl mx-auto leading-relaxed">
            Conheça as ferramentas que transformam a experiência em saúde com tecnologia de ponta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative p-8 bg-[#EFF6FF]/50 rounded-2xl border border-[#BFDBFE] hover:border-[#3B82F6]/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#3B82F6]/20 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>

              <h3 className="text-xl font-bold text-[#16201E] mb-3">{service.title}</h3>
              <p className="text-[#746F70] leading-relaxed mb-4">{service.description}</p>

              <div className="flex items-center gap-2 text-sm font-semibold text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Saiba mais</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#3B82F6]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl" />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/register"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#3A9888] text-white font-semibold rounded-xl shadow-lg shadow-[#3B82F6]/25 hover:shadow-xl hover:shadow-[#3B82F6]/30 transition-all hover:-translate-y-0.5"
          >
            Comece agora gratuitamente
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
