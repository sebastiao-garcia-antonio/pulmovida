"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DashboardData = {
  userName: string;
  totalPacientes: number;
  consultasHoje: number;
  consultasPendentes: number;
  taxaOcupacao: number;
  totalDepartamentos: number;
  totalMedicos: number;
  chartData: { name: string; consultas: number }[];
  especialidadesDistribuicao: { nome: string; count: number; cor: string }[];
  ultimasAtividades: { id: string; tipo: string; texto: string; hora: string }[];
  departamentosTop: { nome: string; consultas: number; }[];
};

export default function AdminDashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Visão Geral</h1>
          <p className="mt-2 text-[#64748B] text-lg">Seja bem-vindo sr/a <span className="font-semibold text-[#0F172A] capitalize">{data.userName}</span> ao Pulmo Vida.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Total Pacientes</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{data.totalPacientes}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#3B82F6]/10">
              <svg className="w-6 h-6 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
        </div>

        <div className="saas-card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Consultas Hoje</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{data.consultasHoje}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>

        <div className="saas-card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Consultas Pendentes</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{data.consultasPendentes}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>

        <div className="saas-card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#746F70] font-medium">Taxa de Ocupação</p>
              <p className="text-3xl font-black text-[#16201E] mt-1">{data.taxaOcupacao}%</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="saas-card p-8 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[220px]">
          <div>
             <h2 className="text-xl font-bold text-[#16201E] mb-2 flex items-center gap-2">
               <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               Departamentos
             </h2>
             <p className="text-[#746F70] mb-4 text-sm">Gerencie as divisões médicas.</p>
             <p className="text-4xl font-black text-[#16201E] mb-6">{data.totalDepartamentos} <span className="text-sm font-medium text-[#746F70]">registrados</span></p>
          </div>
          <Link href="/admin/departamentos" className="saas-button w-full bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 font-medium text-center">
             Gerenciar Departamentos &rarr;
          </Link>
        </div>

        <div className="saas-card p-8 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[220px]">
          <div>
             <h2 className="text-xl font-bold text-[#16201E] mb-2 flex items-center gap-2">
               <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               Corpo Clínico
             </h2>
             <p className="text-[#746F70] mb-4 text-sm">Administração de médicos atuantes.</p>
             <p className="text-4xl font-black text-[#16201E] mb-6">{data.totalMedicos} <span className="text-sm font-medium text-[#746F70]">cadastrados</span></p>
          </div>
          <Link href="/admin/medicos" className="saas-button w-full bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 font-medium text-center">
             Gerenciar Médicos &rarr;
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 saas-card p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-6">Agendamentos nos Últimos 7 Dias</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#EFF6FF' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="consultas" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="saas-card p-6">
          <h3 className="text-lg font-bold text-[#16201E] mb-6">Equipa por Especialidade</h3>
          <div className="space-y-4">
            {data.especialidadesDistribuicao.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum dado disponível.</p>
            ) : (
              data.especialidadesDistribuicao.map((esp, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#16201E]">{esp.nome}</span>
                    <span className="text-[#746F70]">{esp.count} médicos</span>
                  </div>
                  <div className="w-full bg-[#EFF6FF]/50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ backgroundColor: esp.cor, width: `${Math.min((esp.count / Math.max(data.totalMedicos, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="saas-card p-6">
          <h3 className="text-lg font-bold text-[#16201E] mb-4">Últimos Agendamentos</h3>
          <div className="space-y-4">
            {data.ultimasAtividades.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma atividade recente.</p>
            ) : (
              data.ultimasAtividades.map((atividade) => (
                <div key={atividade.id} className="flex items-start gap-3 pb-4 border-b border-[#BFDBFE] last:border-0 last:pb-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    atividade.tipo === "pendente" ? "bg-yellow-100 text-yellow-600" :
                    atividade.tipo === "confirmado" ? "bg-blue-100 text-blue-600" :
                    atividade.tipo === "realizado" ? "bg-emerald-100 text-emerald-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#16201E] truncate">{atividade.texto}</p>
                    <p className="text-xs text-[#746F70]">{atividade.hora}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="saas-card p-6">
          <h3 className="text-lg font-bold text-[#16201E] mb-4">Departamentos Mais Ativos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#BFDBFE]">
                  <th className="pb-3 text-xs font-semibold text-[#746F70] uppercase tracking-wider">Departamento</th>
                  <th className="pb-3 text-xs font-semibold text-[#746F70] uppercase tracking-wider text-right">Agendamentos Totais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFDBFE]">
                {data.departamentosTop.length === 0 ? (
                  <tr><td colSpan={2} className="py-4 text-center text-sm text-gray-400">Sem dados.</td></tr>
                ) : (
                  data.departamentosTop.map((dept, i) => (
                    <tr key={i}>
                      <td className="py-3 text-sm font-medium text-[#16201E]">{dept.nome}</td>
                      <td className="py-3 text-sm text-right text-[#746F70] font-bold">{dept.consultas}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
