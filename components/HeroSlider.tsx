'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    phrase: 'Diagnóstico inteligente e cuidados médicos ao alcance de todos.',
    subphrase: 'A Pulmo Vida utiliza inteligência artificial para oferecer triagem rápida,acompanhamento médico e acesso simplificado aos melhores profissionais de saúde',
    gradient: 'linear-gradient(135deg, rgba(229,243,255,0.45) 0%, rgba(94,187,171,0.40) 50%, rgba(74,168,154,0.45) 100%)',
    image: '/images/pulmo.jpg',
  },
  {
    id: 2,
    phrase: 'Inteligência artificial revolucionando o cuidado médico.',
    subphrase: 'Diagnósticos mais precisos e rápidos com IA de última geração.',
    gradient: 'linear-gradient(135deg, rgba(74,168,154,0.45) 0%, rgba(94,187,171,0.40) 50%, rgba(124,200,186,0.45) 100%)',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 3,
    phrase: 'Inteligência artificial que auxilia no diagnóstico com rapidez e precisão.',
    subphrase: 'Algoritmos avançados analisam sintomas para apoiar nas decisões médicas de forma segura e eficiente.',
    gradient: 'linear-gradient(135deg, rgba(94,187,171,0.45) 0%, rgba(124,200,186,0.40) 50%, rgba(168,221,211,0.45) 100%)',
    image: '/images/pulmo2.avif',
  },
  {
    id: 4,
    phrase: 'Atendimento especializado sem sair de casa.',
    subphrase: 'Agende consultas online ,acompanhe resultados e receba orientações médicas através de uma plataforma moderna e acessível.',
    gradient: 'linear-gradient(135deg, rgba(58,152,136,0.45) 0%, rgba(94,187,171,0.40) 50%, rgba(124,200,186,0.45) 100%)',
    image: 'https://images.unsplash.com/photo-1581594693280-645578b9f247?auto=format&fit=crop&w=1920&q=80',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <section id="inicio" className="relative h-[700px] md:h-[800px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div 
            className="absolute inset-0"
            style={{ background: slide.gradient }}
          />

          <div className="relative z-20 flex items-center justify-center h-full px-6">
            <div className={`text-center max-w-5xl transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="text-white/95 text-sm font-medium">Prevendo doenças, preservando vidas no ambiente público</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
                {slide.phrase.split(/(inteligente|IA|saúde|inteligência)/i).map((part, i) => 
                  /inteligente|IA|saúde|inteligência/i.test(part) ? (
                    <span key={i} className="bg-white/20 px-2 py-0.5 rounded">{part}</span>
                  ) : part
                )}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow">
                {slide.subphrase}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-[#16201E] bg-white hover:bg-white/90 rounded-xl transition-all shadow-2xl hover:shadow-white/25 hover:-translate-y-0.5"
                >
                  Começar agora
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl transition-all border border-white/30 hover:-translate-y-0.5"
                >
                  Já tenho conta
                </a>
              </div>

              
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === current 
                ? 'w-10 h-3 bg-white' 
                : 'w-3 h-3 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-10 right-10 z-30 hidden md:flex flex-col items-center gap-2 text-white/60">
        <span className="text-xs rotate-90 origin-center whitespace-nowrap">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );
}
