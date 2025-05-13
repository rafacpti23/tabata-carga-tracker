
import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Driver } from '@/lib/types';

interface DriversMapProps {
  drivers: Driver[];
}

export function DriversMap({ drivers }: DriversMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
  
  const driversWithLocation = useMemo(() => 
    drivers.filter(driver => 
      driver.ultima_lat !== null && 
      driver.ultima_lng !== null && 
      typeof driver.ultima_lat === 'number' && 
      typeof driver.ultima_lng === 'number' &&
      !isNaN(driver.ultima_lat) && 
      !isNaN(driver.ultima_lng)
    ), 
    [drivers]
  );

  useEffect(() => {
    // Initialize the map if the container exists and the map hasn't been created yet
    if (mapContainer.current && !map.current) {
      try {
        map.current = L.map(mapContainer.current).setView([-16.6, -49.2], 4);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map.current);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    return () => {
      // Clean up markers and map when component is unmounted
      Object.values(markersRef.current).forEach(marker => marker.remove());
      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    try {
      // Remove old markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      // Add new markers for each driver with valid location
      driversWithLocation.forEach(driver => {
        if (!driver.ultima_lat || !driver.ultima_lng || 
            typeof driver.ultima_lat !== 'number' || 
            typeof driver.ultima_lng !== 'number' ||
            isNaN(driver.ultima_lat) || 
            isNaN(driver.ultima_lng)) {
          return;
        }

        try {
          // Create custom icon for the driver marker
          const driverIcon = L.divIcon({
            className: 'driver-marker',
            html: `<div style="background-color: #3FB1CE; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          // Create and add marker to the map
          const marker = L.marker([driver.ultima_lat, driver.ultima_lng], {
            icon: driverIcon
          }).addTo(map.current!);

          // Add popup with driver info
          marker.bindPopup(`
            <div>
              <h3 style="font-weight: bold">${driver.nome}</h3>
              <p>Placa: ${driver.placa_cavalo}</p>
              <p>Telefone: ${driver.telefone}</p>
            </div>
          `);

          // Store marker reference
          markersRef.current[driver.id] = marker;
        } catch (error) {
          console.error(`Error adding marker for driver ${driver.id}:`, error);
        }
      });

      // Adjust zoom and center the map if there are drivers
      if (driversWithLocation.length > 0) {
        try {
          const bounds = L.latLngBounds(
            driversWithLocation
              .filter(d => d.ultima_lat && d.ultima_lng && !isNaN(d.ultima_lat) && !isNaN(d.ultima_lng))
              .map(d => [d.ultima_lat as number, d.ultima_lng as number])
          );
          
          if (bounds.isValid()) {
            map.current.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 15
            });
          }
        } catch (error) {
          console.error("Error adjusting map bounds:", error);
        }
      }
    } catch (error) {
      console.error("Error managing markers:", error);
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
