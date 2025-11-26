import Hero3DClient from "./Hero3DClient";
import MusicControl from "./components/MusicControl";

export default function Home() {
	return (
		<main className="relative w-full h-screen overflow-hidden bg-[#f5f5f5] text-black">
			{/* 3D hero layer */}
			<div className="absolute inset-0">
				<Hero3DClient />
			</div>

			{/* UI overlay inspired by Lando Norris */}
			<div className="pointer-events-none relative z-10 flex h-full flex-col">
				<header className="pointer-events-auto flex items-center justify-between px-8 pt-6">
					<div className="leading-none">
						<p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-500">BLANKO</p>
						<p className="mt-1 text-2xl font-semibold uppercase tracking-[0.32em]">NORRIS</p>
					</div>
					<div className="flex flex-col items-end gap-1">
						<div className="text-[0.6rem] uppercase tracking-[0.28em] text-neutral-500">
							made by{" "}
							<a
								href="https://aryank.space"
								target="_blank"
								rel="noreferrer"
								className="underline underline-offset-4"
							>
								aryank.space
							</a>
						</div>
						<MusicControl />
					</div>
				</header>

				<section className="pointer-events-none flex flex-1 items-end justify-between px-8 pb-10">
					<div className="pointer-events-auto max-w-md border border-neutral-800 bg-black/80 p-5 text-xs leading-relaxed text-neutral-200 shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur">
						<p className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-neutral-500">Cyberpunk / サイバーパンク</p>
						<p className="mt-3 font-mono text-[0.7rem] leading-relaxed">Neon on concrete. Signal over noise. A driver wired into the grid, chasing ghosts in the slipstream.</p>
						<p className="mt-3 text-[0.7rem] leading-relaxed text-neutral-300">
							ネオンとコンクリート。静寂を切り裂く信号。ネットに接続されたドライバーが、残像だけを追いかけて走り続ける。
						</p>
						<p className="mt-4 text-[0.6rem] uppercase tracking-[0.24em] text-neutral-500">
							Inspired by{" "}
							<a
								href="https://landonorris.com/?trk=public_post_main-feed-card-text"
								target="_blank"
								rel="noreferrer"
								className="underline underline-offset-4"
							>
								Lando Norris
							</a>
							, reimagined as a quieter, grittier interface for BLANKO NORRIS.
						</p>
					</div>
					<audio
						id="blanko-music-player"
						src="/music.mp3"
						autoPlay
					/>
				</section>
			</div>
		</main>
	);
}
