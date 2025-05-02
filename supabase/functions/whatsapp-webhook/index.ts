
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5'

interface WhatsAppMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: {
    body: string
  }
  location?: {
    latitude: number
    longitude: number
    name?: string
    address?: string
  }
  image?: {
    id: string
    mime_type: string
    sha256: string
    caption?: string
  }
}

interface WhatsAppPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts: Array<{
          profile: {
            name: string
          }
          wa_id: string
        }>
        messages: WhatsAppMessage[]
      }
      field: string
    }>
  }>
}

serve(async (req) => {
  try {
    // Verificar se é uma requisição de verificação do webhook
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    
    const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'tabata_webhook_token'
    
    // Responder à verificação do webhook
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado!')
      return new Response(challenge, { status: 200 })
    }

    // Se não for uma verificação, processar a mensagem
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Criar o cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload: WhatsAppPayload = await req.json()
    console.log('Payload recebido:', JSON.stringify(payload))
    
    // Processar mensagens
    if (!payload.entry || payload.entry.length === 0) {
      return new Response(JSON.stringify({ status: 'received but no entries' }), { 
        headers: { 'Content-Type': 'application/json' }
      })
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.value?.messages) {
          for (const message of change.value.messages) {
            // Processar mensagem baseado no tipo
            await processMessage(message, supabase)
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: 'received' }), { 
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function processMessage(message: WhatsAppMessage, supabase: any) {
  const phone = message.from
  console.log(`Processando mensagem do telefone: ${phone}, tipo: ${message.type}`)
  
  // Identificar o motorista pelo telefone
  const { data: motorista, error: motoristaError } = await supabase
    .from('motoristas')
    .select('*')
    .eq('telefone', phone)
    .single()
  
  if (motoristaError) {
    console.error('Erro ao buscar motorista:', motoristaError)
    return
  }
  
  if (!motorista) {
    console.log(`Nenhum motorista encontrado para o telefone ${phone}`)
    return
  }
  
  // Processar baseado no tipo de mensagem
  if (message.type === 'location' && message.location) {
    // Atualizar localização do motorista
    const { error: updateError } = await supabase
      .from('motoristas')
      .update({
        ultima_lat: message.location.latitude,
        ultima_lng: message.location.longitude,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', motorista.id)
    
    if (updateError) {
      console.error('Erro ao atualizar localização:', updateError)
    } else {
      console.log(`Localização do motorista ${motorista.nome} atualizada com sucesso`)
    }
  } else if (message.type === 'text' && message.text) {
    // Processar comandos de texto
    const text = message.text.body.trim()
    
    // Verificar se é um número de conhecimento
    if (/^\d+$/.test(text)) {
      console.log(`Processando número de conhecimento: ${text}`)
      
      // Buscar carga pelo número do conhecimento
      const { data: carga, error: cargaError } = await supabase
        .from('cargas')
        .select('*')
        .eq('numero_conhecimento', text)
        .eq('motorista_id', motorista.id)
        .single()
      
      if (cargaError) {
        console.error('Erro ao buscar carga:', cargaError)
        return
      }
      
      if (!carga) {
        console.log(`Nenhuma carga encontrada para o conhecimento ${text}`)
        return
      }
      
      // Atualizar status da carga para em trânsito
      if (carga.status === 'loading') {
        const { error: updateError } = await supabase
          .from('cargas')
          .update({
            status: 'in_transit'
          })
          .eq('id', carga.id)
        
        if (updateError) {
          console.error('Erro ao atualizar status da carga:', updateError)
        } else {
          console.log(`Status da carga ${carga.numero_conhecimento} atualizado para em trânsito`)
        }
      }
    }
  } else if (message.type === 'image' && message.image) {
    // Aqui poderia processar imagens como canhoto de entrega
    console.log(`Imagem recebida do motorista ${motorista.nome}`)
    // Implementação para salvar imagem e atualizar carga ficaria aqui
  }
}
