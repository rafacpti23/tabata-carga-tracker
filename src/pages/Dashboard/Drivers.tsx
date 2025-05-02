
import { useState, useEffect } from "react";
import { Driver } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function Drivers() {
  const [searchText, setSearchText] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    placa_cavalo: "",
    telefone: ""
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('motoristas')
          .select('*');

        if (error) {
          toast({
            variant: "destructive",
            title: "Erro ao carregar motoristas",
            description: error.message
          });
          return;
        }

        setDrivers(data as Driver[]);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar motoristas",
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.cpf.includes(searchText) ||
      driver.placa_cavalo.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.telefone.includes(searchText)
  );

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('motoristas')
        .insert([formData])
        .select();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao adicionar motorista",
          description: error.message
        });
        return;
      }

      setDrivers(prev => [...prev, data[0] as Driver]);
      setIsAddDialogOpen(false);
      
      toast({
        title: "Motorista adicionado",
        description: "O motorista foi adicionado com sucesso."
      });
      
      // Reset form
      setFormData({
        nome: "",
        cpf: "",
        placa_cavalo: "",
        telefone: ""
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar motorista",
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Motoristas</h1>
        {canEdit && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Motorista
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Gestão de Motoristas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nome, CPF, placa ou telefone..."
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <DataTable
            data={filteredDrivers}
            columns={[
              {
                key: 'nome',
                header: 'Nome',
                cell: (driver) => driver.nome,
              },
              {
                key: 'cpf',
                header: 'CPF',
                cell: (driver) => driver.cpf,
              },
              {
                key: 'placa_cavalo',
                header: 'Placa',
                cell: (driver) => driver.placa_cavalo,
              },
              {
                key: 'telefone',
                header: 'Telefone',
                cell: (driver) => driver.telefone,
              },
              {
                key: 'status',
                header: 'Status',
                cell: (driver) => (
                  <Badge variant="outline" className={
                    driver.ultima_lat && driver.ultima_lng 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }>
                    {driver.ultima_lat && driver.ultima_lng ? 'Online' : 'Offline'}
                  </Badge>
                ),
              },
            ]}
            onRowClick={handleDriverClick}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      
      {/* Add Driver Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Novo Motorista</DialogTitle>
              <DialogDescription>
                Adicione um novo motorista ao sistema
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">Nome</Label>
                <Input 
                  id="nome" 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleFormChange} 
                  className="col-span-3" 
                  required 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">CPF</Label>
                <Input 
                  id="cpf" 
                  name="cpf" 
                  value={formData.cpf} 
                  onChange={handleFormChange} 
                  className="col-span-3" 
                  required 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="placa_cavalo" className="text-right">Placa</Label>
                <Input 
                  id="placa_cavalo" 
                  name="placa_cavalo" 
                  value={formData.placa_cavalo} 
                  onChange={handleFormChange} 
                  className="col-span-3" 
                  required 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefone" className="text-right">Telefone</Label>
                <Input 
                  id="telefone" 
                  name="telefone" 
                  value={formData.telefone} 
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

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Motorista</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Nome</span>
                  <span className="font-medium">{selectedDriver.nome}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">CPF</span>
                  <span>{selectedDriver.cpf}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Placa Cavalo</span>
                  <span>{selectedDriver.placa_cavalo}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Telefone</span>
                  <span>{selectedDriver.telefone}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge variant="outline" className={
                    selectedDriver.ultima_lat && selectedDriver.ultima_lng
                      ? "bg-green-100 text-green-800 border-green-200 w-fit"
                      : "bg-gray-100 text-gray-800 border-gray-200 w-fit"
                  }>
                    {selectedDriver.ultima_lat && selectedDriver.ultima_lng ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-500">Última Atualização</span>
                  <span>
                    {selectedDriver.atualizado_em ? 
                      format(new Date(selectedDriver.atualizado_em), "dd/MM/yyyy HH:mm") : 
                      'N/A'}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
