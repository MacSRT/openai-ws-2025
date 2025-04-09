import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Check for API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is missing');
  // Don't throw an error during build time
  if (process.env.NODE_ENV === 'production') {
    console.warn('GEMINI_API_KEY is missing in production environment');
  } else {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
}

// Initialize the Gemini API
let genAI;
try {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini API initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Gemini API:', error);
  // Don't throw an error during build time
  if (process.env.NODE_ENV === 'production') {
    console.warn('Failed to initialize Gemini API in production environment');
  } else {
    throw new Error('Failed to initialize Gemini API');
  }
}

export async function POST(request) {
  // Check if API is properly initialized
  if (!genAI) {
    return NextResponse.json(
      { error: 'API is not properly configured. Please check server logs.' },
      { status: 500 }
    );
  }

  try {
    // Parse request body
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
    console.log('Processing topic:', topic);
    
    // Create prompt
    const prompt = `Create 5 flashcards about "${topic}". 
    Format each flashcard as a number followed by a colon and the word, like this:
    1:word1
    2:word2
    3:word3
    4:word4
    5:word5
    Make sure to use exactly this format.`;

    console.log('Using prompt:', prompt);

    // Generate content
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log('Model initialized');
    
    const result = await model.generateContent(prompt);
    console.log('Content generated');
    
    if (!result || !result.response) {
      throw new Error('No response from Gemini API');
    }
    
    const response = result.response;
    console.log('Response received');
    
    const aiContent = response.text();
    console.log('AI Content:', aiContent);

    if (!aiContent) {
      throw new Error('No content generated from AI');
    }

    // Process the response
    const lines = aiContent.split('\n').filter(line => line.trim());
    console.log('Split lines:', lines);
    
    const finalFlashcardArray = lines.map((item, index) => {
      // Try to extract id and word from the format "id:word"
      const parts = item.split(':');
      if (parts.length >= 2) {
        const id = parts[0].trim();
        const word = parts.slice(1).join(':').trim(); // Join in case word contains colons
        return { id, word };
      } else {
        // Fallback if format is incorrect
        return { id: (index + 1).toString(), word: item.trim() };
      }
    });

    console.log('Processed flashcards:', finalFlashcardArray);

    if (finalFlashcardArray.length === 0) {
      throw new Error('No flashcards were generated');
    }

    return NextResponse.json(finalFlashcardArray);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}