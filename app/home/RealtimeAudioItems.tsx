"use client"

import { AudioData } from "@/lib/database.types"
import AudioItem from "./AudioItem"
import { createClient } from "@/utils/supabase/client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"


export default function RealtimeAudioItems({audioItems} : {audioItems : AudioData[]}) {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase.channel('realtime audio_data').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'audio_data'
        }, () => {
            console.log("change received")
            router.refresh()
        }).subscribe();
        return () => {
            supabase.removeChannel(channel);
        }

    }, [supabase, router]);

    return(
        <div className="flex flex-col gap-4 w-lg">  
            {audioItems.map((audioData: AudioData) => {
                const givenDate = new Date(audioData.created_at)
                return <AudioItem audioData={audioData} key={givenDate.valueOf()}/>}
                )}
        </div>
    )
    
}