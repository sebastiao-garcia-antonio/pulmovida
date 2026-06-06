"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DashboardStats = {
  nomePaciente: string;
  proximasConsultas: number;
  consultasTotal: number;
  quizRealizados: number;
  proximas: {
    id: string;
    data: string; // ISO or formatted date
    hora: string;
    medico: string;
    especialidade: string;
    status: string;
  }[];
  historicoConsultas: {
    mes: string;
    count: number;
  }[];
};

export default function PacienteDashboardClient({ stats }: { stats: DashboardStats }) {
  const chartData = stats.historicoConsultas.map((h) => ({
    name: h.mes,
    consultas: h.count
  }));

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Portal do Paciente</h1>
        <p className="mt-2 text-[#746F70] text-lg">Olá, {stats.nomePaciente}. Bem-vindo ao Saúde Inteligente.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="saas-card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Próximas Consultas</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{stats.proximasConsultas}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#3B82F6]/10">
              <svg className="w-6 h-6 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>

        <div className="saas-card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Total de Consultas</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{stats.consultasTotal}</p>
              <Link href="/paciente/historico" className="text-xs text-[#3B82F6] mt-1 font-medium hover:underline inline-block">Histórico completo</Link>
            </div>
            <div className="p-3 rounded-xl bg-[#3B82F6]/10">
              <svg className="w-6 h-6 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>

        <div className="saas-card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Triagens (IA) Realizadas</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{stats.quizRealizados}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#3B82F6]/10">
              <svg className="w-6 h-6 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="saas-card p-8 flex flex-col items-start min-h-[220px] hover:shadow-md transition-shadow border border-blue-100">
          <div>
            <div className="w-12 h-12 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h2 className="text-xl font-bold text-[#16201E] mb-2">Triagem Inteligente (IA)</h2>
            <p className="text-[#746F70] mb-6 text-sm leading-relaxed">Avalie seus sintomas respondendo a um breve questionário e receba o melhor direcionamento clínico pela nossa Inteligência Artificial.</p>
          </div>
          <Link href="/paciente/quiz" className="saas-button w-full bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-sm text-center font-bold">
            Iniciar Análise de Sintomas
          </Link>
        </div>

        <div className="saas-card p-8 flex flex-col items-start min-h-[220px] hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-[#16201E] mb-2">Marcação de Consultas</h2>
            <p className="text-[#746F70] mb-6 text-sm leading-relaxed">Marque consultas com nossos especialistas. Escolha a data, o horário e o médico de sua preferência de forma rápida e fácil.</p>
          </div>
          <Link href="/paciente/agendamento" className="saas-button w-full bg-[#EFF6FF] text-[#16201E] hover:bg-[#BFDBFE] text-center font-bold">
            Agendar Nova Consulta
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="saas-card p-6">
          <h3 className="text-lg font-bold text-[#16201E] mb-6">Próximas Consultas</h3>
          <div className="space-y-4">
            {stats.proximas.length === 0 ? (
              <p className="text-[#746F70] text-sm italic">Não tem nenhuma consulta marcada nos próximos dias.</p>
            ) : (
              stats.proximas.map((c) => (
                <div key={c.id} className="flex items-center justify-between pb-4 border-b border-[#BFDBFE] last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-[#16201E]">{c.medico}</p>
                    <p className="text-xs font-medium text-[#746F70] mt-0.5">{c.data} às {c.hora}</p>
                    <p className="text-xs text-[#746F70] mt-0.5">{c.especialidade}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    c.status === "confirmado" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                    c.status === "pendente" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                    "bg-gray-100 text-gray-700 border-gray-200"
                  }`}>{c.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="saas-card p-6">
          <h3 className="text-lg font-bold text-[#16201E] mb-6">Suas Consultas em {new Date().getFullYear()}</h3>
          <div className="h-48 w-full">
            {chartData.length > 0 && chartData.some(d => d.consultas > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#746F70', fontSize: 12, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#746F70', fontSize: 12, fontWeight: 500 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#EFF6FF' }} contentStyle={{ borderRadius: '12px', border: '1px solid #BFDBFE', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                  <Bar dataKey="consultas" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#746F70] text-sm italic">
                Ainda não tem histórico de consultas este ano.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
