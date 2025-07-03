import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Testing Google Cloud service account key...')
    
    const serviceAccountKey = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY')
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY not found')
    }

    console.log('Key exists, attempting to parse...')
    console.log('Key starts with:', serviceAccountKey.substring(0, 50))
    
    const credentials = JSON.parse(serviceAccountKey)
    console.log('Successfully parsed credentials for project:', credentials.project_id)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        project_id: credentials.project_id,
        client_email: credentials.client_email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error testing key:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})