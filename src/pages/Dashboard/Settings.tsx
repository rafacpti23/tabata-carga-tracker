import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Settings as SettingsIcon, Edit, MoreHorizontal, Trash, UserPlus } from 'lucide-react';

interface UserType {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface CargoType {
  id: string;
  local_carregamento: string;
  local_descarga: string;
  numero_conhecimento: string;
  valor_viagem: number;
  status: string;
  motorista_id?: string;
  criado_em: string;
  hora_descarga?: string;
}

// Definir um tipo específico para os papéis de usuário que corresponda ao tipo definido no banco de dados
type UserRole = 'viewer' | 'admin' | 'operator';

export default function Settings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isWebhookUrlSaving, setIsWebhookUrlSaving] = useState(false);
  const [isTestingSending, setIsTestingSending] = useState(false);
  const [showMapOnDashboard, setShowMapOnDashboard] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('viewer');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Load stored settings when component mounts
  useEffect(() => {
    const storedWebhookUrl = localStorage.getItem('webhookUrl') || '';
    const storedShowMap = localStorage.getItem('showMapOnDashboard') !== 'false'; // Default to true
    
    setWebhookUrl(storedWebhookUrl);
    setShowMapOnDashboard(storedShowMap);
  }, []);
  
  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    
    try {
      // Get users from profiles table which has role information
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        throw profilesError;
      }
      
      // Format users data
      const formattedUsers = profilesData.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        created_at: profile.created_at,
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAddingUser(true);
    
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true,
        user_metadata: { role: newUserRole }
      });
      
      if (authError) throw authError;
      
      // Handle successful user creation
      toast({
        title: "Usuário criado com sucesso",
        description: `${newUserEmail} foi adicionado com o papel de ${newUserRole}.`
      });
      
      // Reset form and refresh user list
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('viewer');
      fetchUsers();
      
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Não foi possível criar o usuário",
        variant: "destructive"
      });
    } finally {
      setIsAddingUser(false);
    }
  };
  
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Papel atualizado",
        description: `O papel do usuário foi atualizado para ${newRole}.`
      });
    } catch (error: any) {
      console.error("Erro ao atualizar papel:", error);
      toast({
        title: "Erro ao atualizar papel",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      // Delete user from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Usuário removido",
        description: `${userEmail} foi removido com sucesso.`
      });
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveWebhookUrl = async () => {
    if (!webhookUrl) {
      toast({
        title: "URL não informada",
        description: "Por favor, informe uma URL válida para o webhook.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsWebhookUrlSaving(true);
      
      // Save webhook URL to localStorage
      localStorage.setItem('webhookUrl', webhookUrl);
      
      toast({
        title: "URL salva com sucesso",
        description: "A URL do webhook foi salva.",
      });
    } catch (error) {
      console.error("Erro ao salvar URL:", error);
      toast({
        title: "Erro ao salvar URL",
        description: "Ocorreu um erro ao salvar a URL do webhook.",
        variant: "destructive"
      });
    } finally {
      setIsWebhookUrlSaving(false);
    }
  };
  
  const handleTestWebhook = async () => {
    const storedUrl = localStorage.getItem('webhookUrl') || webhookUrl;
    
    if (!storedUrl) {
      toast({
        title: "URL não configurada",
        description: "Configure uma URL para o webhook antes de testar.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsTestingSending(true);
      
      // Simulate test send
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Teste enviado com sucesso",
        description: "O teste foi enviado para o webhook configurado.",
      });
    } catch (error) {
      console.error("Erro ao testar webhook:", error);
      toast({
        title: "Erro ao testar webhook",
        description: "Ocorreu um erro ao enviar o teste para o webhook.",
        variant: "destructive"
      });
    } finally {
      setIsTestingSending(false);
    }
  };
  
  const handleToggleMap = (checked: boolean) => {
    setShowMapOnDashboard(checked);
    localStorage.setItem('showMapOnDashboard', checked.toString());
    
    toast({
      title: checked ? "Mapa ativado" : "Mapa desativado",
      description: checked ? 
        "O mapa será exibido no dashboard." : 
        "O mapa foi removido do dashboard.",
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      
      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Crie um novo usuário para acessar o sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        placeholder="usuario@exemplo.com" 
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="Mínimo 6 caracteres" 
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Papel</Label>
                      <select 
                        id="role"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      >
                        <option value="viewer">Visualizador</option>
                        <option value="operator">Operador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleAddUser}
                      disabled={isAddingUser}
                    >
                      {isAddingUser ? "Criando..." : "Criar usuário"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <p>Carregando usuários...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map(user => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={
                                user.role === 'admin' ? "destructive" : 
                                user.role === 'operator' ? "outline" : 
                                "secondary"
                              }>
                                {user.role === 'admin' ? "Administrador" : 
                                 user.role === 'operator' ? "Operador" : 
                                 "Visualizador"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Ativo</Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Abrir menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateUserRole(user.id, 'viewer')}
                                    disabled={user.role === 'viewer'}
                                  >
                                    Definir como Visualizador
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateUserRole(user.id, 'operator')}
                                    disabled={user.role === 'operator'}
                                  >
                                    Definir como Operador
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateUserRole(user.id, 'admin')}
                                    disabled={user.role === 'admin'}
                                  >
                                    Definir como Administrador
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                  >
                                    Excluir Usuário
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Total: {users.length} usuários
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook</Label>
                <Input 
                  id="webhook-url" 
                  placeholder="https://exemplo.com/webhook" 
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Esta URL será usada para enviar notificações quando novos fretes forem disponibilizados.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSaveWebhookUrl}
                  disabled={isWebhookUrlSaving}
                >
                  {isWebhookUrlSaving ? "Salvando..." : "Salvar URL"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestWebhook}
                  disabled={isTestingSending}
                >
                  {isTestingSending ? "Enviando..." : "Testar Webhook"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Enviar Frete para Motorista</CardTitle>
            </CardHeader>
            <CardContent>
              <EnviarFreteParaMotorista />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-map">Exibir Mapa no Dashboard</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar ou desativar a exibição do mapa na página inicial.
                    </p>
                  </div>
                  <Switch 
                    id="show-map"
                    checked={showMapOnDashboard}
                    onCheckedChange={handleToggleMap}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Versão do Sistema</Label>
                <p className="text-sm">1.0.0</p>
              </div>
              
              <div className="space-y-2">
                <Label>Empresa</Label>
                <p className="text-sm">TabShipping</p>
              </div>
              
              <div className="mt-8 pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Suporte</h3>
                <p className="text-sm">
                  Para suporte técnico, entre em contato com:
                </p>
                <p className="text-sm font-semibold mt-1">
                  <a 
                    href="https://ramelseg.com.br" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ramel Tecnologia
                  </a>
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  &copy; {new Date().getFullYear()} TabShipping - Desenvolvido por Ramel Tecnologia
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EnviarFreteParaMotorista() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<CargoType | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [cargos, setCargos] = useState<CargoType[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  React.useEffect(() => {
    // Carregar cargas e motoristas do banco de dados
    const fetchData = async () => {
      try {
        const { data: cargosData, error: cargosError } = await supabase
          .from('cargas')
          .select('*')
          .eq('status', 'loading')
          .order('criado_em', { ascending: false });
          
        const { data: driversData, error: driversError } = await supabase
          .from('motoristas')
          .select('*');
          
        if (cargosData) setCargos(cargosData);
        if (driversData) setDrivers(driversData);

        if (cargosError) throw cargosError;
        if (driversError) throw driversError;
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as cargas ou motoristas.",
          variant: "destructive"
        });
      }
    };
    
    fetchData();
  }, []);
  
  const handleSendFreight = async () => {
    if (!selectedCargo || !selectedDriver) {
      toast({
        title: "Dados incompletos",
        description: "Selecione uma carga e um motorista.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSending(true);
      
      const webhookUrl = localStorage.getItem('webhookUrl');
      if (!webhookUrl) {
        toast({
          title: "URL não configurada",
          description: "Configure uma URL para o webhook antes de enviar.",
          variant: "destructive"
        });
        setIsSending(false);
        return;
      }
      
      // Aqui seria uma chamada real para o webhook
      // Por enquanto, vamos simular o envio
      const mensagem = `*NOVO FRETE DISPONÍVEL*\n\nOrigem: ${selectedCargo.local_carregamento}\nDestino: ${selectedCargo.local_descarga}\nConhecimento: ${selectedCargo.numero_conhecimento}\nValor: R$ ${selectedCargo.valor_viagem.toFixed(2)}\n\nResponda "ACEITAR" para confirmar este frete.`;
      
      console.log("Enviando para webhook:", {
        telefone: selectedDriver.telefone,
        mensagem: mensagem
      });
      
      // Simular tempo de envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Frete enviado com sucesso",
        description: `O frete foi enviado para ${selectedDriver.nome} via WhatsApp.`,
      });
      
      setIsOpen(false);
      setSelectedCargo(null);
      setSelectedDriver(null);
    } catch (error) {
      console.error("Erro ao enviar frete:", error);
      toast({
        title: "Erro ao enviar frete",
        description: "Ocorreu um erro ao enviar o frete para o motorista.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Envie ofertas de frete diretamente para o WhatsApp dos motoristas.
      </p>
      
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button>Enviar Frete</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Enviar Frete para Motorista</DrawerTitle>
              <DrawerDescription>
                Selecione a carga e o motorista para enviar a oferta via WhatsApp.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Selecione a Carga</Label>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger className="w-full justify-between">
                        {selectedCargo ? `${selectedCargo.local_carregamento} → ${selectedCargo.local_descarga}` : 'Selecione uma carga'}
                      </MenubarTrigger>
                      <MenubarContent>
                        {cargos.length > 0 ? (
                          cargos.map(cargo => (
                            <MenubarItem 
                              key={cargo.id} 
                              onClick={() => setSelectedCargo(cargo)}
                            >
                              {cargo.local_carregamento} → {cargo.local_descarga} ({cargo.numero_conhecimento})
                            </MenubarItem>
                          ))
                        ) : (
                          <MenubarItem disabled>Nenhuma carga disponível</MenubarItem>
                        )}
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="driver">Selecione o Motorista</Label>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger className="w-full justify-between">
                        {selectedDriver ? selectedDriver.nome : 'Selecione um motorista'}
                      </MenubarTrigger>
                      <MenubarContent>
                        {drivers.length > 0 ? (
                          drivers.map(driver => (
                            <MenubarItem 
                              key={driver.id}
                              onClick={() => setSelectedDriver(driver)}
                            >
                              {driver.nome} ({driver.placa_cavalo})
                            </MenubarItem>
                          ))
                        ) : (
                          <MenubarItem disabled>Nenhum motorista disponível</MenubarItem>
                        )}
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </div>
                
                {selectedCargo && selectedDriver && (
                  <div className="border rounded-md p-3 bg-muted/30">
                    <h4 className="font-semibold mb-2">Prévia da mensagem:</h4>
                    <p className="text-sm whitespace-pre-line">
                      *NOVO FRETE DISPONÍVEL*

                      Origem: {selectedCargo.local_carregamento}
                      Destino: {selectedCargo.local_descarga}
                      Conhecimento: {selectedCargo.numero_conhecimento}
                      Valor: R$ {selectedCargo.valor_viagem.toFixed(2)}

                      Responda "ACEITAR" para confirmar este frete.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={handleSendFreight} disabled={isSending || !selectedCargo || !selectedDriver}>
                {isSending ? "Enviando..." : "Enviar Frete"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
      
      <div className="text-sm text-center text-muted-foreground">
        Certifique-se de configurar a URL do webhook acima antes de enviar fretes.
      </div>
    </div>
  );
}
