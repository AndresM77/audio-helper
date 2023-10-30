import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

export async function POST (request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { inputText, audioItemId } = await request.json();
  const { error } = await supabase.from("audio_data").update({transcript: inputText}).eq('id', audioItemId)

  if (error) {
    return NextResponse.json({ error: error.message}, {status:500});
  } 
  return NextResponse.json({status:200});
}
