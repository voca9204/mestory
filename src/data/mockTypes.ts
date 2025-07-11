export interface DiaryEntry {
  id: string
  date: string // YYYY-MM-DD format
  title: string
  content: string
  photos: string[]
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
  weather?: string
  tags: string[]
  wordCount: number
  createdAt: string
  updatedAt: string
}

export interface ContextData {
  date: string
  weather: {
    temperature: number
    condition: string
    humidity: number
  }
  news: string[]
  events: string[]
}