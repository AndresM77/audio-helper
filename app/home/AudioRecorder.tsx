"use client"
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

const AudioRecorder = () => {
	const [permission, setPermission] = useState(false);

	const mediaRecorder = useRef<MediaRecorder | null>(null);

	const [recordingStatus, setRecordingStatus] = useState("inactive");

	const [stream, setStream] = useState<MediaStream | null>(null);

	const [audio, setAudio] = useState<string | null>(null);

	const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);

    const [transcription, setTranscription] = useState<string | null>(null)

	const router = useRouter();

	const getMicrophonePermission = async () => {
		if ("MediaRecorder" in window) {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					audio: true,
					video: false,
				});
				setPermission(true);
				setStream(mediaStream);
			} catch (err: any) {
				alert(err.message);
			}
		} else {
			alert("The MediaRecorder API is not supported in your browser.");
		}
	};

	const startRecording = async () => {
		setRecordingStatus("recording");
        if (!stream) {
            throw new Error("Audio was not recorded.")
        }
		const media = new MediaRecorder(stream);

		mediaRecorder.current = media;

		mediaRecorder.current.start();

		let localAudioChunks : BlobPart[] = [];

		mediaRecorder.current.ondataavailable = (event) => {
			if (typeof event.data === "undefined") return;
			if (event.data.size === 0) return;
			localAudioChunks.push(event.data);
		};

		setAudioChunks(localAudioChunks);
	};

	const stopRecording = async() => {
        if (!mediaRecorder.current) {
            throw new Error("Media Recorder was not set")
        }
		setRecordingStatus("inactive");
		mediaRecorder.current.stop();

		mediaRecorder.current.onstop = async() => {
			const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
			const audioUrl = URL.createObjectURL(audioBlob);
			setAudio(audioUrl);
			await uploadAudio(audioBlob);
			setAudioChunks([]);
			router.refresh();
		};
	};

	const uploadAudio = async (audioBlob: Blob) => {
		const formData = new FormData();
  		formData.append("file", audioBlob);
		await fetch("supabase/upload-audio", {
          method: "POST",
          body: formData,
        });
	}

	return (
		<div>
			<h2>Audio Recorder</h2>
			<main>
				<div className="audio-controls">
					{!permission ? (
						<button onClick={getMicrophonePermission} type="button">
							Get Microphone
						</button>
					) : null}
					{permission && recordingStatus === "inactive" ? (
						<button onClick={startRecording} type="button">
							Start Recording
						</button>
					) : null}
					{recordingStatus === "recording" ? (
						<button onClick={stopRecording} type="button">
							Stop Recording
						</button>
					) : null}
				</div>
				{audio ? (
					<div className="audio-player">
						<audio src={audio} controls></audio>
						<a download href={audio}>
							Download Recording
						</a>
					</div>
				) : null}
                {transcription ? (
                    <p>{transcription}</p>
                ) : null}
			</main>
		</div>
	);
};

export default AudioRecorder;