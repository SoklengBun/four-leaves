<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

type ParticleKind = 'sakura' | 'snow' | 'leaf' | 'rain';
type OverlayMode = ParticleKind | 'mixed';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  sway: number;
  swaySpeed: number;
  kind: ParticleKind;
  opacity: number;
}

interface LightningPoint {
  x: number;
  y: number;
}

const props = withDefaults(
  defineProps<{
    mode?: OverlayMode;
    density?: number;
  }>(),
  {
    mode: 'mixed',
    density: 1,
  },
);

const canvasRef = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let rafId = 0;
let lastFrameTime = 0;
let width = 0;
let height = 0;
let dpr = 1;
let isReducedMotion = false;
const TARGET_FRAME_MS = 1000 / 60;
let thunderFlashAlpha = 0;
let thunderVisibleUntil = 0;
let thunderNextAt = 0;
let lightningPath: LightningPoint[] = [];

const scheduleNextThunder = (now: number) => {
  thunderNextAt = now + 2500 + Math.random() * 5500;
};

const createLightningPath = () => {
  const startX = width * (0.2 + Math.random() * 0.6);
  const segmentCount = 7 + Math.floor(Math.random() * 5);
  const path: LightningPoint[] = [{ x: startX, y: -12 }];

  let currentX = startX;
  let currentY = -12;

  for (let i = 0; i < segmentCount; i += 1) {
    currentX += -30 + Math.random() * 60;
    currentY += 28 + Math.random() * 40;
    path.push({ x: currentX, y: currentY });
  }

  lightningPath = path;
};

const maybeTriggerThunder = (now: number) => {
  if (props.mode !== 'rain') return;
  if (now < thunderNextAt) return;

  createLightningPath();
  thunderFlashAlpha = 0.2 + Math.random() * 0.25;
  thunderVisibleUntil = now + 70 + Math.random() * 90;
  scheduleNextThunder(now);
};

const drawThunder = (now: number) => {
  if (!ctx) return;
  if (!lightningPath.length) return;

  const isBoltVisible = now <= thunderVisibleUntil;
  if (!isBoltVisible) {
    thunderFlashAlpha *= 0.84;
    if (thunderFlashAlpha < 0.01) {
      thunderFlashAlpha = 0;
      lightningPath = [];
      return;
    }
  }

  if (thunderFlashAlpha > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(220, 235, 255, ${Math.min(0.3, thunderFlashAlpha)})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (isBoltVisible) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#f3fbff';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lightningPath[0].x, lightningPath[0].y);
    for (let i = 1; i < lightningPath.length; i += 1) {
      ctx.lineTo(lightningPath[i].x, lightningPath[i].y);
    }
    ctx.stroke();

    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#9ed1ff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(lightningPath[0].x, lightningPath[0].y);
    for (let i = 1; i < lightningPath.length; i += 1) {
      ctx.lineTo(lightningPath[i].x, lightningPath[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }
};

const pickKind = (): ParticleKind => {
  if (props.mode !== 'mixed') return props.mode;
  const r = Math.random();
  if (r < 0.22) return 'sakura';
  if (r < 0.44) return 'snow';
  if (r < 0.66) return 'leaf';
  return 'rain';
};

const resetParticle = (particle: Particle, initial = false) => {
  const kind = pickKind();
  particle.kind = kind;

  if (kind === 'snow') {
    particle.size = 1.5 + Math.random() * 2.5;
    particle.vy = 0.35 + Math.random() * 0.75;
    particle.vx = -0.2 + Math.random() * 0.4;
    particle.opacity = 0.7 + Math.random() * 0.3;
  } else if (kind === 'sakura') {
    particle.size = 4 + Math.random() * 3;
    particle.vy = 0.55 + Math.random() * 0.85;
    particle.vx = -0.35 + Math.random() * 0.7;
    particle.opacity = 0.65 + Math.random() * 0.35;
  } else if (kind === 'rain') {
    particle.size = 14 + Math.random() * 14;
    particle.vy = 7 + Math.random() * 4;
    particle.vx = -2.6 + Math.random() * 1.1;
    particle.opacity = 0.35 + Math.random() * 0.35;
  } else {
    particle.size = 3.5 + Math.random() * 4;
    particle.vy = 0.75 + Math.random() * 1.2;
    particle.vx = -0.45 + Math.random() * 0.9;
    particle.opacity = 0.55 + Math.random() * 0.35;
  }

  particle.spin = -0.03 + Math.random() * 0.06;
  particle.sway = Math.random() * Math.PI * 2;
  particle.swaySpeed = 0.01 + Math.random() * 0.03;
  particle.angle = Math.random() * Math.PI * 2;

  particle.x = Math.random() * width;
  particle.y = initial ? Math.random() * height : -20 - Math.random() * 40;
};

const calculateParticleCount = () => {
  const area = width * height;
  const baseCount = Math.round((area / 18000) * props.density);
  const memory = typeof navigator !== 'undefined' ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) : 4;
  const cpu = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 4) : 4;
  const budgetScale = memory <= 2 || cpu <= 4 ? 0.65 : 1;
  const rainScale = props.mode === 'rain' ? 1.55 : 1;

  return Math.max(20, Math.min(140, Math.round(baseCount * budgetScale * rainScale)));
};

const setupCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const targetCount = calculateParticleCount();
  particles = Array.from({ length: targetCount }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 0,
    angle: 0,
    spin: 0,
    sway: 0,
    swaySpeed: 0,
    kind: 'snow',
    opacity: 1,
  }));

  particles.forEach((particle) => resetParticle(particle, true));

  const now = performance.now();
  scheduleNextThunder(now);
  thunderFlashAlpha = 0;
  lightningPath = [];
};

const drawParticle = (particle: Particle) => {
  if (!ctx) return;

  if (particle.kind === 'rain') {
    const tailX = -particle.vx * 2.6;
    const tailY = -particle.vy * 1.6;
    const gradient = ctx.createLinearGradient(particle.x + tailX, particle.y + tailY, particle.x, particle.y);
    gradient.addColorStop(0, 'rgba(168, 206, 255, 0)');
    gradient.addColorStop(1, `rgba(168, 206, 255, ${Math.min(0.8, particle.opacity + 0.2)})`);

    ctx.save();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(particle.x + tailX, particle.y + tailY);
    ctx.lineTo(particle.x, particle.y);
    ctx.stroke();

    if (particle.y > height - 18) {
      ctx.globalAlpha = Math.min(0.55, particle.opacity + 0.1);
      ctx.strokeStyle = '#c9e2ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(particle.x, height - 4, 2.8, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  ctx.save();
  ctx.globalAlpha = particle.opacity;
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.angle);

  if (particle.kind === 'snow') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    ctx.fill();
  } else if (particle.kind === 'sakura') {
    ctx.fillStyle = '#ffcae2';
    ctx.beginPath();
    ctx.ellipse(0, 0, particle.size * 0.9, particle.size * 0.6, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#d3a26f';
    ctx.beginPath();
    ctx.ellipse(0, 0, particle.size, particle.size * 0.55, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const updateAndDraw = (now: number) => {
  if (!ctx) return;
  if (document.hidden || isReducedMotion) {
    rafId = 0;
    return;
  }

  if (now - lastFrameTime < TARGET_FRAME_MS) {
    rafId = window.requestAnimationFrame(updateAndDraw);
    return;
  }
  lastFrameTime = now;

  ctx.clearRect(0, 0, width, height);
  maybeTriggerThunder(now);

  for (const particle of particles) {
    particle.sway += particle.swaySpeed;
    const swayStrength = particle.kind === 'rain' ? 0.02 : 0.35;
    particle.x += particle.vx + Math.sin(particle.sway) * swayStrength;
    particle.y += particle.vy;
    if (particle.kind === 'rain') {
      particle.angle = -0.22;
    } else {
      particle.angle += particle.spin;
    }

    if (particle.y > height + 24 || particle.x < -24 || particle.x > width + 24) {
      resetParticle(particle);
    }

    drawParticle(particle);
  }

  drawThunder(now);

  rafId = window.requestAnimationFrame(updateAndDraw);
};

const handleVisibilityChange = () => {
  if (!document.hidden && !isReducedMotion && !rafId) {
    rafId = window.requestAnimationFrame(updateAndDraw);
  }
};

const handleResize = () => {
  setupCanvas();
};

onMounted(() => {
  if (typeof window === 'undefined') return;

  isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  setupCanvas();
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('resize', handleResize, { passive: true });
  rafId = window.requestAnimationFrame(updateAndDraw);
});

onBeforeUnmount(() => {
  window.cancelAnimationFrame(rafId);
  rafId = 0;
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="mode === 'rain'" class="pointer-events-none fixed left-0 top-0 z-[98] h-screen w-screen bg-overlay"></div>
    <canvas ref="canvasRef" class="seasonal-fall pointer-events-none fixed inset-0 z-[100]" aria-hidden="true" />
  </Teleport>
</template>
