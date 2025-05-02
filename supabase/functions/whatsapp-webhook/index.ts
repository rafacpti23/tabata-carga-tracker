
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  from: string;
  body: string;
  type: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  media_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const data = await req.json();
      console.log("Received webhook data:", JSON.stringify(data));

      // Extract the message data
      const message: WhatsAppMessage = data.message;

      // Skip if not a valid message
      if (!message || !message.from || !message.body) {
        return new Response(JSON.stringify({ success: false, error: "Invalid message format" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Get the driver based on the phone number
      const { data: drivers, error: driverError } = await supabaseClient
        .from('motoristas')
        .select('*')
        .eq('telefone', message.from)
        .maybeSingle();

      if (driverError) {
        console.error("Error fetching driver:", driverError);
        return new Response(JSON.stringify({ success: false, error: driverError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      if (!drivers) {
        return new Response(JSON.stringify({ success: false, error: "Driver not found" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      // Process location updates
      if (message.type === 'location' && message.latitude && message.longitude) {
        const { error: updateError } = await supabaseClient
          .from('motoristas')
          .update({
            ultima_lat: message.latitude,
            ultima_lng: message.longitude,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', drivers.id);

        if (updateError) {
          console.error("Error updating location:", updateError);
          return new Response(JSON.stringify({ success: false, error: updateError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Process cargo updates
      else if (message.body.toLowerCase().includes('carreg')) {
        const infoRegex = /carreg[^:]*:\s*([^,]+),\s*([^,]+)/i;
        const match = message.body.match(infoRegex);

        if (match && match.length >= 3) {
          const local_carregamento = match[1].trim();
          const numeroConhecimento = match[2].trim();
          
          // Create a new cargo entry
          const { error: cargoError } = await supabaseClient
            .from('cargas')
            .insert({
              motorista_id: drivers.id,
              numero_conhecimento: numeroConhecimento,
              local_carregamento: local_carregamento,
              local_descarga: 'A confirmar',
              km_inicial: 0,
              valor_viagem: 0,
              status: 'loading'
            });

          if (cargoError) {
            console.error("Error creating cargo:", cargoError);
            return new Response(JSON.stringify({ success: false, error: cargoError.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            });
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }

      // Process delivery updates
      else if (message.body.toLowerCase().includes('descarg')) {
        const infoRegex = /descarg[^:]*:\s*([^,]+),\s*([^,]+)/i;
        const match = message.body.match(infoRegex);

        if (match && match.length >= 3) {
          const local_descarga = match[1].trim();
          const numeroConhecimento = match[2].trim();
          
          // Update the cargo entry
          const { error: cargoError } = await supabaseClient
            .from('cargas')
            .update({
              local_descarga: local_descarga,
              hora_descarga: new Date().toISOString(),
              status: 'delivered'
            })
            .eq('numero_conhecimento', numeroConhecimento)
            .eq('motorista_id', drivers.id);

          if (cargoError) {
            console.error("Error updating cargo:", cargoError);
            return new Response(JSON.stringify({ success: false, error: cargoError.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            });
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }

      // Process receipt photo uploads
      else if (message.type === 'image' && message.media_url) {
        // Find the most recent cargo for this driver that's in transit or delivered
        const { data: cargos, error: cargoError } = await supabaseClient
          .from('cargas')
          .select('*')
          .eq('motorista_id', drivers.id)
          .in('status', ['in_transit', 'delivered'])
          .order('criado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cargoError) {
          console.error("Error fetching cargo:", cargoError);
          return new Response(JSON.stringify({ success: false, error: cargoError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        if (!cargos) {
          return new Response(JSON.stringify({ success: false, error: "No active cargo found" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }

        // Update the cargo with the photo URL
        const { error: updateError } = await supabaseClient
          .from('cargas')
          .update({
            foto_canhoto_url: message.media_url,
            status: 'delivered'
          })
          .eq('id', cargos.id);

        if (updateError) {
          console.error("Error updating cargo with photo:", updateError);
          return new Response(JSON.stringify({ success: false, error: updateError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ success: false, message: "No action taken" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
