import { NextResponse } from 'next/server';
import chunck from 'chunk-text'
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
  const chunckSize = 1000
  const chuncks : string[] = chunck(inputText, chunckSize)
  let firstChunck = true
  let wrokingSummary = ""

  for (const chunck of chuncks) {
    const prompt : string = firstChunck ? 
      `write a concise summary of the following text: ${chunck}`:
      `Produce a final summary\n
      We have provided an existing summary: ${wrokingSummary}\n
      Refine the existing summary (only if needed) with more context below.\n
      ----\n
      ${chunck}\n
      ----\n
      Given the new context, refine the original summary.
      If the context isn't useful, return the original summary.`;

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      max_tokens: 500,
      prompt: prompt,
    });

    wrokingSummary = response.choices[0].text
  }

  const prompt : string = ` write a header for the following summary of a meeting: ${wrokingSummary}`

  const response = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct",
    max_tokens: 15,
    prompt: prompt
  })

  const heading = response.choices[0].text

  const summaryError = await updateSummary(wrokingSummary, audioItemId)

  if (summaryError) {
    return NextResponse.json({ error: summaryError.message}, {status:500});
  }
  const headingError = await updateHeading(heading, audioItemId)

  if (headingError) {
    return NextResponse.json({ error: headingError.message}, {status:500}); 
  }

  return NextResponse.json({status:200});
}

async function updateSummary(summary: string, audioItemId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.from("audio_data").update({summary: summary}).eq('id', audioItemId)
  if (error) {
    return error;
  } 
  return null;
}

async function updateHeading(heading: string, audioItemId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.from("audio_data").update({heading: heading}).eq('id', audioItemId)
  if (error) {
    return error;
  } 
  return null;
}
