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

    // Check if OpenAI API key is available
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create artistic prompt from keywords
    const prompt = createArtisticPrompt(keywords)
    console.log('Generated prompt:', prompt)
    
    // Generate image using OpenAI DALL-E
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('OpenAI response received')
    
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      throw new Error('Invalid response from OpenAI')
    }

    const imageBase64 = data.data[0].b64_json
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