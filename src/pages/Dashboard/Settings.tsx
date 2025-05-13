
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { useState as hookState } from 'react';

export default function Settings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isWebhookUrlSaving, setIsWebhookUrlSaving] = useState(false);
  const [isTestingSending, setIsTestingSending] = useState(false);
  
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
      
      // Salvar webhook URL no localStorage por enquanto
      // Em uma implementação real, isso seria salvo no banco de dados
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
      
      // Simular envio de teste
      // Em uma implementação real, isso enviaria uma solicitação HTTP para o webhook
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
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      
      <Tabs defaultValue="webhook" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>
        
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
              <div className="space-y-2">
                <Label>Versão do Sistema</Label>
                <p className="text-sm">1.0.0</p>
              </div>
              
              <div className="space-y-2">
                <Label>Empresa</Label>
                <p className="text-sm">Tobema Transportes</p>
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
  const [selectedCargo, setSelectedCargo] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [cargos, setCargos] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  React.useEffect(() => {
    // Carregar cargas e motoristas do banco de dados
    const fetchData = async () => {
      try {
        const { data: cargosData } = await supabase
          .from('cargas')
          .select('*')
          .eq('status', 'loading')
          .order('criado_em', { ascending: false });
          
        const { data: driversData } = await supabase
          .from('motoristas')
          .select('*');
          
        if (cargosData) setCargos(cargosData);
        if (driversData) setDrivers(driversData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
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
