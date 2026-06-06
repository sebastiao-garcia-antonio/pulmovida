import Link from "next/link";
import DepartamentosTable from "@/components/tables/DepartamentosTable";

export default function DepartamentosPage() {
  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-[#16201E] tracking-tight">Departamentos Clínicos</h1>
        </div>
        <Link href="/admin" className="text-sm font-medium text-[#746F70] hover:text-[#3B82F6] transition-colors">
          &larr; Voltar
        </Link>
      </div>

      <DepartamentosTable />
    </div>
  );
}
