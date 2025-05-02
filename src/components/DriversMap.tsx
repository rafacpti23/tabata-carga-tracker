
import React, { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Driver } from '@/lib/types';

interface DriversMapProps {
  drivers: Driver[];
}

export function DriversMap({ drivers }: DriversMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{[key: string]: mapboxgl.Marker}>({});
  
  const driversWithLocation = useMemo(() => 
    drivers.filter(driver => driver.ultima_lat && driver.ultima_lng), 
    [drivers]
  );

  useEffect(() => {
    // Verifica se a API key do Mapbox está definida
    const mapboxToken = 'pk.eyJ1IjoiYXJyYXlyYWN0aWZpZXIiLCJhIjoiY2xtNHkzaTN0MGlvNzNkbWgyeGl5ZGwwYyJ9.6PR-ci3gCfWGssa6LR9Wcg';
    
    if (!mapboxToken) {
      console.error("Mapbox token não definido");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    // Inicializa o mapa se o container existir e o mapa ainda não foi criado
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-49.2, -16.6], // Centro no Brasil
        zoom: 4
      });

      // Adiciona controles de navegação
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    return () => {
      // Limpa os marcadores e o mapa quando o componente for desmontado
      Object.values(markersRef.current).forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove os marcadores antigos
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Adiciona os novos marcadores
    driversWithLocation.forEach(driver => {
      if (!driver.ultima_lat || !driver.ultima_lng) return;

      // Cria um elemento para o marcador
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.style.backgroundColor = '#3FB1CE';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      // Cria o popup com informações do motorista
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div>
            <h3 class="font-bold">${driver.nome}</h3>
            <p>Placa: ${driver.placa_cavalo}</p>
            <p>Telefone: ${driver.telefone}</p>
          </div>
        `);

      // Cria e adiciona o marcador ao mapa
      const marker = new mapboxgl.Marker(el)
        .setLngLat([driver.ultima_lng, driver.ultima_lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Armazena a referência do marcador
      markersRef.current[driver.id] = marker;
    });

    // Ajusta o zoom e centraliza o mapa se houver motoristas
    if (driversWithLocation.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      driversWithLocation.forEach(driver => {
        if (driver.ultima_lat && driver.ultima_lng) {
          bounds.extend([driver.ultima_lng, driver.ultima_lat]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000
      });
    }
  }, [driversWithLocation]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col h-full">
      <h3 className="text-lg font-medium mb-2 dark:text-white">Localização dos Motoristas</h3>
      
      {driversWithLocation.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md border p-4">
          <p className="text-gray-500 dark:text-gray-300 text-center">
            Nenhum motorista com localização disponível.
            <br />
            <span className="text-sm">
              Envie sua localização pelo WhatsApp para aparecer aqui.
            </span>
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-gray-700 rounded-md border relative">
          <div ref={mapContainer} className="absolute inset-0 rounded-md overflow-hidden" />
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {driversWithLocation.length} motoristas online. Clique em um motorista no mapa para ver detalhes.
      </div>
    </div>
  );
}
