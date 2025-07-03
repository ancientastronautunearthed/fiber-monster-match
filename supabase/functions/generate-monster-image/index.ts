import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { keywords, userId } = await req.json()
    
    if (!keywords || !userId) {
      return new Response(
        JSON.stringify({ error: 'Keywords and userId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get Google Cloud credentials
    const serviceAccountKey = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY')
    if (!serviceAccountKey) {
      throw new Error('Google Cloud service account key not configured')
    }

    const credentials = JSON.parse(serviceAccountKey)
    
    // Get access token for Google Cloud
    const jwt = await createJWT(credentials)
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    })
    
    const { access_token } = await tokenResponse.json()

    // Create artistic prompt from keywords
    const prompt = createArtisticPrompt(keywords)
    
    // Generate image using Vertex AI
    const projectId = credentials.project_id
    const location = 'us-central1'
    
    const imageResponse = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
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

    const imageResult = await imageResponse.json()
    
    if (!imageResult.predictions || !imageResult.predictions[0]) {
      throw new Error('Failed to generate image')
    }

    const imageBase64 = imageResult.predictions[0].bytesBase64Encoded
    
    // Convert to data URL
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

async function createJWT(credentials: any) {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now
  }

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`
  
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
  
  // Sign
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput)
  )
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  return `${signatureInput}.${encodedSignature}`
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