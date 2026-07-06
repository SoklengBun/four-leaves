<template>
  <span class="loading-icon relative inline-flex h-[1em] w-[1em] shrink-0 overflow-visible align-middle" role="status" aria-label="Loading">
    <span class="loading-leaf loading-leaf--top absolute left-1/2 top-[4%] block h-[42%] w-[42%] -translate-x-1/2 rotate-[-45deg]" />
    <span class="loading-leaf loading-leaf--right absolute right-[4%] top-1/2 block h-[42%] w-[42%] -translate-y-1/2 rotate-[45deg]" />
    <span class="loading-leaf loading-leaf--bottom absolute bottom-[4%] left-1/2 block h-[42%] w-[42%] -translate-x-1/2 rotate-[135deg]" />
    <span class="loading-leaf loading-leaf--left absolute left-[4%] top-1/2 block h-[42%] w-[42%] -translate-y-1/2 rotate-[-135deg]" />
    <span class="loading-core absolute left-1/2 top-1/2 size-[0.25em] -translate-x-1/2 -translate-y-1/2" />
  </span>
</template>

<style scoped>
.loading-icon {
  animation: loading-spin 1.8s linear infinite;
}

.loading-leaf {
  border-radius: 68% 68% 68% 18%;
  background: linear-gradient(135deg, #9ef4a9 0%, #55c86d 55%, #2e8f47 100%);
  box-shadow:
    inset 0 0.05em 0.08em #d9ffe0,
    0 0.14em 0.3em #75d58c66;
  transform-origin: center;
  /* animation: loading-bloom 1.1s ease-in-out infinite; */
}

.loading-leaf--right {
  animation-delay: 0.15s;
}

.loading-leaf--bottom {
  animation-delay: 0.3s;
}

.loading-leaf--left {
  animation-delay: 0.45s;
}

.loading-core {
  border-radius: 999px;
  background: radial-gradient(circle at 35% 35%, #fff6c4 0%, #ffd76a 65%, #f3b545 100%);
  box-shadow: 0 0 0.28em #ffe7a1;
}

@keyframes loading-bloom {
  0%,
  100% {
    opacity: 0.72;
    filter: saturate(0.95);
  }
  50% {
    opacity: 1;
    filter: saturate(1.1);
  }
}

@keyframes loading-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
