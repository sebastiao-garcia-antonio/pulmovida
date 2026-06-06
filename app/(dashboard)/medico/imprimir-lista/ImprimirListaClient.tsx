"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

type AgendamentoData = {
  id: string;
  paciente: string;
  data: string; // YYYY-MM-DD
  horario: string;
  status: string;
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { textAlign: "center", marginBottom: 24 },
  title: { fontSize: 18, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 },
  subtitle: { fontSize: 10, marginTop: 6, color: "#555" },
  table: { width: "100%" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#16201E", paddingBottom: 8, marginBottom: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 6 },
  colHorario: { width: "25%", fontWeight: "bold" },
  colPaciente: { width: "50%", fontWeight: "bold" },
  colStatus: { width: "25%" },
  headerText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#ccc", fontSize: 9, color: "#666" },
  empty: { textAlign: "center", color: "#999", marginTop: 20 },
});

function ListaPacientesPDF({ data, items, doctorName }: { data: string; items: AgendamentoData[], doctorName: string }) {
  // Ajuste de Data para exibição no fuso horário local e correto
  const [year, month, day] = data.split("-");
  const dataBr = data ? `${day}/${month}/${year}` : "Data não selecionada";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Lista Diária de Consultas</Text>
          <Text style={styles.subtitle}>
            Data: {dataBr} | {doctorName}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colHorario, styles.headerText]}>Horário</Text>
            <Text style={[styles.colPaciente, styles.headerText]}>Paciente</Text>
            <Text style={[styles.colStatus, styles.headerText]}>Status</Text>
          </View>

          {items.length === 0 ? (
            <Text style={styles.empty}>Nenhum paciente para esta data.</Text>
          ) : (
            items.map((a) => (
              <View style={styles.tableRow} key={a.id}>
                <Text style={styles.colHorario}>{a.horario}</Text>
                <Text style={styles.colPaciente}>{a.paciente}</Text>
                <Text style={styles.colStatus}>{a.status.toUpperCase()}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text>Gerado pelo Saúde Inteligente em: {new Date().toLocaleString("pt-BR")}</Text>
          <Text>Total de Consultas: {items.length}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function ImprimirListaClient({
  agendamentos,
  doctorName
}: {
  agendamentos: AgendamentoData[],
  doctorName: string
}) {
  const [selectedDate, setSelectedDate] = useState(() => {
    // Definir data atual no formato YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  
  const [filterStatus, setFilterStatus] = useState("todos");

  const filtered = agendamentos.filter((a) => {
    const matchDate = a.data === selectedDate;
    const matchStatus = filterStatus === "todos" || a.status === filterStatus;
    return matchDate && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "realizado": return "text-green-600";
      case "pendente": return "text-yellow-600";
      case "confirmado": return "text-blue-600";
      case "cancelado": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Folha de Consultas</h1>
          <p className="mt-1 text-[#746F70]">Gere um relatório PDF com os pacientes de um dia específico.</p>
        </div>
        <PDFDownloadLink
          document={<ListaPacientesPDF data={selectedDate} items={filtered} doctorName={doctorName} />}
          fileName={`lista-consultas-${selectedDate}.pdf`}
        >
          {({ loading }) => (
            <button
              disabled={loading}
              className="px-5 py-3 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              {loading ? "Gerando PDF..." : "Exportar PDF"}
            </button>
          )}
        </PDFDownloadLink>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#BFDBFE] flex flex-col sm:flex-row gap-5">
        <div className="flex-1">
          <label className="block text-sm font-bold text-[#16201E] mb-1.5">Selecionar Data</label>
          <input
            type="date"
            className="saas-input w-full shadow-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-[#16201E] mb-1.5">Estado da Consulta</label>
          <select
            className="saas-input w-full shadow-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos os Estados</option>
            <option value="confirmado">Confirmado</option>
            <option value="pendente">Pendente</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="saas-card p-0 overflow-hidden border border-blue-100">
        <div className="bg-[#EFF6FF]/50 p-6 border-b border-[#BFDBFE] text-center">
          <h2 className="text-xl font-bold text-[#16201E] uppercase tracking-wide">Pré-visualização da Folha</h2>
          {selectedDate && (
            <p className="text-sm font-semibold text-[#3B82F6] mt-1">
              {(() => {
                const [y, m, d] = selectedDate.split("-").map(Number);
                return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
              })()}
            </p>
          )}
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#BFDBFE] bg-white">
              <th className="py-4 px-6 text-xs font-bold text-[#746F70] uppercase tracking-wider w-1/4">Horário</th>
              <th className="py-4 px-6 text-xs font-bold text-[#746F70] uppercase tracking-wider w-1/2">Paciente</th>
              <th className="py-4 px-6 text-xs font-bold text-[#746F70] uppercase tracking-wider w-1/4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-[#746F70] font-medium">Nenhum paciente marcado para esta data.</p>
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-sm font-bold text-blue-600">{a.horario}</td>
                  <td className="py-4 px-6 font-bold text-[#16201E]">{a.paciente}</td>
                  <td className={`py-4 px-6 text-xs uppercase font-bold tracking-wider ${getStatusColor(a.status)}`}>{a.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-[#746F70] font-medium">Dr(a). {doctorName}</p>
            <p className="text-sm font-bold text-[#16201E]">Total: {filtered.length} paciente(s)</p>
          </div>
        )}
      </div>
    </div>
  );
}
