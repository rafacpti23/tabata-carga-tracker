
import { useState } from "react";
import { Cargo, Driver } from "@/lib/types";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Sample data for demonstration
const mockDrivers: Driver[] = [
  {
    id: '1',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    placa_cavalo: 'ABC-1234',
    telefone: '(11) 98765-4321',
    ultima_lat: -23.550520,
    ultima_lng: -46.633309,
    atualizado_em: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    cpf: '234.567.890-11',
    placa_cavalo: 'DEF-5678',
    telefone: '(11) 91234-5678',
    ultima_lat: -23.555,
    ultima_lng: -46.640,
    atualizado_em: new Date().toISOString(),
  },
  {
    id: '3',
    nome: 'Pedro Santos',
    cpf: '345.678.901-22',
    placa_cavalo: 'GHI-9012',
    telefone: '(11) 99876-5432',
    ultima_lat: null,
    ultima_lng: null,
    atualizado_em: new Date(Date.now() - 86400000).toISOString(),
  }
];

const mockCargos: Cargo[] = [
  {
    id: '1',
    motorista_id: '1',
    local_carregamento: 'São Paulo, SP',
    hora_inicio: new Date(Date.now() - 3600000).toISOString(),
    km_inicial: 12500,
    local_descarga: 'Campinas, SP',
    hora_descarga: null,
    foto_canhoto_url: null,
    criado_em: new Date(Date.now() - 3600000).toISOString(),
    status: 'in_transit',
  },
  {
    id: '2',
    motorista_id: '2',
    local_carregamento: 'Rio de Janeiro, RJ',
    hora_inicio: new Date(Date.now() - 7200000).toISOString(),
    km_inicial: 45700,
    local_descarga: 'São Paulo, SP',
    hora_descarga: null,
    foto_canhoto_url: null,
    criado_em: new Date(Date.now() - 7200000).toISOString(),
    status: 'in_transit',
  },
  {
    id: '3',
    motorista_id: '3',
    local_carregamento: 'Curitiba, PR',
    hora_inicio: new Date(Date.now() - 86400000).toISOString(),
    km_inicial: 23400,
    local_descarga: 'Florianópolis, SC',
    hora_descarga: new Date().toISOString(),
    foto_canhoto_url: 'https://example.com/canhoto.jpg',
    criado_em: new Date(Date.now() - 86400000).toISOString(),
    status: 'delivered',
  },
  {
    id: '4',
    motorista_id: '1',
    local_carregamento: 'Belo Horizonte, MG',
    hora_inicio: new Date(Date.now() - 172800000).toISOString(),
    km_inicial: 10200,
    local_descarga: 'Juiz de Fora, MG',
    hora_descarga: new Date(Date.now() - 86400000).toISOString(),
    foto_canhoto_url: 'https://example.com/canhoto2.jpg',
    criado_em: new Date(Date.now() - 172800000).toISOString(),
    status: 'delivered',
  }
];

export default function Cargos() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  
  const getFilteredCargos = () => {
    return mockCargos.filter((cargo) => {
      const matchesSearch =
        cargo.local_carregamento.toLowerCase().includes(searchText.toLowerCase()) ||
        cargo.local_descarga.toLowerCase().includes(searchText.toLowerCase()) ||
        getDriverName(cargo.motorista_id).toLowerCase().includes(searchText.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && cargo.status === statusFilter;
    });
  };

  const getDriverName = (id: string) => {
    const driver = mockDrivers.find(d => d.id === id);
    return driver ? driver.nome : 'N/A';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Carregando</Badge>;
      case 'in_transit':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em trânsito</Badge>;
      case 'delivered':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Entregue</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const handleCargoClick = (cargo: Cargo) => {
    setSelectedCargo(cargo);
  };

  const filteredCargos = getFilteredCargos();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Cargas</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Carga
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Gestão de Cargas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por origem, destino ou motorista..."
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="loading">Carregando</SelectItem>
                    <SelectItem value="in_transit">Em trânsito</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable
            data={filteredCargos}
            columns={[
              {
                key: 'motorista',
                header: 'Motorista',
                cell: (cargo) => getDriverName(cargo.motorista_id),
              },
              {
                key: 'origem',
                header: 'Origem',
                cell: (cargo) => cargo.local_carregamento,
              },
              {
                key: 'destino',
                header: 'Destino',
                cell: (cargo) => cargo.local_descarga,
              },
              {
                key: 'inicio',
                header: 'Início',
                cell: (cargo) => format(new Date(cargo.hora_inicio), "dd/MM/yyyy HH:mm"),
              },
              {
                key: 'status',
                header: 'Status',
                cell: (cargo) => getStatusBadge(cargo.status),
              },
            ]}
            onRowClick={handleCargoClick}
          />
        </CardContent>
      </Card>

      {/* Cargo Detail Dialog */}
      <Dialog open={!!selectedCargo} onOpenChange={() => setSelectedCargo(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedCargo && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Carga</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Motorista</span>
                  <span className="font-medium">{getDriverName(selectedCargo.motorista_id)}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Origem</span>
                  <span>{selectedCargo.local_carregamento}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Destino</span>
                  <span>{selectedCargo.local_descarga}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Status</span>
                  {getStatusBadge(selectedCargo.status)}
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Data/Hora de Início</span>
                  <span>
                    {format(new Date(selectedCargo.hora_inicio), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Km Inicial</span>
                  <span>{selectedCargo.km_inicial.toLocaleString()}</span>
                </div>
                {selectedCargo.hora_descarga && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Data/Hora de Entrega</span>
                    <span>
                      {format(new Date(selectedCargo.hora_descarga), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                )}
                {selectedCargo.foto_canhoto_url && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Canhoto</span>
                    <Button variant="outline" className="w-fit">
                      Ver Canhoto
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
