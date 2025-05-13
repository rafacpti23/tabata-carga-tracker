
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UserManagement from './Settings/UserManagement';
import WebhookSettings from './Settings/WebhookSettings';
import SystemSettings from './Settings/SystemSettings';

export default function Settings() {
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
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="webhook" className="space-y-4">
          <WebhookSettings />
        </TabsContent>
        
        <TabsContent value="sistema" className="space-y-4">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
