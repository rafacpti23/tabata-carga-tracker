
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from '@/components/StatsCards';
import { DataTable } from '@/components/DataTable';
import { DriversMap } from '@/components/DriversMap';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cargo, Driver } from '@/lib/types';
import { Package, Truck, BarChart3, Map } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  }
];

export default function Home() {
  const [filterText, setFilterText] = useState("");

  const stats = [
    {
      title: "Motoristas Ativos",
      value: "3",
      description: "Total de motoristas registrados",
      icon: <Truck size={16} />,
      footer: "2 em trânsito",
      trend: 0,
      color: "border-tabata-600"
    },
    {
      title: "Cargas em Trânsito",
      value: "2",
      description: "Cargas sendo transportadas",
      icon: <Package size={16} />,
      progress: 67,
      footer: "67% das cargas",
      trend: 1,
      color: "border-cargo-600"
    },
    {
      title: "Entregas Hoje",
      value: "1",
      description: "Cargas entregues hoje",
      progress: 33,
      footer: "33% das cargas",
      trend: 1,
      color: "border-green-600"
    },
    {
      title: "Km Total Percorrido",
      value: "450",
      description: "Quilômetros percorridos hoje",
      icon: <BarChart3 size={16} />,
      footer: "+120 que ontem",
      trend: 1,
      color: "border-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="active" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="active">Em Trânsito</TabsTrigger>
                <TabsTrigger value="completed">Concluídas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Cargas em Trânsito</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={mockCargos.filter(c => c.status === 'in_transit')}
                    columns={[
                      {
                        key: 'motorista',
                        header: 'Motorista',
                        cell: (cargo) => {
                          const driver = mockDrivers.find(d => d.id === cargo.motorista_id);
                          return driver ? driver.nome : 'N/A';
                        }
                      },
                      {
                        key: 'origem',
                        header: 'Origem',
                        cell: (cargo) => cargo.local_carregamento
                      },
                      {
                        key: 'destino',
                        header: 'Destino',
                        cell: (cargo) => cargo.local_descarga
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        cell: (cargo) => (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Em trânsito
                          </Badge>
                        )
                      }
                    ]}
                    filter={{
                      value: filterText,
                      onChange: setFilterText,
                      placeholder: "Filtrar cargas..."
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Cargas Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={mockCargos.filter(c => c.status === 'delivered')}
                    columns={[
                      {
                        key: 'motorista',
                        header: 'Motorista',
                        cell: (cargo) => {
                          const driver = mockDrivers.find(d => d.id === cargo.motorista_id);
                          return driver ? driver.nome : 'N/A';
                        }
                      },
                      {
                        key: 'origem',
                        header: 'Origem',
                        cell: (cargo) => cargo.local_carregamento
                      },
                      {
                        key: 'destino',
                        header: 'Destino',
                        cell: (cargo) => cargo.local_descarga
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        cell: (cargo) => (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Entregue
                          </Badge>
                        )
                      }
                    ]}
                    filter={{
                      value: filterText,
                      onChange: setFilterText,
                      placeholder: "Filtrar cargas..."
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="h-[400px]">
          <DriversMap drivers={mockDrivers} />
        </Card>
      </div>
    </div>
  );
}
