import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing');
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received request data:', data);
    
    if (!data.topic) {
      console.error('Topic is missing in request');
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const topic = data.topic;
    const prompt = `Create set of words for 5 flashcards from this topic: ${topic}
    Format as:
    1:word1
    2:word2
    3:word3
    4:word4
    5:word5`;

    console.log('Using prompt:', prompt);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log('Model initialized');
      
      const result = await model.generateContent(prompt);
      console.log('Content generated');
      
      const response = await result.response;
      console.log('Response received');
      
      const aiContent = response.text();
      console.log('AI Content:', aiContent);

      if (!aiContent) {
        throw new Error('No content generated from AI');
      }

      const finalFlashcardArray = aiContent.split('\n')
        .filter(line => line.trim())
        .map((item) => {
          const [id, word] = item.split(':').map(str => str.trim());
          return { id, word };
        });

      console.log('Processed flashcards:', finalFlashcardArray);

      if (finalFlashcardArray.length === 0) {
        throw new Error('No flashcards were generated');
      }

      return NextResponse.json(finalFlashcardArray);
    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate content: ' + aiError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}