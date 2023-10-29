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
            console.log(audioData.id)
            const res2 = await fetch("supabase/update-transcription", {
                method: "POST",
                body: JSON.stringify({inputText: data.text, audioItemId: audioData.id})
            }).catch(console.error);

            console.log(res2)
        }
    } 

    const summarize = async () => {
        const temp_transcription = `Earth is currently experiencing a host of environmental problems. Air and water pollution continue to plague much of the world; exotic plants, animals, and other organisms pop up in parts of the globe that have no natural defense against them; and, all the while, climate change lingers in the headlines. It’s often difficult to find good environmental news, but environmentalists and scientists have reported one bright spot: the countries of the world rallying to combat the problem of ozone depletion. Earth’s protective ozone layer sits some 15 to 35 km [9 to 22 miles] above Earth’s surface, in the stratosphere. Stratospheric ozone loss is worrisome because the ozone layer effectively blocks certain types of ultraviolet (UV) radiation and other forms of radiation that could injure or kill most living things. For 30 years countries around the world had worked together to reduce and eliminate the use of chlorofluorocarbons (CFCs) and other ozone-destroying chemicals (ODCs). However, scientists still could not say whether these efforts were helping. Was the ozone layer actually healing itself? Before getting to the answer, it helps to have some background on the problem. In 1974 American chemists Mario Molina and F. Sherwood Rowland and Dutch chemist Paul Crutzen discovered that human-produced CFCs could be a major source of chlorine in the stratosphere. They also noted that chlorine could destroy extensive amounts of ozone after it was liberated from CFCs by UV radiation. Since then, scientists have tracked how the ozone layer has responded to CFCs, which, since their creation in 1928 had been used as refrigerants, cleaners, and propellants in hairsprays, spray paint, and aerosol containers. In 1985 a paper by the British Antarctic Survey revealed that stratospheric ozone concentrations over Antarctica had been dropping precipitously (by more than 60% compared with global averages) since the late 1970s. Throughout the 1980s and early 1990s, observations and measurements from satellites and other instruments showed that this “hole” over Antarctica was growing larger year after year, that a similar hole had opened over the Arctic, and that stratospheric ozone coverage worldwide had dropped 5% between 1970 and the mid-1990s, with little change afterward. In response to the growing problem, much of the world came together in 1987 to sign the Montreal Protocol on Substances That Deplete the Ozone Layer, an agreement that allowed the world to begin to phase out the manufacturing and use of CFCs—molecules containing only carbon, fluorine, and chlorine atoms—and other ODCs. Follow-up meetings throughout the 1990s and early 2000s produced amendments aimed at limiting, reducing, and eliminating hydrobromofluorocarbons (HBFCs), methyl bromide, carbon tetrachloride, trichloroethane, hydrofluorocarbons (HFCs), hydrochlorofluorocarbons (HCFCs), and other ODCs. Even though nearly all of the planet’s governments had been working diligently toward a common goal—good news in itself—it was unclear whether these unprecedented efforts were having much of an effect. In 2014, however, scientists received the first bit of good news on this topic: the first small increases in stratospheric ozone in more than 20 years had been detected, along with evidence that ODCs had declined by 10–15% in the atmosphere. Yet they remained cautious. Some two years later, scientists got sufficient data to confidently reveal proof that the ozone layer was indeed on a path to recovery. The 2016 study, which tracked the evolution of the size of the ozone hole over Antarctica, observed that stratospheric ozone concentrations were continuing to increase and that the size of the Antarctic ozone hole had declined by half the size of the continental U.S. between 2000 and 2015. They expected the ozone layer to fully heal sometime between 2040 and 2070. In 2023, a United Nations study brought these estimates into further focus. It found that if countries continued to adhere to the limits imposed by the Montreal Protocol and its follow-on agreements, the world could expect that ozone concentrations would largely return to their pre-1980 levels by 2040, with the Arctic reaching pre-1980 levels by 2045 and the Antarctic following suit by 2066.`
        if (temp_transcription) {
            const res = await fetch("openai/generate-summary", {
                method: "POST",
                body: JSON.stringify({inputText: temp_transcription, audioItemId: audioData.id})
            }).catch(console.error);

            console.log(res)
        }
    }

    const generate_embeddings = async () => {
        const temp_transcription = `Earth is currently experiencing a host of environmental problems. Air and water pollution continue to plague much of the world; exotic plants, animals, and other organisms pop up in parts of the globe that have no natural defense against them; and, all the while, climate change lingers in the headlines. It’s often difficult to find good environmental news, but environmentalists and scientists have reported one bright spot: the countries of the world rallying to combat the problem of ozone depletion. Earth’s protective ozone layer sits some 15 to 35 km [9 to 22 miles] above Earth’s surface, in the stratosphere. Stratospheric ozone loss is worrisome because the ozone layer effectively blocks certain types of ultraviolet (UV) radiation and other forms of radiation that could injure or kill most living things. For 30 years countries around the world had worked together to reduce and eliminate the use of chlorofluorocarbons (CFCs) and other ozone-destroying chemicals (ODCs). However, scientists still could not say whether these efforts were helping. Was the ozone layer actually healing itself? Before getting to the answer, it helps to have some background on the problem. In 1974 American chemists Mario Molina and F. Sherwood Rowland and Dutch chemist Paul Crutzen discovered that human-produced CFCs could be a major source of chlorine in the stratosphere. They also noted that chlorine could destroy extensive amounts of ozone after it was liberated from CFCs by UV radiation. Since then, scientists have tracked how the ozone layer has responded to CFCs, which, since their creation in 1928 had been used as refrigerants, cleaners, and propellants in hairsprays, spray paint, and aerosol containers. In 1985 a paper by the British Antarctic Survey revealed that stratospheric ozone concentrations over Antarctica had been dropping precipitously (by more than 60% compared with global averages) since the late 1970s. Throughout the 1980s and early 1990s, observations and measurements from satellites and other instruments showed that this “hole” over Antarctica was growing larger year after year, that a similar hole had opened over the Arctic, and that stratospheric ozone coverage worldwide had dropped 5% between 1970 and the mid-1990s, with little change afterward. In response to the growing problem, much of the world came together in 1987 to sign the Montreal Protocol on Substances That Deplete the Ozone Layer, an agreement that allowed the world to begin to phase out the manufacturing and use of CFCs—molecules containing only carbon, fluorine, and chlorine atoms—and other ODCs. Follow-up meetings throughout the 1990s and early 2000s produced amendments aimed at limiting, reducing, and eliminating hydrobromofluorocarbons (HBFCs), methyl bromide, carbon tetrachloride, trichloroethane, hydrofluorocarbons (HFCs), hydrochlorofluorocarbons (HCFCs), and other ODCs. Even though nearly all of the planet’s governments had been working diligently toward a common goal—good news in itself—it was unclear whether these unprecedented efforts were having much of an effect. In 2014, however, scientists received the first bit of good news on this topic: the first small increases in stratospheric ozone in more than 20 years had been detected, along with evidence that ODCs had declined by 10–15% in the atmosphere. Yet they remained cautious. Some two years later, scientists got sufficient data to confidently reveal proof that the ozone layer was indeed on a path to recovery. The 2016 study, which tracked the evolution of the size of the ozone hole over Antarctica, observed that stratospheric ozone concentrations were continuing to increase and that the size of the Antarctic ozone hole had declined by half the size of the continental U.S. between 2000 and 2015. They expected the ozone layer to fully heal sometime between 2040 and 2070. In 2023, a United Nations study brought these estimates into further focus. It found that if countries continued to adhere to the limits imposed by the Montreal Protocol and its follow-on agreements, the world could expect that ozone concentrations would largely return to their pre-1980 levels by 2040, with the Arctic reaching pre-1980 levels by 2045 and the Antarctic following suit by 2066.`
        if (temp_transcription) {
            const res = await fetch("openai/generate-embeddings", {
                method: "POST",
                body: JSON.stringify({inputText: temp_transcription, audioItemId: audioData.id})
            }).catch(console.error);

            console.log(res)
        }
    }

    const deleteItem = async () => {

    }

    return(
        <div>
            {audioUrl ? <div className="audio-player">
                <audio src={audioUrl} controls></audio>
            </div> : <h1>This item does not have an audio file associated. Please delete!</h1>}
            <div>
                {transcription ? <p>{transcription}</p> : <button onClick={transcribe}>Transcribe</button>}
                <button onClick={summarize}>Summarize</button>
                <button onClick={deleteItem}>Delete</button>
                <button onClick={generate_embeddings}>Generate Embeddings</button>
            </div>
        </div>
    )
}