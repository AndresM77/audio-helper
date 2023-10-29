import { createClient } from "../../../utils/supabase/server";
import chunck from 'chunk-text'
import OpenAI from 'openai';
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // 💡 Add your OpenAI key to your .env
});

// 💡 Use Vercel's edge runtime.
export const runtime = "edge";

export async function POST (request: Request) {
  const { inputText, audioItemId } = await request.json();
  const chunckSize = 200
  const chuncks : string[] = chunck(inputText, chunckSize)

  const response = await openai.embeddings.create({
    input: chuncks,
    model: "text-embedding-ada-002"
  })
  const data = response.data

  const mapping = data.map(function(embeddingObj, index) {
    return [chuncks[index], embeddingObj.embedding];
  });

  return await updateEmbeddings(mapping, audioItemId);
}

async function updateEmbeddings(embeddingItems: any[][], audioItemId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  for (const embeddingItem of embeddingItems) {
    const { error } = await supabase.from("audio_embeddings").insert({audio_data_id: audioItemId, embedding: embeddingItem[1], body: embeddingItem[0]})
    console.log(error?.message)

    if (error) {
        return NextResponse.json({ error: error.message}, {status:500});
    } 
  };
  const { error } = await supabase.from("audio_data").update({embeddings: true}).eq('id', audioItemId)
    if (error) {
        return NextResponse.json({ error: error.message}, {status:500});
    } 
  return NextResponse.json({status:200});
}