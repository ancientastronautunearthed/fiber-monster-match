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
    console.log('About to parse request body')
    const { keywords, userId } = await req.json()
    console.log('Received request:', { keywords, userId })
    
    if (!keywords || !userId) {
      console.log('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Keywords and userId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get Hugging Face access token
    console.log('Checking for Hugging Face token')
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!hfToken) {
      console.log('Hugging Face token not found')
      throw new Error('Hugging Face access token not configured')
    }
    console.log('Hugging Face token found')

    // Create artistic prompt from keywords
    const prompt = createArtisticPrompt(keywords)
    console.log('Generated prompt:', prompt)
    
    console.log('Calling Hugging Face API...')
    
    // Generate image using Hugging Face API with fetch
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    )

    console.log('Hugging Face response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', errorText)
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
    }

    // Convert the response to arrayBuffer and then to base64
    const imageBuffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    const imageUrl = `data:image/png;base64,${base64}`

    console.log('Image generated successfully, saving to profile...')

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