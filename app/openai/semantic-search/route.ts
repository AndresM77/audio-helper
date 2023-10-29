import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // 💡 Add your OpenAI key to your .env
});

// 💡 Use Vercel's edge runtime.
export const runtime = "edge";

export async function POST (request: Request) {
  const { inputText, audioItemId } = await request.json();
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const moderationResponse = await openai.moderations.create({ input: inputText })
  const [moderationResults] = moderationResponse.results
  if (moderationResults.flagged) {
    return NextResponse.json({ error: "Flagged content"}, {status:500});
  }
  
  const response = await openai.embeddings.create({
    input: inputText,
    model: "text-embedding-ada-002"
  })

  const embedding = response.data[0].embedding

  const { data: documents } = await supabase.rpc('search_embeddings', {
    query_embedding: embedding,
    match_threshold: 0.75,
    match_count: 5,
    query_audio_data_id: audioItemId,
  })

  console.log(documents)
  console.log("semantic search")
  return new NextResponse(documents, {status: 200, statusText: "OK"})
}   