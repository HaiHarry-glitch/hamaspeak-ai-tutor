
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function analyzeCollocations(text: string) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('Gemini API key not configured')
  
  const prompt = `Act as an expert linguistic analysis tool specializing in English collocations and Vietnamese translation. Your task is to analyze this English text: "${text}", break it down into meaningful collocations or phrasal units, and provide accurate Vietnamese translations. Present results as a list with format: [English Collocation/Phrase] : [Vietnamese Translation]. Focus on contextual meaning.`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, type } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    if (type === 'collocations') {
      const analysis = await analyzeCollocations(text)
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (type === 'pronunciation') {
      // Simulate pronunciation scoring for now
      const score = Math.round(Math.random() * 30 + 65)
      const pronunciationResult = {
        text,
        overallScore: {
          accuracyScore: score,
          fluencyScore: Math.round(Math.random() * 30 + 65),
          completenessScore: Math.round(Math.random() * 30 + 65),
          pronScore: score
        },
        words: [],
        json: '{}'
      }
      
      return new Response(JSON.stringify(pronunciationResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid analysis type')

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
