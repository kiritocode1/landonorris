import { ImageResponse } from "next/og";

export const runtime = "edge" as const;

export const alt = "BLANKO NORRIS – cyberpunk cockpit interface" as const;

export const size = {
	width: 1200,
	height: 630,
} as const;

export const contentType = "image/png";

export default function OgImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "40px 60px",
					background: "radial-gradient(circle at 20% 0%, #ffffff 0, #f5f5f5 40%, #0a0a0a 100%)",
					color: "#000000",
					fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, sans-serif",
				}}
			>
				<header
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div style={{ lineHeight: 1.1 }}>
						<div
							style={{
								fontSize: 10,
								fontWeight: 600,
								letterSpacing: "0.32em",
								textTransform: "uppercase",
								color: "#737373",
							}}
						>
							BLANKO
						</div>
						<div
							style={{
								marginTop: 8,
								fontSize: 32,
								fontWeight: 600,
								letterSpacing: "0.32em",
								textTransform: "uppercase",
							}}
						>
							NORRIS
						</div>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-end",
							gap: 6,
							fontSize: 11,
							letterSpacing: "0.24em",
							textTransform: "uppercase",
							color: "#737373",
						}}
					>
						<div>Cyberpunk / サイバーパンク</div>
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								padding: "6px 10px",
								borderRadius: 999,
								backgroundColor: "rgba(0,0,0,0.85)",
								color: "#e5e5e5",
								fontSize: 10,
								letterSpacing: "0.18em",
							}}
						>
							Music:&nbsp;On
						</div>
					</div>
				</header>

				<section
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-end",
						gap: 40,
					}}
				>
					<div
						style={{
							maxWidth: 520,
							borderRadius: 0,
							border: "1px solid rgba(38,38,38,0.95)",
							backgroundColor: "rgba(0,0,0,0.86)",
							padding: 24,
							boxShadow: "0 0 60px rgba(0,0,0,0.9)",
							color: "#e5e5e5",
						}}
					>
						<div
							style={{
								fontFamily: "ui-monospace, SF Mono, Menlo, Monaco, Consolas",
								fontSize: 11,
								letterSpacing: "0.32em",
								textTransform: "uppercase",
								color: "#737373",
							}}
						>
							Signal over noise
						</div>
						<div
							style={{
								marginTop: 14,
								fontFamily: "ui-monospace, SF Mono, Menlo, Monaco, Consolas",
								fontSize: 13,
								lineHeight: 1.5,
							}}
						>
							Neon on concrete. A driver wired into the grid, chasing ghosts in the slipstream.
						</div>
						<div
							style={{
								marginTop: 12,
								fontSize: 12,
								lineHeight: 1.6,
								color: "#d4d4d4",
							}}
						>
							ネオンとコンクリート。静寂を切り裂く信号。ネットに接続されたドライバーが、残像だけを追いかけて走り続ける。
						</div>
						<div
							style={{
								marginTop: 18,
								fontSize: 10,
								letterSpacing: "0.24em",
								textTransform: "uppercase",
								color: "#737373",
							}}
						>
							Inspired by Lando Norris. Reimagined as a quieter, grittier interface for BLANKO NORRIS.
						</div>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-end",
							gap: 8,
							textAlign: "right",
							color: "#171717",
						}}
					>
						<div
							style={{
								fontSize: 11,
								letterSpacing: "0.28em",
								textTransform: "uppercase",
							}}
						>
							landonorris.com / reimagined
						</div>
						<div
							style={{
								height: 2,
								width: 160,
								background: "linear-gradient(90deg, rgba(23,23,23,0.1), rgba(23,23,23,0.7), rgba(23,23,23,0))",
							}}
						/>
					</div>
				</section>
			</div>
		),
		{
			...size,
		},
	);
}
