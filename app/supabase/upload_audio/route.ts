import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import {v4 as uuidv4} from 'uuid'
import { NextResponse } from 'next/server';

export async function POST (request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user }} = await supabase.auth.getUser()
  const fileId = uuidv4()
  
  const audioFormData : FormData = await request.formData()
  const audioForm : FormDataEntryValue | null = audioFormData.get("file")

  if (!audioForm) {
    return NextResponse.json({ error: "Failed to retrieve audio form object" }, {status:400});
  }

  const {data, error} = await supabase.storage.from("audio").upload(user?.id + "/" + fileId, audioForm, {
    contentType: "audio/mpeg"
  })
  if (!error) {
    const {data, error} = await supabase.from("audio_data").insert({audio_file_id: fileId, user_id: user?.id,})
    if (error) {
      return NextResponse.json({ error: error ? error.message : "Audio item failed to uplaod" }, {status:500});
    }
    return NextResponse.json({status:200});
  }

  return NextResponse.json({ error: error.message }, {status:500});
}
