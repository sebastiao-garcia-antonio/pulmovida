"use client";

import { useState, useMemo } from "react";
import { Download, FileText, Calendar, Users, Activity, Clock, XCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type ReportData = {
  agendamentos: { id: string; paciente: string; medico: string; departamento: string; data: string; status: string; }[];
  departamentos: { nome: string; consultas: number; medicos: number; ocupacao: number; }[];
  medicos: { nome: string; especialidade: string; consultas: number; avaliacao: number; }[];
};

export default function RelatoriosClient({ data }: { data: ReportData }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "consultas" | "departamentos" | "medicos">("dashboard");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [exportTarget, setExportTarget] = useState<"consultas" | "departamentos" | "medicos">("consultas");

  // General KPIs
  const totalConsultas = data.agendamentos.length;
  const realizadas = data.agendamentos.filter((a) => a.status === "realizado").length;
  const pendentes = data.agendamentos.filter((a) => a.status === "pendente").length;
  const canceladas = data.agendamentos.filter((a) => a.status === "cancelado").length;

  // Chart Data: Consultations by Month
  const consultasByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    data.agendamentos.forEach((a) => {
      if (a.status !== "realizado") return;
      const monthYear = a.data.substring(0, 7); // YYYY-MM
      months[monthYear] = (months[monthYear] || 0) + 1;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, Total]) => ({ name, Total }));
  }, [data.agendamentos]);

  // Chart Data: Department Pie
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1"];
  const pieData = data.departamentos.filter(d => d.consultas > 0).map((d) => ({
    name: d.nome,
    value: d.consultas,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "realizado":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "cancelado":
        return "bg-red-100 text-red-700 border border-red-200";
      case "confirmado":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
  };

  const exportToCSV = async () => {
    setExportLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    let csvContent = "";
    if (exportTarget === "consultas") {
      csvContent = "ID,Paciente,Médico,Departamento,Data,Status\n";
      data.agendamentos.forEach((c) => {
        csvContent += `${c.id},${c.paciente},${c.medico},${c.departamento},${c.data},${c.status}\n`;
      });
    } else if (exportTarget === "departamentos") {
      csvContent = "Departamento,Consultas,Médicos,Ocupação (%)\n";
      data.departamentos.forEach((d) => {
        csvContent += `${d.nome},${d.consultas},${d.medicos},${d.ocupacao}\n`;
      });
    } else if (exportTarget === "medicos") {
      csvContent = "Médico,Especialidade,Consultas,Avaliação\n";
      data.medicos.forEach((m) => {
        csvContent += `${m.nome},${m.especialidade},${m.consultas},${m.avaliacao}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_${exportTarget}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportLoading(false);
    setExportModalOpen(false);
  };

  const exportToPDF = async () => {
    setExportLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let tableHeaders = "";
    let tableRows = "";
    let title = "";

    if (exportTarget === "consultas") {
      title = "Relatório de Consultas e Agendamentos";
      tableHeaders = "<tr><th>Paciente</th><th>Médico</th><th>Departamento</th><th>Data</th><th>Status</th></tr>";
      data.agendamentos.forEach((c) => {
        tableRows += `<tr><td>${c.paciente}</td><td>${c.medico}</td><td>${c.departamento}</td><td>${new Date(c.data).toLocaleDateString("pt-BR")}</td><td>${c.status}</td></tr>`;
      });
    } else if (exportTarget === "departamentos") {
      title = "Performance por Departamento";
      tableHeaders = "<tr><th>Departamento</th><th>Consultas Realizadas</th><th>Total Médicos</th><th>Ocupação Estimada</th></tr>";
      data.departamentos.forEach((d) => {
        tableRows += `<tr><td>${d.nome}</td><td>${d.consultas}</td><td>${d.medicos}</td><td>${d.ocupacao}%</td></tr>`;
      });
    } else if (exportTarget === "medicos") {
      title = "Performance da Equipa Médica";
      tableHeaders = "<tr><th>Médico</th><th>Especialidade</th><th>Consultas Realizadas</th><th>Avaliação IA</th></tr>";
      data.medicos.forEach((m) => {
        tableRows += `<tr><td>${m.nome}</td><td>${m.especialidade}</td><td>${m.consultas}</td><td>⭐ ${m.avaliacao}</td></tr>`;
      });
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - Pulmo Vida</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #16201E; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
          h1 { color: #16201E; margin-bottom: 5px; font-size: 28px; }
          .subtitle { color: #746F70; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th, td { border: 1px solid #E5E7EB; padding: 12px 15px; text-align: left; font-size: 13px; }
          th { background-color: #F3F4F6; color: #374151; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          tr:nth-child(even) { background-color: #F9FAFB; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; justify-content: center; }
          .summary-item { background: #EFF6FF; padding: 20px; border-radius: 10px; flex: 1; max-width: 200px; text-align: center; border: 1px solid #BFDBFE; }
          .summary-item .value { font-size: 24px; font-weight: bold; color: #1E3A8A; }
          .summary-item .label { font-size: 12px; color: #3B82F6; font-weight: 600; text-transform: uppercase; margin-top: 5px;}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p class="subtitle">Gerado automaticamente pelo Sistema Pulmo Vida em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
        <div class="summary">
          <div class="summary-item"><div class="value">${exportTarget === 'consultas' ? totalConsultas : exportTarget === 'departamentos' ? data.departamentos.length : data.medicos.length}</div><div class="label">Total de Registos</div></div>
        </div>
        <table>${tableHeaders}${tableRows}</table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();

    setExportLoading(false);
    setExportModalOpen(false);
  };

  const handleExport = () => {
    if (exportFormat === "csv") exportToCSV();
    else exportToPDF();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-[#BFDBFE]/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            <Activity className="w-3.5 h-3.5" /> Visão Geral 360º
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#16201E] tracking-tight">Dashboard de Relatórios</h1>
          <p className="mt-2 text-[#746F70] text-sm md:text-base max-w-xl leading-relaxed">
            Acompanhe o volume de atendimentos, taxa de ocupação da clínica e métricas detalhadas dos seus especialistas em tempo real.
          </p>
        </div>
        <button
          onClick={() => setExportModalOpen(true)}
          className="relative z-10 w-full md:w-auto px-6 py-3 bg-[#16201E] text-white font-semibold rounded-xl hover:bg-[#2c3e3a] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
        >
          <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          Exportar Relatório
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <Calendar className="w-16 h-16 text-blue-600" />
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-[#746F70] font-semibold">Total Agendamentos</p>
          <p className="text-3xl font-black text-[#16201E] mt-1">{totalConsultas}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <Activity className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 border border-emerald-100">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm text-[#746F70] font-semibold">Consultas Realizadas</p>
          <p className="text-3xl font-black text-[#16201E] mt-1">{realizadas}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <Clock className="w-16 h-16 text-amber-600" />
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4 border border-amber-100">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-sm text-[#746F70] font-semibold">Pendentes</p>
          <p className="text-3xl font-black text-[#16201E] mt-1">{pendentes}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4 border border-red-100">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-sm text-[#746F70] font-semibold">Canceladas</p>
          <p className="text-3xl font-black text-[#16201E] mt-1">{canceladas}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-gray-200 bg-white/50 px-2 pt-2 rounded-t-xl">
        {[
          { key: "dashboard", label: "Visão Analítica", icon: Activity },
          { key: "consultas", label: "Consultas & Agendas", icon: Calendar },
          { key: "departamentos", label: "Departamentos", icon: FileText },
          { key: "medicos", label: "Equipa Médica", icon: Users },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[#3B82F6] text-[#3B82F6] bg-blue-50/50 rounded-t-lg"
                : "border-transparent text-[#746F70] hover:text-[#16201E] hover:bg-gray-50 rounded-t-lg"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#16201E] mb-6">Evolução de Consultas Realizadas</h3>
              <div className="h-[300px] w-full">
                {consultasByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={consultasByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <Area type="monotone" dataKey="Total" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">Não há dados suficientes de consultas.</div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#16201E] mb-6">Consultas por Departamento</h3>
              <div className="h-[300px] w-full flex items-center justify-center relative">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">Nenhum dado disponível.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "consultas" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Médico</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.agendamentos.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">Nenhum agendamento encontrado no sistema.</td></tr>
                  ) : (
                    data.agendamentos.map((a) => (
                      <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{new Date(a.data).toLocaleDateString("pt-BR")}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{a.paciente}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{a.medico}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{a.departamento}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(a.status)}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "departamentos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.departamentos.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">Nenhum departamento cadastrado.</div>
            ) : (
              data.departamentos.map((d, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-[#16201E]">{d.nome}</h4>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{d.medicos} Médicos</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 font-medium">Consultas Realizadas</span>
                        <span className="font-bold text-gray-900">{d.consultas}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(d.consultas, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 font-medium">Ocupação / Conversão</span>
                        <span className="font-bold text-gray-900">{d.ocupacao}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${d.ocupacao}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "medicos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.medicos.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">Nenhum médico cadastrado.</div>
            ) : (
              data.medicos.map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                  <h4 className="text-lg font-bold text-[#16201E] relative z-10">{m.nome}</h4>
                  <p className="text-blue-600 text-sm font-semibold mb-5 relative z-10">{m.especialidade}</p>
                  
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Consultas</p>
                      <p className="text-xl font-black text-gray-900">{m.consultas}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex flex-col justify-center">
                      <p className="text-xs text-yellow-700 font-bold uppercase mb-1">Avaliação IA</p>
                      <p className="text-xl font-black text-yellow-600 flex items-center gap-1">⭐ {m.avaliacao}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-[#16201E] flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" /> Exportar Dados
              </h3>
              <button onClick={() => setExportModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Qual relatório deseja exportar?</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "consultas", label: "Consultas e Agendamentos" },
                    { key: "departamentos", label: "Desempenho de Departamentos" },
                    { key: "medicos", label: "Métricas da Equipa Médica" },
                  ].map((opt) => (
                    <label key={opt.key} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${exportTarget === opt.key ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}>
                      <span className={`text-sm font-bold ${exportTarget === opt.key ? "text-blue-700" : "text-gray-600"}`}>{opt.label}</span>
                      <input type="radio" name="exportTarget" checked={exportTarget === opt.key} onChange={() => setExportTarget(opt.key as any)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Formato de Exportação</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${exportFormat === "csv" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 hover:border-gray-200 text-gray-600"}`}>
                    <input type="radio" name="exportFormat" checked={exportFormat === "csv"} onChange={() => setExportFormat("csv")} className="hidden" />
                    <span className="font-bold text-sm">Planilha CSV</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${exportFormat === "pdf" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-100 hover:border-gray-200 text-gray-600"}`}>
                    <input type="radio" name="exportFormat" checked={exportFormat === "pdf"} onChange={() => setExportFormat("pdf")} className="hidden" />
                    <span className="font-bold text-sm">Documento PDF</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="w-full py-3.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg flex justify-center items-center gap-2"
              >
                {exportLoading ? (
                  <>A gerar ficheiro...</>
                ) : (
                  <><Download className="w-4 h-4"/> Confirmar e Transferir</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
