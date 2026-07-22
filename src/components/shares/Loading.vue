<template>
  <span class="loading-icon relative inline-flex h-[1em] w-[1em] shrink-0 overflow-visible align-middle" role="status" aria-label="Loading">
    <span
      class="loading-leaf absolute left-1/2 top-[4%] block h-[42%] w-[42%] origin-center -translate-x-1/2 rotate-[-45deg] rounded-[68%_68%_68%_18%]"
    />
    <span
      class="loading-leaf absolute right-[4%] top-1/2 block h-[42%] w-[42%] origin-center -translate-y-1/2 rotate-[45deg] rounded-[68%_68%_68%_18%] [animation-delay:0.15s]"
    />
    <span
      class="loading-leaf absolute bottom-[4%] left-1/2 block h-[42%] w-[42%] origin-center -translate-x-1/2 rotate-[135deg] rounded-[68%_68%_68%_18%] [animation-delay:0.3s]"
    />
    <span
      class="loading-leaf absolute left-[4%] top-1/2 block h-[42%] w-[42%] origin-center -translate-y-1/2 rotate-[-135deg] rounded-[68%_68%_68%_18%] [animation-delay:0.45s]"
    />
    <span class="loading-core absolute left-1/2 top-1/2 size-[0.25em] -translate-x-1/2 -translate-y-1/2 rounded-full" />
  </span>
</template>

<style scoped>
.loading-icon {
  animation: loading-spin 1.8s linear infinite;
}

.loading-leaf {
  background: linear-gradient(135deg, var(--color-accent-strong) 0%, var(--color-success) 100%);
  box-shadow:
    inset 0 0.05em 0.08em color-mix(in srgb, var(--color-accent-soft) 80%, transparent),
    0 0.14em 0.3em color-mix(in srgb, var(--color-success) 40%, transparent);
}

.loading-core {
  background: radial-gradient(circle at 35% 35%, var(--color-primary-hover) 0%, var(--color-warning) 70%, var(--color-primary) 100%);
  box-shadow: 0 0 0.28em color-mix(in srgb, var(--color-warning) 65%, transparent);
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
