
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';

export default function SystemSettings() {
  const [showMapOnDashboard, setShowMapOnDashboard] = useState(false);
  
  // Load stored settings when component mounts
  useEffect(() => {
    const storedShowMap = localStorage.getItem('showMapOnDashboard') === 'true'; // Default to false
    setShowMapOnDashboard(storedShowMap);
  }, []);
  
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
          <p className="text-sm">TobShipping</p>
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
            &copy; {new Date().getFullYear()} TobShipping - Desenvolvido por Ramel Tecnologia
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
