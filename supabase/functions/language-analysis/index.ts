
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function analyzeCollocationsAndTranslation(text: string) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('Gemini API key not configured')
  
  const prompt = `Act as an expert linguistic analysis tool specializing in English collocations and Vietnamese translation. Your task is to analyze the provided English text, break it down into meaningful collocations or phrasal units, and provide the accurate Vietnamese translation for each unit based specifically on its meaning within the given context.

**Instructions:**
1. **Read and Understand Context:** Carefully analyze the entire input English text to grasp the overall meaning and the context in which each phrase is used.
2. **Identify Meaningful Units:** Segment the text into the most significant collocations, phrasal verbs, prepositional phrases, idiomatic expressions, or other multi-word chunks that function as a semantic unit within the sentence/paragraph.
3. **Determine Contextual Meaning:** For each identified unit, determine its precise meaning as it is used in this specific text.
4. **Translate Contextually:** Provide the most accurate and natural-sounding Vietnamese translation for the specific contextual meaning you identified in the previous step.
5. **Format Output:** Present the results clearly as a list. Each item should follow the format:

\`[Identified English Collocation/Phrase]\` : \`[Vietnamese Translation Reflecting Context]\`

**Text to Analyze:**
${text}`

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
      const analysis = await analyzeCollocationsAndTranslation(text)
      return new Response(JSON.stringify({ analysis }), {
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
