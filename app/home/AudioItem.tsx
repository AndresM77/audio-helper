"use client"

import { AudioData } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { Accordion } from "./Accordion";
import Modal from "./Modal";

export default function AudioItem({audioData}: {audioData: AudioData}) {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const router = useRouter();

    useEffect(() => {
        console.log(audioData)
        const fetchData = async () => {
            const res = await fetch(`supabase/get-audio-file?audioFileId=${audioData.audio_file_id}`, {
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
        console.log(audioData)
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
            const res2 = await fetch("supabase/update-transcription", {
                method: "POST",
                body: JSON.stringify({inputText: data.text, audioItemId: audioData.id})
            }).catch(console.error);

            router.refresh();
        }
    } 

    const summarize = async () => {
        if (audioData.transcript) {
            const res = await fetch("openai/generate-summary", {
                method: "POST",
                body: JSON.stringify({inputText: audioData.transcript, audioItemId: audioData.id})
            }).catch(console.error);

            router.refresh();
        }
    }

    const generate_embeddings = async () => {
        if (audioData.embeddings) {
            console.log("Regenerating embeddings")
        }

        if (audioData.transcript) {
            const res = await fetch("openai/generate-embeddings", {
                method: "POST",
                body: JSON.stringify({inputText: audioData.transcript, audioItemId: audioData.id})
            }).catch(console.error);

            router.refresh();
        }
    }

    const deleteItem = async () => {
        const res = await fetch("supabase/delete-audio-item", {
            method: "POST",
            body: JSON.stringify({audioItemId: audioData.id})
        }).catch(console.error);

        router.refresh();
    }

    return(
        <div>
            {audioUrl ?
            <div className="block max-w-lg min-w-lg p-6 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700">
                <Accordion
                    title={
                        <div className="audio-player">
                            <audio src={audioUrl} controls></audio>
                        </div>
                    } 
                    content={
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-xl base:text-xl items-center justify-center !leading-tight font-bold">{audioData.heading}</p>
                            <div className="flex flex-col gap-2 justify-start">
                                {audioData.transcript && audioData.summary && 
                                    <Accordion title={"Summary"} created_at={null}
                                        content={<p>{audioData.summary}</p>}/>}
                                {audioData.transcript ? 
                                    <Accordion title={"Transcript"} created_at={null}
                                        content={<p>{audioData.transcript}</p>}/>: 
                                    <button className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" onClick={transcribe}>Transcribe</button>}
                                {audioData.transcript && !audioData.summary && <button className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" onClick={summarize}>Summarize</button>}
                                {audioData.transcript && audioData.summary && !audioData.embeddings && <button className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" onClick={generate_embeddings}>Enable Search</button>}
                                <div className="flex flex-col gap-2 items-center justify-center">
                                    {audioData.transcript && audioData.summary && audioData.embeddings ? <Modal audioData={audioData}/> : null}
                                    <button className="text-red-500 active:bg-red-600 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" onClick={deleteItem}>Delete</button>
                                </div>
                                
                            </div>
                        </div>
                    }
                    created_at={audioData.created_at}
                />
            </div>: 
            <div role="status">
                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>}
        </div>
    )
}