"use client";

import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("./components/Hero3D"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-screen flex items-center justify-center bg-white">
			<div className="animate-pulse text-gray-400">Loading 3D...</div>
		</div>
	),
});

export default function Hero3DClient() {
	return <Hero3D />;
}
