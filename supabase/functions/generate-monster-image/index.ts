import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Monster image generation function started')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { keywords, userId } = await req.json()
    console.log('Received request:', { keywords, userId })
    
    if (!keywords || !userId) {
      return new Response(
        JSON.stringify({ error: 'Keywords and userId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get Google Cloud service account key
    const serviceAccountKey = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY')
    if (!serviceAccountKey) {
      throw new Error('Google Cloud service account key not configured')
    }

    // Parse the service account key
    const credentials = JSON.parse(serviceAccountKey)
    console.log('Using Google Cloud project:', credentials.project_id)

    // Create artistic prompt from keywords
    const prompt = createArtisticPrompt(keywords)
    console.log('Generated prompt:', prompt)
    
    // Generate access token for Google Cloud
    const accessToken = await getAccessToken(credentials)
    console.log('Access token obtained')
    
    // Generate image using Vertex AI Imagen
    const imageResponse = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${credentials.project_id}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt,
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult"
          }
        })
      }
    )

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error('Vertex AI error:', errorText)
      throw new Error(`Vertex AI error: ${imageResponse.status}`)
    }

    const imageData = await imageResponse.json()
    console.log('Vertex AI response received')
    
    if (!imageData.predictions || !imageData.predictions[0] || !imageData.predictions[0].bytesBase64Encoded) {
      throw new Error('Invalid response from Vertex AI')
    }

    const imageBase64 = imageData.predictions[0].bytesBase64Encoded
    const imageUrl = `data:image/png;base64,${imageBase64}`

    // Update user profile with generated image
    const supabaseUrl = `https://hqovjmkcqwcgwgavblqg.supabase.co`
    const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb3ZqbWtjcXdjZ3dnYXZibHFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU1MTY0NSwiZXhwIjoyMDY3MTI3NjQ1fQ.XjWLVjqV8gWJEzVP5aFdJAaHhJvOQGO6t1eZXEQ7kJM`
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { error } = await supabase
      .from('profiles')
      .update({ monster_image_url: imageUrl })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      throw new Error('Failed to save image to profile')
    }

    console.log('Monster image generated and saved successfully')
    return new Response(
      JSON.stringify({ imageUrl, prompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating monster image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function getAccessToken(credentials: any): Promise<string> {
  // Create JWT header
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  // Create JWT payload
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }

  // Import private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(credentials.private_key.replace(/\\n/g, '\n')),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )

  // Create JWT
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signatureData = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    signatureData
  )
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const jwt = `${headerB64}.${payloadB64}.${signatureB64}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Failed to get access token: ${errorText}`)
  }

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

function createArtisticPrompt(keywords: string[]): string {
  const prompts = {
    base: "Create a whimsical, artistic monster character that embodies",
    styles: [
      "in a Tim Burton-esque dark fantasy style",
      "as a friendly creature with gothic elegance", 
      "with surreal and dreamlike qualities",
      "in a romantic Victorian gothic aesthetic"
    ],
    elements: [
      "intricate fiber-like textures woven throughout its form",
      "mysterious glowing eyes that reflect deep wisdom",
      "elegant tendrils and flowing organic shapes",
      "a mix of vulnerability and strength in its expression"
    ]
  }
  
  const keywordString = keywords.join(", ")
  const randomStyle = prompts.styles[Math.floor(Math.random() * prompts.styles.length)]
  const randomElement = prompts.elements[Math.floor(Math.random() * prompts.elements.length)]
  
  return `${prompts.base} these qualities: ${keywordString}. Design it ${randomStyle}, featuring ${randomElement}. The monster should be endearing yet mysterious, representing the complex journey of someone with unique experiences. High quality digital art, detailed, atmospheric lighting.`
}