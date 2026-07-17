<template>
  <div class="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
    <div
      aria-hidden="true"
      class="relative flex h-[88px] w-[122px] animate-[fluffy-float_1.8s_ease-in-out_infinite] items-center justify-center rounded-full border-[3px] border-border-strong bg-surface shadow-card before:absolute before:bottom-[10px] before:left-[10px] before:h-12 before:w-12 before:rounded-full before:border-[3px] before:border-border-strong before:bg-surface before:content-[''] after:absolute after:bottom-[10px] after:right-[10px] after:h-[58px] after:w-[58px] after:rounded-full after:border-[3px] after:border-border-strong after:bg-surface after:content-['']"
    >
      <span
        class="absolute left-6 top-[-9px] z-[-1] h-6 w-6 rotate-[-16deg] rounded-[9999px_9999px_10px_10px] border-[3px] border-border-strong bg-surface"
      ></span>
      <span
        class="absolute right-6 top-[-9px] z-[-1] h-6 w-6 rotate-[16deg] rounded-[9999px_9999px_10px_10px] border-[3px] border-border-strong bg-surface"
      ></span>
      <span class="mt-[10px] flex items-center gap-3">
        <span class="h-[10px] w-[10px] animate-[fluffy-blink_2.4s_ease-in-out_infinite] rounded-full bg-primary"></span>
        <span class="h-[10px] w-[10px] animate-[fluffy-blink_2.4s_ease-in-out_infinite] rounded-full bg-primary"></span>
        <span
          class="relative h-[14px] w-[18px] before:absolute before:left-[-1px] before:top-px before:h-3 before:w-[10px] before:rotate-[12deg] before:rounded-b-full before:border-b-[3px] before:border-primary before:content-[''] after:absolute after:right-[-1px] after:top-px after:h-3 after:w-[10px] after:rotate-[-12deg] after:rounded-b-full after:border-b-[3px] after:border-primary after:content-['']"
        ></span>
      </span>
    </div>
    <div class="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
      <span>Fetching lyrics</span>
      <span class="h-2 w-2 animate-[fluffy-bounce_1s_ease-in-out_infinite] rounded-full bg-primary" style="animation-delay: 0.12s"></span>
      <span class="h-2 w-2 animate-[fluffy-bounce_1s_ease-in-out_infinite] rounded-full bg-primary" style="animation-delay: 0.24s"></span>
      <span class="h-2 w-2 animate-[fluffy-bounce_1s_ease-in-out_infinite] rounded-full bg-primary" style="animation-delay: 0.36s"></span>
    </div>
  </div>
</template>

<style scoped>
@keyframes fluffy-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

@keyframes fluffy-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }

  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@keyframes fluffy-blink {
  0%,
  42%,
  100% {
    transform: scaleY(1);
  }

  46%,
  50% {
    transform: scaleY(0.2);
  }
}
</style>
