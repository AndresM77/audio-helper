import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';

export async function GET (request: NextRequest) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user }} = await supabase.auth.getUser()

    const audioFileId = request.nextUrl.searchParams.get('audioFileId')

    if (!audioFileId) {
        return NextResponse.json({ error: "No audio file id specified" }, {status:400});
    }
    const {data, error} = await supabase.storage.from("audio").download(user?.id + "/" + audioFileId)
    if (data) {
        return new NextResponse(data, {status: 200, statusText: "OK"})
    } else {
        console.log(error)
    }
}