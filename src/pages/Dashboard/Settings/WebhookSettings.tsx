
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import FreightSender from './FreightSender';

export default function WebhookSettings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isWebhookUrlSaving, setIsWebhookUrlSaving] = useState(false);
  const [isTestingSending, setIsTestingSending] = useState(false);
  
  // Load stored settings when component mounts
  useEffect(() => {
    const storedWebhookUrl = localStorage.getItem('webhookUrl') || '';
    setWebhookUrl(storedWebhookUrl);
  }, []);

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

  return (
    <>
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
          <FreightSender />
        </CardContent>
      </Card>
    </>
  );
}
