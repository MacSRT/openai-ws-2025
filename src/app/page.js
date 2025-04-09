'use client'
import { useState } from "react";

export default function Home() {
  const [flashcards, setFlashcards] = useState([])
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateFlashcards = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/world-gen', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const flashcardsData = await response.json()
      if (Array.isArray(flashcardsData)) {
        setFlashcards(flashcardsData)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError(err.message)
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={generateFlashcards} className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Create Flash Card</h1>
      <input 
        type="text" 
        placeholder="กรอกหัวข้อ Flash Card"
        name="topic"
        onChange={(event) => setTopic(event.target.value)}
        value={topic}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Loading..' : 'สร้าง Flash Card'}
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {topic && <div>คุณเลือกหัวข้อ {topic}</div>}
      {Array.isArray(flashcards) && flashcards.length > 0 && (
        <div className="flex flex-wrap">
          {flashcards.map((flashcard) => (
            <div key={flashcard.id} className="w-1/2 p-2">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold">{flashcard.word}</h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}