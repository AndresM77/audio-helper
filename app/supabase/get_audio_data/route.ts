import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

export async function GET (request: Request) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {data} = await supabase.from('audio_data').select()
    return NextResponse.json({data})
}