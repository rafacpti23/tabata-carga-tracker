
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Obter dados da solicitação
  try {
    const { telefone, mensagem } = await req.json();
    
    if (!telefone || !mensagem) {
      return new Response(
        JSON.stringify({ 
          error: 'Telefone e mensagem são obrigatórios' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    console.log(`Enviando mensagem para ${telefone}: ${mensagem}`);
    
    // Aqui você implementaria a integração com o serviço de WhatsApp
    // Por exemplo, usando a API do Twilio, Meta (WhatsApp Business), etc.
    
    // Simulação de envio bem-sucedido
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Mensagem enviada com sucesso para ${telefone}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
