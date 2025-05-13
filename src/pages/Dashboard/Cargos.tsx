
import { useState, useEffect } from "react";
import { Cargo, Driver } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Image 
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPhotosDialogOpen, setIsPhotosDialogOpen] = useState(false);
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'operator';
  
  const [formData, setFormData] = useState({
    id: "",
    motorista_id: "",
    numero_conhecimento: "",
    local_carregamento: "",
    local_descarga: "",
    km_inicial: "0",
    valor_viagem: "0",
    status: "loading" as "loading" | "in_transit" | "delivered"
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

  const getStatusName = (status: string) => {
    switch (status) {
      case 'loading':
        return 'Carregando';
      case 'in_transit':
        return 'Em trânsito';
      case 'delivered':
        return 'Entregue';
      default:
        return 'Desconhecido';
    }
  };

  const handleCargoClick = (cargo: Cargo) => {
    setSelectedCargo(cargo);
  };

  const handleEditClick = (e: React.MouseEvent, cargo: Cargo) => {
    e.stopPropagation();
    setFormData({
      id: cargo.id,
      motorista_id: cargo.motorista_id,
      numero_conhecimento: cargo.numero_conhecimento,
      local_carregamento: cargo.local_carregamento,
      local_descarga: cargo.local_descarga,
      km_inicial: cargo.km_inicial.toString(),
      valor_viagem: cargo.valor_viagem.toString(),
      status: cargo.status
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, cargo: Cargo) => {
    e.stopPropagation();
    setSelectedCargo(cargo);
    setIsDeleteDialogOpen(true);
  };

  const handleViewPhotosClick = (e: React.MouseEvent, cargo: Cargo) => {
    e.stopPropagation();
    setSelectedCargo(cargo);
    setIsPhotosDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'status') {
      setFormData(prev => ({ ...prev, [name]: value as "loading" | "in_transit" | "delivered" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
          status: formData.status
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
        id: "",
        motorista_id: "",
        numero_conhecimento: "",
        local_carregamento: "",
        local_descarga: "",
        km_inicial: "0",
        valor_viagem: "0",
        status: "loading"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar carga",
        description: error.message
      });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('cargas')
        .update({
          motorista_id: formData.motorista_id,
          numero_conhecimento: formData.numero_conhecimento,
          local_carregamento: formData.local_carregamento,
          local_descarga: formData.local_descarga,
          km_inicial: parseInt(formData.km_inicial),
          valor_viagem: parseFloat(formData.valor_viagem),
          status: formData.status
        })
        .eq('id', formData.id)
        .select();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar carga",
          description: error.message
        });
        return;
      }

      setCargos(prev => 
        prev.map(cargo => 
          cargo.id === formData.id ? (data[0] as Cargo) : cargo
        )
      );
      setIsEditDialogOpen(false);
      
      toast({
        title: "Carga atualizada",
        description: "A carga foi atualizada com sucesso."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar carga",
        description: error.message
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCargo) return;
    
    try {
      const { error } = await supabase
        .from('cargas')
        .delete()
        .eq('id', selectedCargo.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir carga",
          description: error.message
        });
        return;
      }

      setCargos(prev => prev.filter(cargo => cargo.id !== selectedCargo.id));
      setIsDeleteDialogOpen(false);
      setSelectedCargo(null);
      
      toast({
        title: "Carga excluída",
        description: "A carga foi excluída com sucesso."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir carga",
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
              {
                key: 'acoes',
                header: 'Ações',
                cell: (cargo) => (
                  <div className="flex space-x-2">
                    {cargo.foto_canhoto_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleViewPhotosClick(e, cargo)}
                        title="Ver canhoto"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    )}
                    {canEdit && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => handleEditClick(e, cargo)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => handleDeleteClick(e, cargo)}
                          title="Excluir"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ),
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loading">Carregando</SelectItem>
                      <SelectItem value="in_transit">Em trânsito</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

      {/* Edit Cargo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleUpdateSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Carga</DialogTitle>
              <DialogDescription>
                Atualize os dados da carga
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loading">Carregando</SelectItem>
                      <SelectItem value="in_transit">Em trânsito</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Atualizar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta carga? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Photos Dialog */}
      <Dialog open={isPhotosDialogOpen} onOpenChange={setIsPhotosDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Canhoto da Carga</DialogTitle>
            <DialogDescription>
              Visualize a foto do canhoto entregue pelo motorista
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {selectedCargo?.foto_canhoto_url ? (
              <div className="flex flex-col items-center gap-4">
                <img 
                  src={selectedCargo.foto_canhoto_url}
                  alt="Canhoto"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
                <a 
                  href={selectedCargo.foto_canhoto_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink size={16} /> Abrir em nova janela
                </a>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image size={48} className="mx-auto mb-2 opacity-30" />
                <p>Nenhum canhoto disponível para esta carga.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhotosDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
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
                    <div className="flex space-x-2">
                      <a 
                        href={selectedCargo.foto_canhoto_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        Ver Canhoto <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setIsPhotosDialogOpen(true);
                          setSelectedCargo(selectedCargo);
                        }}
                      >
                        <Image className="mr-1 h-3 w-3" /> Visualizar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {canEdit && (
                <DialogFooter className="flex justify-between">
                  <div>
                    <Button 
                      onClick={() => {
                        handleEditClick(new MouseEvent('click') as any, selectedCargo);
                        setSelectedCargo(null);
                      }}
                      variant="outline"
                      size="sm"
                      className="mr-2"
                    >
                      <Edit className="mr-1 h-3 w-3" /> Editar
                    </Button>
                    <Button 
                      onClick={() => {
                        handleDeleteClick(new MouseEvent('click') as any, selectedCargo);
                        setSelectedCargo(null);
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Excluir
                    </Button>
                  </div>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
