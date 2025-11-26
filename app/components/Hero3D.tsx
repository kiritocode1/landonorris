"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, RootState } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// ============================================
// BLOB SHADER MATERIAL (Feedback Loop)
// ============================================
class BlobMaterial extends THREE.MeshBasicMaterial {
	private _uniforms: {
		dTime: { value: number };
		aspect: { value: number };
		pointer: { value: THREE.Vector2 };
		pointerDown: { value: number };
		pointerRadius: { value: number };
		pointerDuration: { value: number };
		fbTexture: { value: THREE.Texture | null };
	};
	declare defines: Record<string, unknown> | undefined;

	constructor() {
		super({ color: 0x000000 });
		this._uniforms = {
			dTime: { value: 0 },
			aspect: { value: 1 },
			pointer: { value: new THREE.Vector2(10, 10) },
			pointerDown: { value: 1 },
			pointerRadius: { value: 0.375 },
			pointerDuration: { value: 2.5 },
			fbTexture: { value: null },
		};
		this.defines = { USE_UV: "" };
	}

	get uniforms() {
		return this._uniforms;
	}

	onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms) {
		shader.uniforms.dTime = this._uniforms.dTime;
		shader.uniforms.aspect = this._uniforms.aspect;
		shader.uniforms.pointer = this._uniforms.pointer;
		shader.uniforms.pointerDown = this._uniforms.pointerDown;
		shader.uniforms.pointerRadius = this._uniforms.pointerRadius;
		shader.uniforms.pointerDuration = this._uniforms.pointerDuration;
		shader.uniforms.fbTexture = this._uniforms.fbTexture;

		shader.fragmentShader = `
      uniform float dTime;
      uniform float aspect;
      uniform vec2 pointer;
      uniform float pointerDown;
      uniform float pointerRadius;
      uniform float pointerDuration;
      uniform sampler2D fbTexture;
      
      ${shader.fragmentShader}
    `.replace(
			`#include <color_fragment>`,
			`#include <color_fragment>
      
      float duration = pointerDuration;
      
      float rVal = texture2D(fbTexture, vUv).r;
      
      rVal -= clamp(dTime / duration, 0., 0.1);
      rVal = clamp(rVal, 0., 1.);
      
      float f = 0.;
      if (pointerDown > 0.5){
        vec2 uv = (vUv - 0.5) * 2. * vec2(aspect, 1.);
        vec2 mouse = pointer * vec2(aspect, 1);
        
        f = 1. - smoothstep(pointerRadius * 0.1, pointerRadius, distance(uv, mouse));
      }
      rVal += f * 0.1;
      rVal = clamp(rVal, 0., 1.);
      diffuseColor.rgb = vec3(rVal);
      `,
		);
	}
}

// ============================================
// HELMET MATERIAL (Masked by Blob)
// ============================================
function createHelmetMaterial(originalMaterial: THREE.MeshStandardMaterial, blobTexture: THREE.Texture): THREE.MeshStandardMaterial {
	const mat = originalMaterial.clone();

	mat.onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
		shader.uniforms.texBlob = { value: blobTexture };

		shader.vertexShader = `
      varying vec4 vPosProj;
      ${shader.vertexShader}
    `.replace(
			`#include <project_vertex>`,
			`#include <project_vertex>
        vPosProj = gl_Position;
      `,
		);

		shader.fragmentShader = `
      uniform sampler2D texBlob;
      varying vec4 vPosProj;
      ${shader.fragmentShader}
    `.replace(
			`#include <clipping_planes_fragment>`,
			`
      vec2 blobUV = ((vPosProj.xy / vPosProj.w) + 1.) * 0.5;
      vec4 blobData = texture(texBlob, blobUV);
      if (blobData.r < 0.01) discard;
      
      #include <clipping_planes_fragment>
      `,
		);
	};

	return mat;
}

// ============================================
// WIREFRAME MATERIAL (Animated Scanlines)
// ============================================
class WireframeMaterial extends THREE.MeshBasicMaterial {
	private _time: { value: number };

	constructor() {
		super({
			color: 0x000000,
			wireframe: true,
			transparent: true,
			opacity: 0.25,
		});
		this._time = { value: 0 };
	}

	get time() {
		return this._time;
	}

	onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms) {
		shader.uniforms.time = this._time;

		shader.vertexShader = `
      varying float vYVal;
      ${shader.vertexShader}
    `.replace(
			`#include <begin_vertex>`,
			`#include <begin_vertex>
        vYVal = position.y;
      `,
		);

		shader.fragmentShader = `
      uniform float time;
      varying float vYVal;
      ${shader.fragmentShader}
    `.replace(
			`#include <color_fragment>`,
			`#include <color_fragment>
      
        float y = fract(vYVal * 0.25 + time * 0.5);
        float fY = smoothstep(0., 0.01, y) - smoothstep(0.02, 0.1, y);
        
        diffuseColor.a *= fY * 0.9 + 0.1;
      `,
		);
	}
}

// ============================================
// BLOB RENDER SYSTEM
// ============================================
interface BlobSystemProps {
	onTextureReady: (texture: THREE.Texture) => void;
}

function BlobSystem({ onTextureReady }: BlobSystemProps) {
	const { gl, size } = useThree();
	const materialRef = useRef<BlobMaterial | null>(null);
	const rtRef = useRef<THREE.WebGLRenderTarget | null>(null);
	const fbTextureRef = useRef<THREE.FramebufferTexture | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.Camera | null>(null);
	const pointerRef = useRef(new THREE.Vector2(10, 10));
	const initializedRef = useRef(false);

	useEffect(() => {
		if (initializedRef.current) return;
		initializedRef.current = true;

		// Create render target
		rtRef.current = new THREE.WebGLRenderTarget(size.width, size.height);
		fbTextureRef.current = new THREE.FramebufferTexture(size.width, size.height);

		// Create blob material
		materialRef.current = new BlobMaterial();
		materialRef.current.uniforms.fbTexture.value = fbTextureRef.current;
		materialRef.current.uniforms.aspect.value = size.width / size.height;

		// Create scene for blob rendering
		sceneRef.current = new THREE.Scene();
		const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), materialRef.current);
		sceneRef.current.add(plane);
		cameraRef.current = new THREE.Camera();

		// Notify parent of texture
		onTextureReady(rtRef.current.texture);

		// Pointer events
		const handlePointerMove = (e: PointerEvent) => {
			pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
			pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
		};

		const handlePointerLeave = () => {
			pointerRef.current.set(10, 10);
		};

		window.addEventListener("pointermove", handlePointerMove);
		gl.domElement.addEventListener("pointerleave", handlePointerLeave);

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			gl.domElement.removeEventListener("pointerleave", handlePointerLeave);
			rtRef.current?.dispose();
			fbTextureRef.current?.dispose();
			if (materialRef.current) {
				(materialRef.current as THREE.Material).dispose();
			}
		};
	}, [gl, onTextureReady, size.height, size.width]);

	// Handle resize
	useEffect(() => {
		if (rtRef.current && fbTextureRef.current && materialRef.current) {
			rtRef.current.setSize(size.width, size.height);
			fbTextureRef.current = new THREE.FramebufferTexture(size.width, size.height);
			materialRef.current.uniforms.fbTexture.value = fbTextureRef.current;
			materialRef.current.uniforms.aspect.value = size.width / size.height;
		}
	}, [size]);

	useFrame((_state: RootState, delta: number) => {
		if (!materialRef.current || !rtRef.current || !fbTextureRef.current || !sceneRef.current || !cameraRef.current) return;

		// Update uniforms
		materialRef.current.uniforms.dTime.value = delta;
		materialRef.current.uniforms.pointer.value.copy(pointerRef.current);

		// Render blob to RT
		gl.setRenderTarget(rtRef.current);
		gl.render(sceneRef.current, cameraRef.current);
		gl.copyFramebufferToTexture(fbTextureRef.current);
		gl.setRenderTarget(null);
	});

	return null;
}

// ============================================
// HEAD MODEL
// ============================================
function HeadModel() {
	const { scene } = useGLTF("https://threejs.org/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb");

	useEffect(() => {
		scene.traverse((child: THREE.Object3D) => {
			if (child instanceof THREE.Mesh) {
				child.geometry.rotateY(Math.PI * 0.01);
				child.material = new THREE.MeshMatcapMaterial({ color: 0xffffff });
			}
		});
	}, [scene]);

	return <primitive object={scene} />;
}

// ============================================
// HELMET MODEL
// ============================================
interface HelmetModelProps {
	blobTexture: THREE.Texture | null;
}

function HelmetModel({ blobTexture }: HelmetModelProps) {
	const { scene } = useGLTF("https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf");

	const helmetScene = useMemo(() => {
		if (!blobTexture) return null;

		const clonedScene = scene.clone(true);
		clonedScene.traverse((child: THREE.Object3D) => {
			if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
				child.material = createHelmetMaterial(child.material, blobTexture);
			}
		});
		return clonedScene;
	}, [scene, blobTexture]);

	if (!helmetScene || !blobTexture) return null;

	return (
		<primitive
			object={helmetScene}
			scale={3.5}
			position={[0, 1.5, 0.75]}
		/>
	);
}

// ============================================
// HELMET WIREFRAME
// ============================================
function HelmetWireframe() {
	const { scene } = useGLTF("https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf");
	const [wireframeMesh, setWireframeMesh] = useState<THREE.Mesh | null>(null);
	const materialRef = useRef<WireframeMaterial | null>(null);

	useEffect(() => {
		const mat = new WireframeMaterial();
		materialRef.current = mat;

		scene.traverse((child: THREE.Object3D) => {
			if (child instanceof THREE.Mesh) {
				const geo = child.geometry.clone();
				geo.rotateX(Math.PI * 0.5);

				const mesh = new THREE.Mesh(geo, mat);
				mesh.scale.setScalar(3.5);
				mesh.position.set(0, 1.5, 0.75);
				setWireframeMesh(mesh);
			}
		});
	}, [scene]);

	useFrame((state: RootState) => {
		if (materialRef.current) {
			materialRef.current.time.value = state.clock.elapsedTime;
		}
	});

	if (!wireframeMesh) return null;

	return <primitive object={wireframeMesh} />;
}

// ============================================
// MAIN SCENE
// ============================================
function Scene() {
	const [blobTexture, setBlobTexture] = useState<THREE.Texture | null>(null);
	const camShift = useMemo(() => new THREE.Vector3(0, 1, 0), []);

	const handleTextureReady = useCallback((texture: THREE.Texture) => {
		setBlobTexture(texture);
	}, []);

	return (
		<>
			<BlobSystem onTextureReady={handleTextureReady} />
			<ambientLight
				intensity={Math.PI}
				color={0xffffff}
			/>
			<HeadModel />
			<HelmetModel blobTexture={blobTexture} />
			<HelmetWireframe />
			<OrbitControls
				enableDamping
				target={camShift}
			/>
		</>
	);
}

// ============================================
// HERO COMPONENT
// ============================================
export default function Hero3D() {
	const camShift = useMemo(() => new THREE.Vector3(0, 1, 0), []);

	return (
		<div className="w-full h-screen">
			<Canvas
				camera={{
					fov: 30,
					near: 1,
					far: 100,
					position: [(-1 * 15) / Math.sqrt(1), 1, 0],
				}}
				gl={{ antialias: true }}
				onCreated={({ camera }: { camera: THREE.Camera }) => {
					camera.position.setLength(15);
					camera.position.add(camShift);
				}}
			>
				<color
					attach="background"
					args={[0xffffff]}
				/>
				<Scene />
			</Canvas>
		</div>
	);
}

// Preload models
useGLTF.preload("https://threejs.org/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb");
useGLTF.preload("https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf");
