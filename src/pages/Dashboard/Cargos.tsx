
import { useState, useEffect } from "react";
import { Cargo, Driver } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, ExternalLink } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";

export default function Cargos() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'operator';
  
  const [formData, setFormData] = useState({
    motorista_id: "",
    numero_conhecimento: "",
    local_carregamento: "",
    local_descarga: "",
    km_inicial: "0",
    valor_viagem: "0"
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
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

        setCargos(cargosData as Cargo[]);
        setDrivers(driversData as Driver[]);
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
  }, []);

  const getFilteredCargos = () => {
    return cargos.filter((cargo) => {
      const matchesSearch =
        cargo.local_carregamento.toLowerCase().includes(searchText.toLowerCase()) ||
        cargo.local_descarga.toLowerCase().includes(searchText.toLowerCase()) ||
        getDriverName(cargo.motorista_id).toLowerCase().includes(searchText.toLowerCase()) ||
        cargo.numero_conhecimento.toLowerCase().includes(searchText.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && cargo.status === statusFilter;
    });
  };

  const getDriverName = (id: string) => {
    const driver = drivers.find(d => d.id === id);
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('cargas')
        .insert([{
          motorista_id: formData.motorista_id,
          numero_conhecimento: formData.numero_conhecimento,
          local_carregamento: formData.local_carregamento,
          local_descarga: formData.local_descarga,
          km_inicial: parseInt(formData.km_inicial),
          valor_viagem: parseFloat(formData.valor_viagem),
          status: 'loading'
        }])
        .select();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao adicionar carga",
          description: error.message
        });
        return;
      }

      setCargos(prev => [data[0] as Cargo, ...prev]);
      setIsAddDialogOpen(false);
      
      toast({
        title: "Carga adicionada",
        description: "A carga foi adicionada com sucesso."
      });
      
      // Reset form
      setFormData({
        motorista_id: "",
        numero_conhecimento: "",
        local_carregamento: "",
        local_descarga: "",
        km_inicial: "0",
        valor_viagem: "0"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar carga",
        description: error.message
      });
    }
  };

  const filteredCargos = getFilteredCargos();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Cargas</h1>
        {canEdit && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Carga
          </Button>
        )}
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
                placeholder="Buscar por origem, destino, motorista ou conhecimento..."
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
                key: 'numero_conhecimento',
                header: 'Conhecimento',
                cell: (cargo) => cargo.numero_conhecimento,
              },
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
                key: 'valor',
                header: 'Valor (R$)',
                cell: (cargo) => cargo.valor_viagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
              },
              {
                key: 'status',
                header: 'Status',
                cell: (cargo) => getStatusBadge(cargo.status),
              },
            ]}
            onRowClick={handleCargoClick}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Add Cargo Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nova Carga</DialogTitle>
              <DialogDescription>
                Adicione uma nova carga para um motorista
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="motorista_id" className="text-right">Motorista</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.motorista_id} 
                    onValueChange={(value) => handleSelectChange('motorista_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.nome} - {driver.placa_cavalo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero_conhecimento" className="text-right">Conhecimento</Label>
                <Input 
                  id="numero_conhecimento" 
                  name="numero_conhecimento" 
                  value={formData.numero_conhecimento} 
                  onChange={handleFormChange} 
                  className="col-span-3" 
                  required 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="local_carregamento" className="text-right">Local de Carregamento</Label>
                <Input 
                  id="local_carregamento" 
                  name="local_carregamento" 
                  value={formData.local_carregamento} 
                  onChange={handleFormChange} 
                  className="col-span-3" 
                  required 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="local_descarga" className="text-right">Local de Descarga</Label>
                <Input 
                  id="local_descarga" 
                  name="local_descarga" 
                  value={formData.local_descarga} 
                  onChange={handleFormChange} 
                  className="col-span-3" 
                  required 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="km_inicial" className="text-right">KM Inicial</Label>
                <Input 
                  id="km_inicial" 
                  name="km_inicial" 
                  type="number" 
                  value={formData.km_inicial} 
                  onChange={handleFormChange} 
                  className="col-span-3" 
                  required 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="valor_viagem" className="text-right">Valor da Viagem (R$)</Label>
                <Input 
                  id="valor_viagem" 
                  name="valor_viagem" 
                  type="number" 
                  step="0.01" 
                  value={formData.valor_viagem} 
                  onChange={handleFormChange} 
                  className="col-span-3" 
                  required 
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  <span className="text-sm text-gray-500">Nº Conhecimento</span>
                  <span className="font-medium">{selectedCargo.numero_conhecimento}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Motorista</span>
                  <span>{getDriverName(selectedCargo.motorista_id)}</span>
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
                  <span className="text-sm text-gray-500">Valor da Viagem</span>
                  <span>R$ {selectedCargo.valor_viagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
                    <a 
                      href={selectedCargo.foto_canhoto_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      Ver Canhoto <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
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
