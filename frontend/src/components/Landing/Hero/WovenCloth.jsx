import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import swipitLogo from "@/assets/swipit-logo.png";

export function WovenCloth({ className = "" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    mesh: null,
    texture: null,
    raf: 0,
    running: false,
    mouse: { x: 0, y: 0, isHovered: false },
    t: 0,
  });

  const createClothTexture = useCallback((logoImage) => {
    const W = 1600;
    const H = 1140;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true });

    if (!ctx) return new THREE.CanvasTexture(c);

    const bgTop = "#f9f5eb";
    const bgMid = "#efe6d5";
    const bgBottom = "#e5d8c1";
    const borderCrimson = "#9e1e2a";
    const borderDeep = "#73161f";
    const accentOrange = "#d9480f";
    const primaryDark = "#181316";
    const secondaryMuted = "#6e5d59";

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, bgTop);
    g.addColorStop(0.5, bgMid);
    g.addColorStop(1, bgBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = borderCrimson;
    ctx.lineWidth = 14;
    ctx.strokeRect(52, 52, W - 104, H - 104);

    ctx.strokeStyle = borderDeep;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(78, 78, W - 156, H - 156);

    const eyelets = [
      [78, 78],
      [W - 78, 78],
      [78, H - 78],
      [W - 78, H - 78],
    ];
    eyelets.forEach(([cx, cy]) => {
      ctx.fillStyle = borderCrimson;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    const logoSize = 126;
    const logoY = 130;
    if (logoImage && logoImage.complete && logoImage.naturalWidth !== 0) {
      ctx.drawImage(logoImage, W / 2 - logoSize / 2, logoY, logoSize, logoSize);
    }

    const swipFont = '800 124px "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const itFont = 'bold 88px "Geist Mono", monospace';
    
    ctx.font = swipFont;
    const swipText = "Swip";
    const swipWidth = ctx.measureText(swipText).width;

    ctx.font = itFont;
    const itText = "IT";
    const itWidth = ctx.measureText(itText).width;

    const badgePadX = 24;
    const badgeHeight = 102;
    const badgeWidth = itWidth + badgePadX * 2;
    const gap = 16;

    const totalTitleWidth = swipWidth + gap + badgeWidth;
    const startX = W / 2 - totalTitleWidth / 2;
    const titleY = logoY + logoSize + 92;

    ctx.fillStyle = primaryDark;
    ctx.font = swipFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(swipText, startX, titleY);

    const badgeX = startX + swipWidth + gap;
    const badgeY = titleY - badgeHeight / 2;
    const badgeRadius = 16;

    ctx.fillStyle = "#111215";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeRadius);
    ctx.fill();

    ctx.fillStyle = "#f9f5eb";
    ctx.font = itFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(itText, badgeX + badgeWidth / 2, titleY);

    ctx.textAlign = "center";
    ctx.fillStyle = borderCrimson;
    ctx.font = '600 24px "Geist Mono", "Courier New", monospace';
    ctx.letterSpacing = "5px";
    ctx.fillText("— SMART CREDIT CARD COMPANION —", W / 2, logoY + logoSize + 176);

    ctx.strokeStyle = borderDeep;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 300, logoY + logoSize + 228);
    ctx.lineTo(W / 2 + 300, logoY + logoSize + 228);
    ctx.stroke();

    ctx.fillStyle = accentOrange;
    ctx.beginPath();
    ctx.arc(W / 2, logoY + logoSize + 228, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = secondaryMuted;
    ctx.font = '700 25px "Geist Mono", "Courier New", monospace';
    ctx.fillText("OPTIMAL SWIPE RECOMMENDATIONS  ·  MILESTONE TRACKER", W / 2, logoY + logoSize + 296);

    ctx.font = '600 22px "Geist Mono", "Courier New", monospace';
    ctx.fillStyle = primaryDark;
    ctx.fillText("AUTOMATED TRANSACTION SYNC  ·  PORTFOLIO TRACKER  ·  REWARD LEDGER", W / 2, logoY + logoSize + 354);

    ctx.font = '500 20px "Geist Mono", "Courier New", monospace';
    ctx.fillStyle = secondaryMuted;
    ctx.fillText("MAXIMIZE CASHBACKS, LOUNGE ACCESS & REWARD MULTIPLIERS", W / 2, logoY + logoSize + 410);

    const sealW = 380;
    const sealH = 60;
    const sealX = W / 2 - sealW / 2;
    const sealY = H - 168;
    ctx.strokeStyle = borderCrimson;
    ctx.lineWidth = 2;
    ctx.strokeRect(sealX, sealY, sealW, sealH);

    ctx.fillStyle = borderCrimson;
    ctx.font = 'bold 18px "Geist Mono", "Courier New", monospace';
    ctx.fillText("SMART CARD PORTFOLIO · 2026", W / 2, sealY + sealH / 2);

    ctx.globalAlpha = 0.85;
    for (let yy = 0; yy < H; yy += 4) {
      ctx.strokeStyle = "rgba(60, 30, 20, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yy + 0.5);
      ctx.lineTo(W, yy + 0.5);
      ctx.stroke();
    }
    for (let xx = 0; xx < W; xx += 4) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xx + 0.5, 0);
      ctx.lineTo(xx + 0.5, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    const id = ctx.getImageData(0, 0, W, H);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() * 2 - 1) * 10;
      d[i] = Math.min(255, Math.max(0, d[i] + n));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
    }
    ctx.putImageData(id, 0, 0);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const BW = 5.4;
    const BH = 3.9;
    const GX = 48;
    const GY = 36;
    const N = (GX + 1) * (GY + 1);

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geo = new THREE.PlaneGeometry(BW, BH, GX, GY);

    const logoImg = new Image();
    logoImg.src = swipitLogo;

    let clothTexture = createClothTexture(logoImg);
    const mat = new THREE.MeshPhongMaterial({
      map: clothTexture,
      side: THREE.DoubleSide,
      shininess: 10,
      specular: 0x33221a,
      color: 0xffffff,
    });

    logoImg.onload = () => {
      clothTexture.dispose();
      clothTexture = createClothTexture(logoImg);
      mat.map = clothTexture;
      mat.needsUpdate = true;
    };

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.82);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ee, 1.45);
    keyLight.position.set(-3.2, 3.8, 3.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9e1e2a, 0.55);
    rimLight.position.set(3.5, -1.8, 2.2);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xfef2e8, 0.35);
    fillLight.position.set(0, -3.0, 1.8);
    scene.add(fillLight);

    const pos = geo.attributes.position;
    const cur = new Float32Array(N * 3);
    const prev = new Float32Array(N * 3);
    const rest = new Float32Array(N * 3);
    const pinned = new Uint8Array(N);

    for (let i = 0; i < N; i++) {
      const ax = pos.getX(i);
      const ay = pos.getY(i);
      const az = 0;
      cur[i * 3] = prev[i * 3] = rest[i * 3] = ax;
      cur[i * 3 + 1] = prev[i * 3 + 1] = rest[i * 3 + 1] = ay;
      cur[i * 3 + 2] = prev[i * 3 + 2] = rest[i * 3 + 2] = az;
    }

    for (let ix = 0; ix <= GX; ix++) {
      pinned[ix] = 1;
    }

    const idx = (ix, iy) => ix + iy * (GX + 1);
    const restH = BW / GX;
    const restV = BH / GY;
    const restD = Math.sqrt(restH * restH + restV * restV);
    const GRAV = -3.2;
    const DAMP = 0.984;
    const DT = 0.016;

    function wind(ix, iy, t, mouseX, mouseY, isHovered) {
      const cx = ix / GX;
      const cy = iy / GY;
      const travel = t * 1.85 - cy * 3.9;
      const gust = 0.65 + 0.42 * Math.sin(t * 0.7) + 0.2 * Math.sin(t * 2.0 + 1.2);
      const amp = 4.2 * cy;

      let fz = (Math.sin(travel + cx * 3.4) + 0.45 * Math.sin(travel * 1.8 + cx * 6.2)) * amp * gust;
      let fx = Math.sin(t * 1.0 + cy * 2.4) * 0.55 * cy;
      let fy = -0.36 * cy;

      if (isHovered) {
        const clothX = (cx - 0.5) * BW;
        const clothY = (0.5 - cy) * BH;
        const dx = clothX - mouseX;
        const dy = clothY - mouseY;
        const distSq = dx * dx + dy * dy;
        const radius = 1.5;

        if (distSq < radius * radius) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / radius) * 2.2;
          fz += force * 1.7;
          fx += (dx / (dist + 0.01)) * force * 0.7;
          fy += (dy / (dist + 0.01)) * force * 0.7;
        }
      }

      return [fx, fy, fz];
    }

    function solve(a, b, rl) {
      const ax = cur[a * 3];
      const ay = cur[a * 3 + 1];
      const az = cur[a * 3 + 2];
      const bx = cur[b * 3];
      const by = cur[b * 3 + 1];
      const bz = cur[b * 3 + 2];
      let dx = bx - ax;
      let dy = by - ay;
      let dz = bz - az;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      const diff = ((d - rl) / d) * 0.5;
      dx *= diff;
      dy *= diff;
      dz *= diff;

      const pa = pinned[a];
      const pb = pinned[b];
      if (!pa && !pb) {
        cur[a * 3] += dx;
        cur[a * 3 + 1] += dy;
        cur[a * 3 + 2] += dz;
        cur[b * 3] -= dx;
        cur[b * 3 + 1] -= dy;
        cur[b * 3 + 2] -= dz;
      } else if (pa && !pb) {
        cur[b * 3] -= dx * 2;
        cur[b * 3 + 1] -= dy * 2;
        cur[b * 3 + 2] -= dz * 2;
      } else if (!pa && pb) {
        cur[a * 3] += dx * 2;
        cur[a * 3 + 1] += dy * 2;
        cur[a * 3 + 2] += dz * 2;
      }
    }

    function stepPhysics(t, mouseX, mouseY, isHovered) {
      for (let iy = 0; iy <= GY; iy++) {
        for (let ix = 0; ix <= GX; ix++) {
          const i = idx(ix, iy);
          if (pinned[i]) continue;
          const [fx, fy, fz] = wind(ix, iy, t, mouseX, mouseY, isHovered);
          for (let k = 0; k < 3; k++) {
            const j = i * 3 + k;
            const a = k === 0 ? fx : k === 1 ? fy + GRAV : fz;
            const v = (cur[j] - prev[j]) * DAMP;
            prev[j] = cur[j];
            cur[j] = cur[j] + v + a * DT * DT;
          }
        }
      }

      for (let it = 0; it < 4; it++) {
        for (let iy = 0; iy <= GY; iy++) {
          for (let ix = 0; ix < GX; ix++) {
            solve(idx(ix, iy), idx(ix + 1, iy), restH);
          }
        }
        for (let iy = 0; iy < GY; iy++) {
          for (let ix = 0; ix <= GX; ix++) {
            solve(idx(ix, iy), idx(ix, iy + 1), restV);
          }
        }
        for (let iy = 0; iy < GY; iy++) {
          for (let ix = 0; ix < GX; ix++) {
            solve(idx(ix, iy), idx(ix + 1, iy + 1), restD);
            solve(idx(ix + 1, iy), idx(ix, iy + 1), restD);
          }
        }
      }

      for (let ix = 0; ix <= GX; ix++) {
        const i = ix;
        const waveZ = Math.sin((ix / GX) * Math.PI * 2 + t * 0.8) * 0.035;
        cur[i * 3] = rest[i * 3];
        cur[i * 3 + 1] = rest[i * 3 + 1];
        cur[i * 3 + 2] = rest[i * 3 + 2] + waveZ;
        prev[i * 3] = rest[i * 3];
        prev[i * 3 + 1] = rest[i * 3 + 1];
        prev[i * 3 + 2] = rest[i * 3 + 2] + waveZ;
      }
    }

    function commitVertices() {
      for (let i = 0; i < N; i++) {
        pos.setXYZ(i, cur[i * 3], cur[i * 3 + 1], cur[i * 3 + 2]);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }

    let camera;
    function handleResize() {
      if (!container || !renderer) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 600;
      renderer.setSize(w, h, false);

      const aspect = w / h;
      camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);

      const vFit = BH / 2 / Math.tan((38 * Math.PI) / 360);
      const hFit = BW / 2 / Math.tan((38 * Math.PI) / 360) / aspect;
      camera.position.set(0, 0.01, Math.max(vFit, hFit) * 0.98 + 0.12);
      camera.lookAt(0, -0.02, 0);

      stateRef.current.camera = camera;
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    for (let s = 0; s < 45; s++) {
      stepPhysics(s * DT, 0, 0, false);
    }
    commitVertices();

    stateRef.current.renderer = renderer;
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.mesh = mesh;
    stateRef.current.texture = clothTexture;
    stateRef.current.t = 45 * DT;
    stateRef.current.running = true;

    function animate() {
      if (!stateRef.current.running) return;

      const state = stateRef.current;
      state.t += DT;

      const { x, y, isHovered } = state.mouse;
      let worldMouseX = 0;
      let worldMouseY = 0;
      if (isHovered && camera) {
        worldMouseX = x * (BW / 2);
        worldMouseY = y * (BH / 2);
      }

      stepPhysics(state.t, worldMouseX, worldMouseY, isHovered);
      commitVertices();

      if (camera) {
        camera.position.x = Math.sin(state.t * 0.16) * 0.1;
        camera.position.y = 0.01 + Math.sin(state.t * 0.2 + 1.1) * 0.04;
        camera.lookAt(0, -0.02, 0);
      }

      renderer.render(scene, camera);
      state.raf = requestAnimationFrame(animate);
    }

    if (reduceMotion) {
      for (let s = 0; s < 180; s++) stepPhysics(s * DT, 0, 0, false);
      commitVertices();
      renderer.render(scene, camera);
    } else {
      stateRef.current.raf = requestAnimationFrame(animate);
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stateRef.current.running = false;
        cancelAnimationFrame(stateRef.current.raf);
      } else {
        if (!stateRef.current.running && !reduceMotion) {
          stateRef.current.running = true;
          stateRef.current.raf = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stateRef.current.running = false;
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      clothTexture.dispose();
    };
  }, [createClothTexture]);

  const handlePointerMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

    stateRef.current.mouse.x = normX;
    stateRef.current.mouse.y = normY;
    stateRef.current.mouse.isHovered = true;
  };

  const handlePointerEnter = () => {
    stateRef.current.mouse.isHovered = true;
  };

  const handlePointerLeave = () => {
    stateRef.current.mouse.isHovered = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full h-[470px] sm:h-[530px] md:h-[580px] lg:h-[630px] flex items-center justify-center select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block filter drop-shadow-[0_20px_30px_rgba(26,18,21,0.14)] cursor-pointer"
      />
    </div>
  );
}

export default WovenCloth;
