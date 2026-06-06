"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DashboardData = {
  userName: string;
  consultasHoje: number;
  consultasSemana: number;
  pacientesAtivos: number;
  tempoMedio: number;
  consultasRecentes: {
    paciente: string;
    data: string;
    hora: string;
    status: string;
    especialidade: string;
  }[];
  chartData: { name: string; consultas: number }[];
  distribuicaoStatus: { status: string; count: number; cor: string }[];
};

export default function MedicoDashboardClient({ data }: { data: DashboardData }) {
  const totalSemana = data.distribuicaoStatus.reduce((acc, item) => acc + item.count, 0) || 1; // avoid div by 0

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Painel Médico</h1>
        <p className="mt-2 text-[#746F70] text-lg">Bem-vindo(a), Dr(a). {data.userName}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5 hover:shadow-md transition-shadow border-l-4 border-l-[#3B82F6]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Consultas Hoje</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{data.consultasHoje}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#3B82F6]/10">
              <svg className="w-6 h-6 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>

        <div className="saas-card p-5 hover:shadow-md transition-shadow border-l-4 border-l-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Esta Semana</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{data.consultasSemana}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
        </div>

        <div className="saas-card p-5 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Pacientes Ativos</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{data.pacientesAtivos}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
        </div>

        <div className="saas-card p-5 hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Tempo Médio</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{data.tempoMedio}min</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-100">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 saas-card p-6">
          <h3 className="text-lg font-bold text-[#16201E] mb-6">Consultas por Dia (Últimos 7 dias)</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#746F70', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#746F70', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#EFF6FF' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="consultas" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="saas-card p-6">
          <h3 className="text-lg font-bold text-[#16201E] mb-6">Estatísticas Gerais</h3>
          <div className="space-y-4">
            {data.distribuicaoStatus.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#16201E]">{item.status}</span>
                  <span className="text-[#746F70]">{item.count}</span>
                </div>
                <div className="w-full bg-[#EFF6FF]/50 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ backgroundColor: item.cor, width: `${(item.count / totalSemana) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="saas-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-[#16201E] mb-4">Próximas Consultas</h3>
          <div className="space-y-4 flex-1">
            {data.consultasRecentes.length === 0 ? (
              <div className="text-center py-8 text-[#746F70]">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Sem agendamentos próximos.
              </div>
            ) : (
              data.consultasRecentes.map((c, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-[#BFDBFE] last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-[#16201E]">{c.paciente}</p>
                    <p className="text-xs text-[#746F70]">{c.data} às {c.hora} - {c.especialidade}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    c.status === "confirmado" ? "bg-blue-100 text-blue-700" :
                    c.status === "realizado" ? "bg-green-100 text-green-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
          <Link href="/medico/consultas" className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 text-center block bg-blue-50 py-2 rounded-lg transition-colors">
            Ver todas as consultas
          </Link>
        </div>

        <div className="saas-card p-6">
          <h3 className="text-lg font-bold text-[#16201E] mb-4">Acesso Rápido</h3>
          <div className="space-y-3">
            <Link href="/medico/agenda" className="flex items-center gap-3 p-4 bg-[#EFF6FF]/50 rounded-xl hover:bg-[#EFF6FF] transition-colors border border-transparent hover:border-blue-100 group">
              <div className="p-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#16201E]">Gerenciar Agenda</p>
                <p className="text-xs text-[#746F70]">Defina seus horários disponíveis</p>
              </div>
            </Link>
            <Link href="/medico/consultas" className="flex items-center gap-3 p-4 bg-[#EFF6FF]/50 rounded-xl hover:bg-[#EFF6FF] transition-colors border border-transparent hover:border-blue-100 group">
              <div className="p-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#16201E]">Atender Consultas</p>
                <p className="text-xs text-[#746F70]">Painel de atendimento clínico</p>
              </div>
            </Link>
            <Link href="/medico/imprimir-lista" className="flex items-center gap-3 p-4 bg-[#EFF6FF]/50 rounded-xl hover:bg-[#EFF6FF] transition-colors border border-transparent hover:border-blue-100 group">
              <div className="p-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#16201E]">Lista de Pacientes</p>
                <p className="text-xs text-[#746F70]">Gerar folha diária em PDF</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
