
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from '@/components/StatsCards';
import { DataTable } from '@/components/DataTable';
import { DriversMap } from '@/components/DriversMap';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cargo, Driver } from '@/lib/types';
import { Package, Truck, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const [filterText, setFilterText] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('motoristas')
          .select('*');
        
        if (driversError) {
          toast({
            variant: "destructive",
            title: "Erro ao carregar motoristas",
            description: driversError.message
          });
          return;
        }
        
        // Fetch cargos
        const { data: cargosData, error: cargosError } = await supabase
          .from('cargas')
          .select('*')
          .order('criado_em', { ascending: false });
        
        if (cargosError) {
          toast({
            variant: "destructive",
            title: "Erro ao carregar cargas",
            description: cargosError.message
          });
          return;
        }
        
        setDrivers(driversData as Driver[]);
        setCargos(cargosData as Cargo[]);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up real-time subscription for driver location updates
    const driversSubscription = supabase
      .channel('motoristas-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'motoristas'
      }, (payload) => {
        // Update the driver in our state
        setDrivers(currentDrivers => {
          const updatedDriver = payload.new as Driver;
          return currentDrivers.map(driver => 
            driver.id === updatedDriver.id ? updatedDriver : driver
          );
        });
      })
      .subscribe();
      
    // Set up real-time subscription for cargos updates
    const cargosSubscription = supabase
      .channel('cargas-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cargas'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Add new cargo to state
          setCargos(currentCargos => [payload.new as Cargo, ...currentCargos]);
        } else if (payload.eventType === 'UPDATE') {
          // Update cargo in state
          setCargos(currentCargos => {
            const updatedCargo = payload.new as Cargo;
            return currentCargos.map(cargo => 
              cargo.id === updatedCargo.id ? updatedCargo : cargo
            );
          });
        }
      })
      .subscribe();
    
    return () => {
      driversSubscription.unsubscribe();
      cargosSubscription.unsubscribe();
    };
  }, []);
  
  const driversActive = drivers.length;
  const driversOnline = drivers.filter(d => d.ultima_lat && d.ultima_lng).length;
  const cargosInTransit = cargos.filter(c => c.status === 'in_transit').length;
  const cargosDeliveredToday = cargos.filter(c => {
    if (c.status !== 'delivered' || !c.hora_descarga) return false;
    const today = new Date();
    const descargaDate = new Date(c.hora_descarga);
    return (
      descargaDate.getDate() === today.getDate() &&
      descargaDate.getMonth() === today.getMonth() &&
      descargaDate.getFullYear() === today.getFullYear()
    );
  }).length;
  
  // Calculate stats
  const totalCargas = cargos.length;
  const inTransitPercentage = totalCargas > 0 ? (cargosInTransit / totalCargas) * 100 : 0;
  const deliveredTodayPercentage = totalCargas > 0 ? (cargosDeliveredToday / totalCargas) * 100 : 0;
  
  const stats = [
    {
      title: "Motoristas Ativos",
      value: driversActive.toString(),
      description: "Total de motoristas registrados",
      icon: <Truck size={16} />,
      footer: `${driversOnline} online`,
      trend: 0,
      color: "border-tabata-600"
    },
    {
      title: "Cargas em Trânsito",
      value: cargosInTransit.toString(),
      description: "Cargas sendo transportadas",
      icon: <Package size={16} />,
      progress: Math.round(inTransitPercentage),
      footer: `${Math.round(inTransitPercentage)}% das cargas`,
      trend: 1,
      color: "border-cargo-600"
    },
    {
      title: "Entregas Hoje",
      value: cargosDeliveredToday.toString(),
      description: "Cargas entregues hoje",
      progress: Math.round(deliveredTodayPercentage),
      footer: `${Math.round(deliveredTodayPercentage)}% das cargas`,
      trend: 1,
      color: "border-green-600"
    },
    {
      title: "Total de Cargas",
      value: totalCargas.toString(),
      description: "Cargas registradas no sistema",
      icon: <BarChart3 size={16} />,
      footer: "Total acumulado",
      trend: 1,
      color: "border-blue-600"
    }
  ];
  
  // Function to get driver name
  const getDriverName = (id: string) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.nome : 'N/A';
  };

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
                    data={cargos.filter(c => c.status === 'in_transit')}
                    columns={[
                      {
                        key: 'motorista',
                        header: 'Motorista',
                        cell: (cargo) => getDriverName(cargo.motorista_id)
                      },
                      {
                        key: 'conhecimento',
                        header: 'Conhecimento',
                        cell: (cargo) => cargo.numero_conhecimento
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
                    isLoading={isLoading}
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
                    data={cargos.filter(c => c.status === 'delivered')}
                    columns={[
                      {
                        key: 'motorista',
                        header: 'Motorista',
                        cell: (cargo) => getDriverName(cargo.motorista_id)
                      },
                      {
                        key: 'conhecimento',
                        header: 'Conhecimento',
                        cell: (cargo) => cargo.numero_conhecimento
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
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="h-[400px]">
          <DriversMap drivers={drivers} />
        </Card>
      </div>
    </div>
  );
}
