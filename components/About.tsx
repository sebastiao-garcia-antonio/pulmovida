export default function About() {
  return (
    <section id="sobre" className="py-24 bg-[#0A192F]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-[#3B82F6] text-sm font-semibold">Sobre nós</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Saúde inteligente para todos
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Unimos tecnologia de ponta e medicina humanizada para democratizar o acesso à saúde de qualidade.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Transformando a experiência de cuidados médicos
            </h3>
            <p className="text-base text-white/80 leading-relaxed mb-6">
              Fundada por especialistas em tecnologia e medicina, a Pulmo Vida nasceu para revolucionar o atendimento médico no Brasil, tornando-o mais ágil, preciso e acessível.
            </p>
            <p className="text-base text-white/80 leading-relaxed mb-8">
              Nossa plataforma utiliza inteligência artificial de última geração para oferecer triagem inteligente, agendamento online e telemedicina, conectando pacientes aos melhores especialistas do país.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[#1E3A5F] border border-[#3B82F6]/30">
                <div className="text-3xl font-bold text-[#3B82F6] mb-1">+50k</div>
                <div className="text-sm text-white/80">Pacientes atendidos</div>
              </div>
              <div className="p-4 rounded-xl bg-[#1E3A5F] border border-[#3B82F6]/30">
                <div className="text-3xl font-bold text-[#3B82F6] mb-1">98%</div>
                <div className="text-sm text-white/80">Satisfação</div>
              </div>
              <div className="p-4 rounded-xl bg-[#1E3A5F] border border-[#3B82F6]/30">
                <div className="text-3xl font-bold text-[#3B82F6] mb-1">500+</div>
                <div className="text-sm text-white/80">Médicos parceiros</div>
              </div>
              <div className="p-4 rounded-xl bg-[#1E3A5F] border border-[#3B82F6]/30">
                <div className="text-3xl font-bold text-[#3B82F6] mb-1">24/7</div>
                <div className="text-sm text-white/80">Suporte ativo</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#0A192F] to-[#1E3A5F] rounded-3xl -rotate-1" />
            <div className="relative space-y-6">
              <div className="group p-6 bg-[#1E3A5F] rounded-2xl border border-[#3B82F6]/30 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#3B82F6]/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">Inovação Constante</h4>
                    <p className="text-white/80 text-sm leading-relaxed">Sempre evoluindo com as mais recentes tecnologias de IA e machine learning.</p>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-[#1E3A5F] rounded-2xl border border-[#3B82F6]/30 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#3B82F6]/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">Segurança Total</h4>
                    <p className="text-white/80 text-sm leading-relaxed">Seus dados protegidos com criptografia de nível hospitalar e conformidade LGPD.</p>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-[#1E3A5F] rounded-2xl border border-[#3B82F6]/30 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#3B82F6]/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">Cuidado Humanizado</h4>
                    <p className="text-white/80 text-sm leading-relaxed">Tecnologia avançada a serviço do atendimento humano e empático.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-[#1E3A5F]">
          <div className="text-center mb-8">
            <p className="text-sm text-white/50 font-medium">Reconhecido por</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="text-2xl font-bold text-white/20">Ministério da Saúde</div>
            <div className="text-2xl font-bold text-white/20">ANVISA</div>
            <div className="text-2xl font-bold text-white/20">SBIS</div>
            <div className="text-2xl font-bold text-white/20">CFM</div>
          </div>
        </div>
      </div>
    </section>
  );
}
