"use client";

import { useEffect, useState } from "react";

export default function MusicControl() {
	const [isPlaying, setIsPlaying] = useState<boolean>(true);
	const [hasStarted, setHasStarted] = useState<boolean>(false);

	useEffect(() => {
		const audio = document.getElementById("blanko-music-player") as HTMLAudioElement | null;
		if (!audio) return;

		// Lower volume ~30%
		audio.volume = 0.7;

		// Try to start playback on mount (may be blocked by browser autoplay policy)
		if (audio.paused) {
			void audio.play().catch(() => {
				// ignore autoplay block; user can start via click
			});
		}

		const handlePlay = (): void => {
			setIsPlaying(true);
			setHasStarted(true);
		};

		const handlePause = (): void => {
			setIsPlaying(false);
		};

		const handleEnded = (): void => {
			setIsPlaying(false);
		};

		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);
		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
			audio.removeEventListener("ended", handleEnded);
		};
	}, []);

	const handleToggle = (): void => {
		const audio = document.getElementById("blanko-music-player") as HTMLAudioElement | null;
		if (!audio) return;
		if (audio.paused) {
			setHasStarted(true);
			void audio.play().catch(() => {
				// if play fails, keep state consistent with actual audio element
				if (audio.paused) {
					setIsPlaying(false);
				}
			});
		} else {
			audio.pause();
		}
	};

	return (
		<button
			type="button"
			onClick={handleToggle}
			className="pointer-events-auto flex items-center rounded-full border border-neutral-800 bg-black/80 px-3 py-1 text-[0.6rem] shadow-[0_0_20px_rgba(0,0,0,0.9)] backdrop-blur"
			aria-label="Toggle music"
		>
			<span className="font-mono uppercase tracking-[0.24em] text-neutral-500">
				Music: <span className={isPlaying ? "text-white" : "text-neutral-700"}>{isPlaying || hasStarted ? "On" : "Off"}</span>
			</span>
		</button>
	);
}
