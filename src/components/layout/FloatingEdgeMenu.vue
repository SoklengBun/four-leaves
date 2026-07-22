<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import moonIcon from '~/assets/moon.svg';
import sunIcon from '~/assets/sun.svg';
import menuHomeIcon from '~/assets/images/menus/home.png';
import menuLyricIcon from '~/assets/images/menus/lyric.png';
import menuLyricMineIcon from '~/assets/images/menus/lyric-mine.png';
import menuLyricAddIcon from '~/assets/images/menus/lyric-add.png';
import menuStorageIcon from '~/assets/images/menus/storage.svg';
import menuDefaultIcon from '~/assets/images/yunli.png';
import { useAppTheme } from '~/composables/useAppTheme';
import { pxOfCurrentScreenSize } from '~/utils/helper';
import IconMenu from '../icons/IconMenu.vue';

type Edge = 'left' | 'right' | 'top' | 'bottom';

type MenuItem = {
  label: string;
  path: string;
  icon: string;
  action?: 'toggle-theme';
};

const router = useRouter();
const route = useRoute();
const isDark = useAppTheme();

const menuItems: MenuItem[] = [
  { label: 'Home', path: '/', icon: menuHomeIcon },
  { label: 'Lyrics', path: '/lyrics', icon: menuLyricIcon },
  { label: 'My Lyrics', path: '/lyrics/all', icon: menuLyricMineIcon },
  { label: 'Add Lyrics', path: '/lyrics/add', icon: menuLyricAddIcon },
  { label: 'About', path: '/about', icon: menuDefaultIcon },
  { label: 'Storage', path: '/storage', icon: menuStorageIcon },
  { label: 'Toggle theme', path: '__toggle-theme__', icon: moonIcon, action: 'toggle-theme' },
];

const getItemLabel = (item: MenuItem) => {
  if (item.action !== 'toggle-theme') return item.label;
  return isDark.value ? 'Switch to light mode' : 'Switch to dark mode';
};

const getItemIcon = (item: MenuItem) => {
  if (item.action !== 'toggle-theme') return item.icon;
  return isDark.value ? sunIcon : moonIcon;
};

const FAB_SIZE = 56;
const MOBILE_FAB_SIZE = 40;
const MOBILE_BREAKPOINT = 768;
const EDGE_MARGIN = 12;
const ITEM_RADIUS = 82;
const MOBILE_ITEM_RADIUS = 66;
const HALF_ARC_DEG = 176;
const ROTATE_STEP_INTERVAL_MS = 90;
const FAB_STICK_TRANSITION_MS = 240;
const WHEEL_COLLAPSE_TRANSITION_MS = 320;
const WHEEL_DIAMETER = 260;
const MOBILE_WHEEL_DIAMETER = 212;
const WHEEL_RING_INSET = 12;
const WHEEL_ITEM_SIZE = 50;
const MOBILE_WHEEL_ITEM_SIZE = 42;

const fabX = ref(0);
const fabY = ref(0);
const edge = ref<Edge>('right');
const isStuckOpen = ref(false);
const isMenuOpen = ref(false);
const activeIndex = ref(0);
const wheelReady = ref(false);
const resizeTick = ref(0);

const dragState = {
  active: false,
  moved: false,
  startX: 0,
  startY: 0,
  pointerId: -1,
  offsetX: 0,
  offsetY: 0,
};

const wheelDrag = {
  active: false,
  startCoord: 0,
};

let lastRotateAt = 0;
let openTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const wrapIndex = (value: number) => ((value % menuItems.length) + menuItems.length) % menuItems.length;
const scaledPx = (px: number) => {
  resizeTick.value;
  return pxOfCurrentScreenSize(px);
};

const isMobileViewport = computed(() => {
  resizeTick.value;
  return window.innerWidth <= MOBILE_BREAKPOINT;
});
const fabSizePx = computed(() => scaledPx(isMobileViewport.value ? MOBILE_FAB_SIZE : FAB_SIZE));
const edgeMarginPx = computed(() => scaledPx(EDGE_MARGIN));
const itemRadiusPx = computed(() => scaledPx(isMobileViewport.value ? MOBILE_ITEM_RADIUS : ITEM_RADIUS));
const openStickOffsetPx = computed(() => fabSizePx.value / 2 + edgeMarginPx.value);
const wheelDiameterPx = computed(() => scaledPx(isMobileViewport.value ? MOBILE_WHEEL_DIAMETER : WHEEL_DIAMETER));
const wheelInsetPx = computed(() => scaledPx(WHEEL_RING_INSET));
const wheelItemSizePx = computed(() => scaledPx(isMobileViewport.value ? MOBILE_WHEEL_ITEM_SIZE : WHEEL_ITEM_SIZE));
const wheelRootStyle = computed(() => ({
  ...wheelCenterStyle.value,
  '--fab-size': `${fabSizePx.value}px`,
  '--wheel-diameter': `${wheelDiameterPx.value}px`,
  '--wheel-radius-half': `${wheelDiameterPx.value / 2}px`,
  '--wheel-ring-inset': `${wheelInsetPx.value}px`,
  '--wheel-item-size': `${wheelItemSizePx.value}px`,
  '--wheel-item-offset': `${wheelItemSizePx.value / -2}px`,
}));

const maxFabX = () => Math.max(edgeMarginPx.value, window.innerWidth - fabSizePx.value - edgeMarginPx.value);
const maxFabY = () => Math.max(edgeMarginPx.value, window.innerHeight - fabSizePx.value - edgeMarginPx.value);

const setInitialPosition = () => {
  fabX.value = maxFabX();
  fabY.value = clamp(window.innerHeight * 0.45, edgeMarginPx.value, maxFabY());
  edge.value = 'right';
};

const detectClosestEdge = () => {
  const left = fabX.value - edgeMarginPx.value;
  const right = maxFabX() - fabX.value;
  const top = fabY.value - edgeMarginPx.value;
  const bottom = maxFabY() - fabY.value;
  const nearest = Math.min(left, right, top, bottom);

  if (nearest === left) return 'left';
  if (nearest === right) return 'right';
  if (nearest === top) return 'top';
  return 'bottom';
};

const snapToClosestEdge = () => {
  const target = detectClosestEdge();
  edge.value = target;

  if (target === 'left') fabX.value = edgeMarginPx.value;
  if (target === 'right') fabX.value = maxFabX();
  if (target === 'top') fabY.value = edgeMarginPx.value;
  if (target === 'bottom') fabY.value = maxFabY();

  if (target === 'left' || target === 'right') {
    fabY.value = clamp(fabY.value, edgeMarginPx.value, maxFabY());
  } else {
    fabX.value = clamp(fabX.value, edgeMarginPx.value, maxFabX());
  }
};

const wheelCenterStyle = computed(() => {
  const openOffset = isStuckOpen.value ? openStickOffsetPx.value : 0;
  const offsetX = edge.value === 'left' ? -openOffset : edge.value === 'right' ? openOffset : 0;
  const offsetY = edge.value === 'top' ? -openOffset : edge.value === 'bottom' ? openOffset : 0;

  return {
    left: `${fabX.value + fabSizePx.value / 2 + offsetX}px`,
    top: `${fabY.value + fabSizePx.value / 2 + offsetY}px`,
  };
});

const fabStyle = computed(() => {
  const shift = isStuckOpen.value ? (openStickOffsetPx.value / fabSizePx.value) * 100 : 0;
  let transform = 'translate(0, 0)';

  if (edge.value === 'left') transform = `translate(-${shift}%, 0)`;
  if (edge.value === 'right') transform = `translate(${shift}%, 0)`;
  if (edge.value === 'top') transform = `translate(0, -${shift}%)`;
  if (edge.value === 'bottom') transform = `translate(0, ${shift}%)`;

  return {
    left: `${fabX.value}px`,
    top: `${fabY.value}px`,
    transform,
  };
});

const halfWheelClass = computed(() => {
  if (edge.value === 'left') return '[clip-path:inset(0_0_0_50%)]';
  if (edge.value === 'right') return '[clip-path:inset(0_50%_0_0)]';
  if (edge.value === 'top') return '[clip-path:inset(50%_0_0_0)]';
  return '[clip-path:inset(0_0_50%_0)]';
});

const wheelBaseAngle = computed(() => {
  if (edge.value === 'left') return 0;
  if (edge.value === 'right') return 180;
  if (edge.value === 'top') return 90;
  return -90;
});

const rotateWheel = (direction: number) => {
  const normalized = direction > 0 ? 1 : -1;
  activeIndex.value = wrapIndex(activeIndex.value + normalized);
};

const rotateWheelStep = (direction: number) => {
  if (!isMenuOpen.value || !wheelReady.value) return;

  const now = performance.now();
  if (now - lastRotateAt < ROTATE_STEP_INTERVAL_MS) return;
  lastRotateAt = now;
  rotateWheel(direction);
};

const directionFactor = computed(() => {
  if (edge.value === 'left' || edge.value === 'bottom') return -1;
  return 1;
});

const onPointerDown = (event: PointerEvent) => {
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;

  dragState.active = true;
  dragState.moved = false;
  dragState.pointerId = event.pointerId;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.offsetX = event.clientX - fabX.value;
  dragState.offsetY = event.clientY - fabY.value;

  target.setPointerCapture(event.pointerId);
};

const onPointerMove = (event: PointerEvent) => {
  if (!dragState.active) return;
  if (isStuckOpen.value) return;

  const dx = Math.abs(event.clientX - dragState.startX);
  const dy = Math.abs(event.clientY - dragState.startY);
  if (dx + dy > 4) dragState.moved = true;

  fabX.value = clamp(event.clientX - dragState.offsetX, edgeMarginPx.value, maxFabX());
  fabY.value = clamp(event.clientY - dragState.offsetY, edgeMarginPx.value, maxFabY());
};

const onPointerUp = (event: PointerEvent) => {
  if (!dragState.active || dragState.pointerId !== event.pointerId) return;

  const target = event.currentTarget as HTMLElement | null;
  if (target?.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }

  dragState.active = false;
  dragState.pointerId = -1;

  if (!dragState.moved) {
    if (isStuckOpen.value || isMenuOpen.value) {
      closeMenu();
    } else {
      openMenu();
    }
    return;
  }

  closeMenu();
  snapToClosestEdge();
};

const clearTimers = () => {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};

const openMenu = () => {
  clearTimers();
  isStuckOpen.value = true;
  wheelReady.value = false;
  lastRotateAt = 0;

  openTimer = setTimeout(() => {
    isMenuOpen.value = true;
    requestAnimationFrame(() => {
      wheelReady.value = true;
    });
    openTimer = null;
  }, FAB_STICK_TRANSITION_MS);
};

const closeMenu = () => {
  clearTimers();
  isMenuOpen.value = false;
  wheelReady.value = false;

  closeTimer = setTimeout(() => {
    isStuckOpen.value = false;
    closeTimer = null;
  }, WHEEL_COLLAPSE_TRANSITION_MS);
};

const onWheelInput = (event: WheelEvent) => {
  event.preventDefault();
  rotateWheelStep((event.deltaY > 0 ? 1 : -1) * directionFactor.value);
};

const axisByEdge = computed<'x' | 'y'>(() => {
  if (edge.value === 'left' || edge.value === 'right') return 'y';
  return 'x';
});

const onWheelDragStart = (event: PointerEvent) => {
  wheelDrag.active = true;
  wheelDrag.startCoord = axisByEdge.value === 'y' ? event.clientY : event.clientX;
  window.addEventListener('pointermove', onWheelDragMove, { passive: false });
  window.addEventListener('pointerup', onWheelDragEnd);
};

const onWheelDragMove = (event: PointerEvent) => {
  if (!wheelDrag.active) return;
  event.preventDefault();

  const now = axisByEdge.value === 'y' ? event.clientY : event.clientX;
  const delta = now - wheelDrag.startCoord;
  if (Math.abs(delta) < 20) return;

  rotateWheelStep((delta > 0 ? 1 : -1) * directionFactor.value);
  wheelDrag.startCoord = now;
};

const onWheelDragEnd = () => {
  wheelDrag.active = false;
  window.removeEventListener('pointermove', onWheelDragMove);
  window.removeEventListener('pointerup', onWheelDragEnd);
};

const shortestDiff = (index: number) => {
  let diff = index - activeIndex.value;
  const half = menuItems.length / 2;
  if (diff > half) diff -= menuItems.length;
  if (diff < -half) diff += menuItems.length;
  return diff;
};

const itemStyle = (index: number): CSSProperties => {
  const diff = shortestDiff(index);

  const visibleCount = Math.min(5, menuItems.length);
  const maxOffset = Math.floor((visibleCount - 1) / 2);
  if (Math.abs(diff) > maxOffset) {
    return {
      transform: 'translate(0px, 0px) scale(0.2)',
      opacity: '0',
      zIndex: '0',
      transitionDelay: '0ms',
      pointerEvents: 'none' as const,
    };
  }

  const angleStep = visibleCount > 1 ? HALF_ARC_DEG / (visibleCount - 1) : 0;
  const angle = (wheelBaseAngle.value + diff * angleStep) * (Math.PI / 180);
  const targetX = Math.cos(angle) * itemRadiusPx.value;
  const targetY = Math.sin(angle) * itemRadiusPx.value;

  const depth = 1 - Math.min(Math.abs(diff) * 0.12, 0.45);
  const opacity = 1 - Math.min(Math.abs(diff) * 0.2, 0.7);
  const revealDelay = `${Math.abs(diff) * 72}ms`;

  if (!wheelReady.value) {
    return {
      transform: 'translate(0px, 0px) scale(0.2)',
      opacity: '0',
      zIndex: `${100 - Math.abs(diff)}`,
      transitionDelay: revealDelay,
    };
  }

  return {
    transform: `translate(${targetX}px, ${targetY}px) scale(${depth})`,
    opacity: `${opacity}`,
    zIndex: `${100 - Math.abs(diff)}`,
    transitionDelay: '0ms',
  };
};

const navigateTo = async (item: MenuItem, index: number) => {
  activeIndex.value = index;

  if (item.action === 'toggle-theme') {
    isDark.value = !isDark.value;
    closeMenu();
    return;
  }

  if (route.path !== item.path) {
    await router.push(item.path);
  }
  closeMenu();
};

const handleResize = () => {
  resizeTick.value += 1;
  fabX.value = clamp(fabX.value, edgeMarginPx.value, maxFabX());
  fabY.value = clamp(fabY.value, edgeMarginPx.value, maxFabY());
  snapToClosestEdge();
};

watch(
  () => route.fullPath,
  () => {
    if (isMenuOpen.value || isStuckOpen.value) {
      closeMenu();
    } else {
      clearTimers();
      wheelReady.value = false;
    }

    const current = menuItems.findIndex((item) => item.path === route.path);
    if (current >= 0) activeIndex.value = current;
  },
  { immediate: true },
);

watch(isMenuOpen, (open) => {
  if (!open) {
    wheelReady.value = false;
    return;
  }

  wheelReady.value = false;
  lastRotateAt = 0;
  requestAnimationFrame(() => {
    wheelReady.value = true;
  });
});

onMounted(() => {
  setInitialPosition();
  window.addEventListener('resize', handleResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  onWheelDragEnd();
  clearTimers();
});
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[1000]">
    <div class="pointer-events-none fixed" :style="wheelRootStyle">
      <transition
        enter-active-class="transition-opacity duration-[320ms] ease-in-out"
        leave-active-class="transition-opacity duration-[320ms] ease-in-out"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMenuOpen"
          class="pointer-events-auto absolute left-[calc(-1*var(--wheel-radius-half))] top-[calc(-1*var(--wheel-radius-half))] h-[var(--wheel-diameter)] w-[var(--wheel-diameter)] overflow-hidden rounded-full"
          :class="halfWheelClass"
          @wheel="onWheelInput"
          @pointerdown="onWheelDragStart"
        >
          <div class="wheel-ring absolute inset-[var(--wheel-ring-inset)] rounded-full border border-accent" />
          <button
            v-for="(item, index) in menuItems"
            :key="item.path"
            class="wheel-item absolute left-1/2 top-1/2 h-[var(--wheel-item-size)] w-[var(--wheel-item-size)] overflow-hidden rounded-full border border-border-strong bg-card p-0 transition-[transform,opacity] duration-[320ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] [margin-left:var(--wheel-item-offset)] [margin-top:var(--wheel-item-offset)]"
            :class="{ active: index === activeIndex }"
            :style="itemStyle(index)"
            :title="getItemLabel(item)"
            :aria-label="getItemLabel(item)"
            draggable="false"
            @click="navigateTo(item, index)"
          >
            <img
              :src="getItemIcon(item)"
              :alt="getItemLabel(item)"
              class="pointer-events-none size-full select-none rounded-full [-webkit-user-drag:none]"
              :class="item.action === 'toggle-theme' ? 'object-contain p-[9px]' : 'object-cover'"
              draggable="false"
            />
          </button>
        </div>
      </transition>

      <button
        class="floating-fab pointer-events-auto fixed z-20 flex h-[var(--fab-size)] w-[var(--fab-size)] touch-none select-none items-center justify-center rounded-full border-2 border-border-strong text-primary transition [background:var(--gradient-surface)]"
        :class="{ 'fab-open': isStuckOpen }"
        :style="fabStyle"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
      >
        <IconMenu :active="isStuckOpen" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.floating-fab {
  box-shadow:
    0 8px 24px color-mix(in srgb, var(--color-primary) 24%, transparent),
    0 0 0 4px color-mix(in srgb, var(--color-card) 70%, transparent) inset;
}

.fab-open {
  border-color: var(--color-accent);
  box-shadow:
    0 0 3px var(--color-accent),
    0 0 12px color-mix(in srgb, var(--color-accent) 60%, transparent);
}

.wheel-ring {
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--color-accent) 18%, transparent) 0%,
    color-mix(in srgb, var(--color-secondary) 46%, transparent) 100%
  );
  box-shadow:
    0 0 3px var(--color-accent),
    0 0 12px color-mix(in srgb, var(--color-accent) 55%, transparent);
}

.wheel-item {
  box-shadow: 0 8px 16px color-mix(in srgb, var(--color-background) 80%, transparent);
}

.wheel-item.active {
  border-color: var(--color-accent);
  box-shadow:
    0 10px 18px color-mix(in srgb, var(--color-background) 85%, transparent),
    0 0 0 2px var(--color-accent-soft);
}
</style>
