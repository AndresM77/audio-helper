"use client"
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

const AudioRecorder = () => {

	const mediaRecorder = useRef<MediaRecorder | null>(null);

	const [recordingStatus, setRecordingStatus] = useState("inactive");

	const [audio, setAudio] = useState<string | null>(null);

	const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);

	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

	const router = useRouter();

	const startRecording = async () => {
		if (!("MediaRecorder"  in window)) {
			alert("The MediaRecorder API is not supported in your browser.");
		}

		let stream : MediaStream | null = null

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: false,
			});
		} catch (err: any) {
			alert(err.message);
		}

		if (!stream) {
            throw new Error("Audio was not recorded.");
        }

		setRecordingStatus("recording");

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
		setRecordingStatus("recorded");
		mediaRecorder.current.stop();

		mediaRecorder.current.onstop = async() => {
			const tempAudioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
			const audioUrl = URL.createObjectURL(tempAudioBlob);
			setAudio(audioUrl);
			setAudioBlob(tempAudioBlob);
			setAudioChunks([]);
			router.refresh();
		};
	};

	const uploadAudio = async () => {
		if (!audioBlob) {
			throw new Error("Audio was not recorded.")
		}
		const formData = new FormData();
  		formData.append("file", audioBlob);
		await fetch("supabase/upload-audio", {
          method: "POST",
          body: formData,
        });
		setRecordingStatus("inactive");
		setAudio(null);
		setAudioBlob(null);
	}

	const deleteAudio = async () => {
		setRecordingStatus("inactive");
		setAudio(null);
		setAudioBlob(null);
	}

	return (
		<div>
			<div className="w-full">
				<div className="flex items-center w-full flex-col gap-7">
					{recordingStatus === "recording" ? (
						// Button for stopping recording
						<button
							onClick={stopRecording}
							className="mt-10 m-auto flex items-center justify-center bg-red-400 hover:bg-red-500 rounded-full w-20 h-20 focus:outline-none animate-pulse">
							<svg
								className="h-12 w-12 "
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
							</svg>
						</button>
					) : null}
					{recordingStatus === "recorded" ? (
						// Buttons for uploading and deleting audio
						<div className="flex items-center justify-center flex-row gap-10">
							<button
								onClick={uploadAudio}
								className="mt-10 m-auto flex items-center justify-center bg-blue-400 hover:bg-blue-500 rounded-full w-20 h-20 focus:outline-none">
								<svg 
									className="h-12 w-12 " 
									viewBox="0 0 24 24" 
									xmlns="http://www.w3.org/2000/svg">
									<path fill="#ffffff" d="M21 7v12q0 .825-.588 1.413T19 21H5q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h12l4 4Zm-9 11q1.25 0 2.125-.875T15 15q0-1.25-.875-2.125T12 12q-1.25 0-2.125.875T9 15q0 1.25.875 2.125T12 18Zm-6-8h9V6H6v4Z"/>
								</svg>
							</button>

							<button
								onClick={deleteAudio}
								className="mt-10 m-auto flex items-center justify-center bg-blue-400 hover:bg-blue-500 rounded-full w-20 h-20 focus:outline-none">
									<svg 
										className="h-12 w-12"
										viewBox="0 0 12 12"
										xmlns="http://www.w3.org/2000/svg">
										<path fill="#ffffff" d="M2.22 2.22a.749.749 0 0 1 1.06 0L6 4.939L8.72 2.22a.749.749 0 1 1 1.06 1.06L7.061 6L9.78 8.72a.749.749 0 1 1-1.06 1.06L6 7.061L3.28 9.78a.749.749 0 1 1-1.06-1.06L4.939 6L2.22 3.28a.749.749 0 0 1 0-1.06Z"/>
									</svg>
							</button>
						</div>
						
					) : null}
					{recordingStatus === "inactive" ? (
						// Button for starting recording
						<button
						onClick={startRecording}
						className="mt-10 m-auto flex items-center justify-center bg-blue-400 hover:bg-blue-500 rounded-full w-20 h-20 focus:outline-none">
							<svg
								viewBox="0 0 256 256"
								xmlns="http://www.w3.org/2000/svg"
								className="w-10 h-10 text-white">
								<path
									fill="currentColor" // Change fill color to the desired color
									d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"/>
							</svg>
						</button>
					) : null}
					{audio ? (
						<div className="audio-player">
							<audio src={audio} controls></audio>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default AudioRecorder;