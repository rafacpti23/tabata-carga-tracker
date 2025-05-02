
import React, { useMemo } from 'react';
import { Driver } from '@/lib/types';

interface DriversMapProps {
  drivers: Driver[];
}

// This is a placeholder component for the map
// When integrated with Supabase, replace with a real map implementation
export function DriversMap({ drivers }: DriversMapProps) {
  const driversWithLocation = useMemo(() => 
    drivers.filter(driver => driver.ultima_lat && driver.ultima_lng), 
    [drivers]
  );

  return (
    <div className="bg-gray-100 rounded-lg p-4 flex flex-col h-full">
      <h3 className="text-lg font-medium mb-2">Localização dos Motoristas</h3>
      
      {driversWithLocation.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-md border p-4">
          <p className="text-gray-500 text-center">
            Nenhum motorista com localização disponível.
            <br />
            <span className="text-sm">
              Quando integrado com WhatsApp, as localizações serão exibidas aqui.
            </span>
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-md border relative">
          <div className="absolute inset-0 p-4 flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Mapa com {driversWithLocation.length} motoristas 
              <br/>
              (Placeholder - Integração pendente)
            </p>
          </div>
          <div className="map-container rounded-md overflow-hidden">
            {/* Map will be rendered here when integrated */}
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Clique em um motorista no mapa para ver detalhes.
      </div>
    </div>
  );
}
