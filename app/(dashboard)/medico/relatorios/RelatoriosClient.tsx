"use client";

import { useState, useMemo } from "react";

type Consulta = {
  id: string;
  paciente: string;
  data: string; // YYYY-MM-DD
  diagnostico: string;
  status: string; // Agendada, Realizada, Cancelada
  departamento: string;
};

type ResumoMensal = {
  mesStr: string;
  consultas: number;
  realizadas: number;
  canceladas: number;
};

export default function RelatoriosClient({ 
  consultas, 
  resumoMensal,
  departamento
}: { 
  consultas: Consulta[], 
  resumoMensal: ResumoMensal[],
  departamento: string 
}) {
  const [activeTab, setActiveTab] = useState<"consultas" | "mensal">("consultas");
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [filterData, setFilterData] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const totalConsultas = consultas.length;
  const realizadas = consultas.filter((c) => c.status === "Realizada").length;
  const agendadas = consultas.filter((c) => c.status === "Agendada").length;
  const canceladas = consultas.filter((c) => c.status === "Cancelada").length;

  const estados = ["Agendada", "Realizada", "Cancelada"];

  const filteredConsultas = useMemo(() => {
    return consultas.filter((c) => {
      if (filterData && c.data !== filterData) return false;
      if (filterEstado && c.status !== filterEstado) return false;
      return true;
    });
  }, [consultas, filterData, filterEstado]);

  const resetFilters = () => {
    setFilterData("");
    setFilterEstado("");
  };

  const handleExport = async () => {
    setExportLoading(true);

    const data = activeTab === "consultas" ? filteredConsultas : resumoMensal;

    await new Promise((r) => setTimeout(r, 600));

    if (exportFormat === "csv") {
      let csvContent = "\uFEFF";
      if (activeTab === "consultas") {
        csvContent += "ID;Paciente;Data;Diagnóstico;Status;Departamento\n";
        (data as typeof consultas).forEach((c) => {
          csvContent += `${c.id};${c.paciente};${c.data};${c.diagnostico};${c.status};${c.departamento}\n`;
        });
      } else {
        csvContent += "Mês;Consultas;Realizadas;Canceladas\n";
        (data as typeof resumoMensal).forEach((r) => {
          csvContent += `${r.mesStr};${r.consultas};${r.realizadas};${r.canceladas}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      let tableHeaders = "";
      let tableRows = "";
      const title = activeTab === "consultas" ? "Relatório de Consultas" : "Resumo Mensal";

      if (activeTab === "consultas") {
        tableHeaders = "<tr><th>Paciente</th><th>Data</th><th>Diagnóstico</th><th>Status</th><th>Departamento</th></tr>";
        (data as typeof consultas).forEach((c) => {
          tableRows += `<tr><td>${c.paciente}</td><td>${new Date(c.data).toLocaleDateString("pt-BR")}</td><td>${c.diagnostico}</td><td>${c.status}</td><td>${c.departamento}</td></tr>`;
        });
      } else {
        tableHeaders = "<tr><th>Mês</th><th>Consultas</th><th>Realizadas</th><th>Canceladas</th></tr>";
        (data as typeof resumoMensal).forEach((r) => {
          tableRows += `<tr><td>${r.mesStr}</td><td>${r.consultas}</td><td>${r.realizadas}</td><td>${r.canceladas}</td></tr>`;
        });
      }

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html><html><head><title>${title} - Saúde Inteligente</title><style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#16201E}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #BFDBFE;padding:10px;text-align:left;font-size:13px}th{background:#3B82F6;color:white}tr:nth-child(even){background:#EFF6FF}.summary{display:flex;gap:20px;margin-bottom:30px}.summary-item{background:#f5f5f5;padding:15px;border-radius:8px;flex:1;text-align:center}.value{font-size:24px;font-weight:bold;color:#16201E}.label{font-size:12px;color:#746F70}.footer{color:#746F70;font-size:12px;margin-top:30px;text-align:center}</style></head><body><h1>${title}</h1><p style="color:#746F70;margin-bottom:30px;font-size:14px">Gerado em ${new Date().toLocaleDateString("pt-BR")} | Saúde Inteligente</p><div class="summary"><div class="summary-item"><div class="value">${totalConsultas}</div><div class="label">Total Consultas</div></div><div class="summary-item"><div class="value">${realizadas}</div><div class="label">Realizadas</div></div><div class="summary-item"><div class="value">${canceladas}</div><div class="label">Canceladas</div></div></div><table>${tableHeaders}${tableRows}</table><p class="footer">Documento gerado pelo sistema Saúde Inteligente</p></body></html>`);
        printWindow.document.close();
        printWindow.print();
      }
    }

    setExportLoading(false);
    setShowModal(false);
    resetFilters();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Relatórios Clínicos</h1>
          <p className="mt-1 text-[#746F70]">Analise e exporte as métricas de atendimento.</p>
        </div>
        <button onClick={() => setShowModal(true)} disabled={exportLoading} className="px-5 py-3 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#2563EB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Exportar Dados
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saas-card p-5 border-l-4 border-l-gray-400">
          <p className="text-sm text-[#746F70] font-medium uppercase tracking-wide">Total Histórico</p>
          <p className="text-3xl font-black text-[#16201E] mt-1">{totalConsultas}</p>
        </div>
        <div className="saas-card p-5 border-l-4 border-l-green-500">
          <p className="text-sm text-[#746F70] font-medium uppercase tracking-wide">Realizadas</p>
          <p className="text-3xl font-black text-green-600 mt-1">{realizadas}</p>
        </div>
        <div className="saas-card p-5 border-l-4 border-l-blue-500">
          <p className="text-sm text-[#746F70] font-medium uppercase tracking-wide">Agendadas</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{agendadas}</p>
        </div>
        <div className="saas-card p-5 border-l-4 border-l-red-500">
          <p className="text-sm text-[#746F70] font-medium uppercase tracking-wide">Canceladas</p>
          <p className="text-3xl font-black text-red-600 mt-1">{canceladas}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#BFDBFE]">
        {[{ key: "consultas" as const, label: "Histórico de Consultas" }, { key: "mensal" as const, label: "Resumo Mensal" }].map((tab) => (
          <button 
            key={tab.key} 
            onClick={() => setActiveTab(tab.key)} 
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.key ? "border-[#3B82F6] text-[#3B82F6]" : "border-transparent text-[#746F70] hover:text-[#16201E]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="saas-card overflow-hidden border border-blue-100">
        {activeTab === "consultas" && (
          <div className="overflow-x-auto">
            {consultas.length === 0 ? (
              <div className="p-12 text-center text-[#746F70]">Sem dados de consultas para exibir.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EFF6FF]/50 border-b border-[#BFDBFE]">
                    <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Diagnóstico</th>
                    <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Departamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {consultas.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-[#16201E]">{c.paciente}</td>
                      <td className="px-6 py-4 text-sm text-[#746F70]">{new Date(c.data).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td className="px-6 py-4 text-sm text-[#746F70] italic">{c.diagnostico}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          c.status === "Realizada" ? "bg-green-50 text-green-700 border-green-200" : 
                          c.status === "Agendada" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#746F70]">{c.departamento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "mensal" && (
          <div className="overflow-x-auto">
            {resumoMensal.length === 0 ? (
              <div className="p-12 text-center text-[#746F70]">Nenhum mês registado.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EFF6FF]/50 border-b border-[#BFDBFE]">
                    <th className="px-6 py-4 text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Mês</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#3B82F6] uppercase tracking-wider text-right">Consultas</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#3B82F6] uppercase tracking-wider text-right">Realizadas</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#3B82F6] uppercase tracking-wider text-right">Canceladas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {resumoMensal.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-[#16201E] capitalize">{r.mesStr}</td>
                      <td className="px-6 py-4 text-sm text-[#746F70] text-right font-mono">{r.consultas}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600 text-right font-mono">{r.realizadas}</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600 text-right font-mono">{r.canceladas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal Exportar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16201E]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-[#BFDBFE] bg-blue-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#16201E]">Exportar {activeTab === 'consultas' ? 'Consultas' : 'Resumo'}</h3>
              <button onClick={() => { setShowModal(false); resetFilters(); }} className="text-[#746F70] hover:text-[#16201E]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-bold text-[#16201E] mb-2">Formato do Arquivo</p>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors flex-1 ${exportFormat === "csv" ? "border-[#3B82F6] bg-blue-50 text-[#3B82F6] font-bold" : "border-[#BFDBFE] bg-white text-[#16201E] hover:border-[#3B82F6]"}`}>
                    <input type="radio" name="format" value="csv" checked={exportFormat === "csv"} onChange={() => setExportFormat("csv")} className="appearance-none w-4 h-4 rounded-full border-2 border-current flex items-center justify-center before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-current before:scale-0 checked:before:scale-100 transition-transform" />
                    CSV / Excel
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors flex-1 ${exportFormat === "pdf" ? "border-[#3B82F6] bg-blue-50 text-[#3B82F6] font-bold" : "border-[#BFDBFE] bg-white text-[#16201E] hover:border-[#3B82F6]"}`}>
                    <input type="radio" name="format" value="pdf" checked={exportFormat === "pdf"} onChange={() => setExportFormat("pdf")} className="appearance-none w-4 h-4 rounded-full border-2 border-current flex items-center justify-center before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-current before:scale-0 checked:before:scale-100 transition-transform" />
                    PDF Formatação
                  </label>
                </div>
              </div>

              {activeTab === "consultas" && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-[#746F70] uppercase font-bold tracking-wider mb-2">Filtros Opcionais</p>
                  <div>
                    <label className="block text-sm font-semibold text-[#16201E] mb-1">Data Específica</label>
                    <input type="date" className="saas-input w-full shadow-sm" value={filterData} onChange={(e) => setFilterData(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#16201E] mb-1">Estado da Consulta</label>
                    <select className="saas-input w-full shadow-sm" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                      <option value="">Todos os Estados</option>
                      {estados.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "mensal" && (
                <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 p-4 rounded-xl font-medium">
                  A exportação do Resumo Mensal não requer filtros. Será gerada a tabela consolidada com a contagem mensal.
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#BFDBFE] flex gap-3">
              <button onClick={() => { setShowModal(false); resetFilters(); }} className="flex-1 px-4 py-3 font-bold text-[#746F70] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
              <button onClick={handleExport} disabled={exportLoading} className="flex-1 px-4 py-3 font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-sm">
                {exportLoading ? "A Processar..." : "Descarregar Arquivo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
