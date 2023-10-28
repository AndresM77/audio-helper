"use client"

import { AudioData } from "@/lib/database.types";
import { useState } from "react";
import { useEffect } from "react";

export default function AudioItem({audioData}: {audioData: AudioData}) {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`supabase/get_audio_file?audioFileId=${audioData.audio_file_id}`, {
                method: "GET",
            }) 
            
            const audioFile = await res.blob()
            if (audioFile) {
                const url = URL.createObjectURL(audioFile);
                setAudioUrl(url)
            }

        }
        fetchData().catch(console.error)
    }, [])

    const transcribe = async () => {
        
    } 

    const summarize = async () => {

    }

    const deleteItem = async () => {

    }

    return(
        <div>
            {audioUrl ? <div className="audio-player">
                <audio src={audioUrl} controls></audio>
            </div> : <h1>This item does not have an audio file associated. Please delete!</h1>}
            <button onClick={transcribe}>Transcribe</button>
            <button onClick={summarize}>Summarize</button>
            <button onClick={deleteItem}>Delete</button>
        </div>
    )
}