"use client"

import { AudioData } from "@/lib/database.types";
import { useState } from "react";
import { useEffect } from "react";

export default function AudioItem({audioData}: {audioData: AudioData}) {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [transcription, setTrascription] = useState<string | null>();

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`supabase/get_audio_file?audioFileId=${audioData.audio_file_id}`, {
                method: "GET",
            }) 
            
            const resAudioBlob = await res.blob()

            if (resAudioBlob) {
                const url = URL.createObjectURL(resAudioBlob);
                setAudioUrl(url);
                setAudioBlob(resAudioBlob);
            }
        }

        fetchData().catch(console.error)
    }, [])

    const transcribe = async () => {
        if (audioBlob) {
            if (audioBlob.size > 25 * 1024 * 1024) {
                alert("Audio files greater than 25MB cannot be transcribed");
                return;
            }

            const formData = new FormData();
            formData.append("file", audioBlob);
            formData.append("model", "whisper-1");
            formData.append("language", "en");

            const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ""}`,
                },
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setTrascription(data.text)
        }
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
            {transcription ? <p>{transcription}</p> : <button onClick={transcribe}>Transcribe</button>}
            <button onClick={summarize}>Summarize</button>
            <button onClick={deleteItem}>Delete</button>
        </div>
    )
}