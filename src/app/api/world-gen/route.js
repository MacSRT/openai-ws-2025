import OpenAI from 'openai'

console.log('API Key exists:', !!process.env.OPENAI_API_KEY)
console.log('API Key length:', process.env.OPENAI_API_KEY?.length || 0)

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request) {
  const data = await request.json()
  const topic = data.topic
  const prompt = `Create set of words for 5 flashcards from this topic: ${topic}
  Format as: 
  1:word1
  2:word2
  3:word3
  4:word4
  5:word5
  `

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })
  const aiContent = completion.choices[0].message.content

  const finalFlashcardArray = aiContent.split('\n').map((item) => {
    const id = item.split(':')[0]
    const word = item.split(':')[1]
    return {
      id: id,
      word: word
    }
  })

  return Response.json(finalFlashcardArray)
}