<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import FormItem from './components/FormItem.vue';
import { useAuth } from '~/stores/auth.js';
import SeasonalFall from '~/components/animation/SeasonalFall.vue';

const router = useRouter();
const auth = useAuth();
const currentForm = ref('');
const isLogin = computed(() => currentForm.value === 'login');
const slideDir = ref<'left' | 'right'>('left');
const transitionName = computed(() => `slide-${slideDir.value}`);

const form = ref({
  login: { username: '', password: '' },
  signUp: { username: '', password: '', confirmPassword: '', displayName: '' },
});

const errors = ref({
  login: { username: '', password: '' },
  signUp: { username: '', password: '', confirmPassword: '', displayName: '' },
});

const resetForms = () => {
  form.value.login = { username: '', password: '' };
  form.value.signUp = { username: '', password: '', confirmPassword: '', displayName: '' };
  errors.value.login = { username: '', password: '' };
  errors.value.signUp = { username: '', password: '', confirmPassword: '', displayName: '' };
};

const validateLogin = () => {
  const e = { username: '', password: '' };
  if (!form.value.login.username.trim()) e.username = 'Username is required.';
  if (!form.value.login.password) e.password = 'Password is required.';
  errors.value.login = e;
  return !e.username && !e.password;
};

const validateSignUp = () => {
  const f = form.value.signUp;
  const e = { username: '', password: '', confirmPassword: '', displayName: '' };
  if (!f.displayName.trim()) e.displayName = 'Display name is required.';
  if (!f.username.trim()) e.username = 'Username is required.';
  else if (f.username.length < 3) e.username = 'Username must be at least 3 characters.';
  if (!f.password) e.password = 'Password is required.';
  else if (f.password.length < 6) e.password = 'Password must be at least 6 characters.';
  if (!f.confirmPassword) e.confirmPassword = 'Please confirm your password.';
  else if (f.password !== f.confirmPassword) e.confirmPassword = 'Passwords do not match.';
  errors.value.signUp = e;
  return !e.username && !e.password && !e.confirmPassword && !e.displayName;
};

const onClick = () => {
  resetForms();
  if (currentForm.value === 'login') {
    slideDir.value = 'left';
    currentForm.value = 'sign-up';
    router.replace({ name: 'sign-up', query: { redirect: router.currentRoute.value.query.redirect } });
  } else {
    slideDir.value = 'right';
    currentForm.value = 'login';
    router.replace({ name: 'login', query: { redirect: router.currentRoute.value.query.redirect } });
  }
};

const onSubmit = async () => {
  if (currentForm.value === 'login') {
    if (!validateLogin()) return;
    const res = await auth.login(form.value.login);
    if (res) router.replace((router.currentRoute.value.query.redirect as string) || '/');
  } else {
    if (!validateSignUp()) return;
    const res = await auth.signUp({
      username: form.value.signUp.username,
      password: form.value.signUp.password,
      name: form.value.signUp.displayName,
    });
    if (res) router.replace((router.currentRoute.value.query.redirect as string) || '/');
  }
};

const mode = ref('sakura');
onMounted(() => {
  setTimeout(() => {
    if (router.currentRoute.value.name === 'login') currentForm.value = 'login';
    if (router.currentRoute.value.name === 'sign-up') currentForm.value = 'sign-up';
  }, 100);

  const modes = ['sakura', 'snow', 'leaf', 'rain'];
  const i = Math.floor(Math.random() * modes.length);
  mode.value = modes[i];
});
</script>

<template>
  <!-- page -->
  <SeasonalFall mode="rain" />
  <div class="to-surface fixed inset-0 flex select-none items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card">
    <!-- floating blobs -->
    <div
      class="blob-float bg-anella-hero dark:bg-anella-dark-lavender pointer-events-none absolute -left-20 -top-20 h-[260px] w-[340px] rounded-full opacity-45 blur-[52px] dark:opacity-35"
      style="animation: float-a 9s ease-in-out infinite"
    />
    <div
      class="blob-float bg-anella-lavender dark:bg-anella-cloud-purple pointer-events-none absolute -bottom-16 -right-16 h-[220px] w-[280px] rounded-full opacity-45 blur-[52px] dark:opacity-30"
      style="animation: float-b 11s ease-in-out infinite"
    />
    <div
      class="blob-float bg-anella-secondary pointer-events-none absolute bottom-[10%] left-[10%] h-[180px] w-[200px] rounded-full opacity-45 blur-[52px] dark:bg-primary dark:opacity-30"
      style="animation: float-a 13s ease-in-out infinite reverse"
    />

    <!-- card -->
    <div
      class="border-border relative z-10 w-[90%] max-w-[420px] rounded-[28px] border bg-gradient-to-br from-[#ebf8ff] via-[#ffffff] to-[#d6ecff] px-2 py-8 text-foreground shadow-[0_20px_60px_#78a0dc2e,0_4px_16px_#a08cdc1a] backdrop-blur-xl dark:border-[#6b59a0] dark:bg-gradient-to-br dark:from-[#271d3d] dark:via-[#33264f] dark:to-[#211833] dark:shadow-[0_24px_70px_#00000066,0_4px_24px_#b9b0f52e]"
    >
      <!-- logo + tabs -->
      <div class="mb-6 flex flex-col items-center gap-4">
        <span
          class="text-[2.6rem] leading-none drop-shadow-[0_4px_10px_#64a0f059] dark:drop-shadow-[0_4px_12px_#b9b0f566]"
          style="animation: float-a 6s ease-in-out infinite"
        >
          ☁️
        </span>

        <!-- tab switcher -->
        <div class="relative flex w-[220px] rounded-full border border-[#e6d9f7] bg-[#f8f2ff] p-1 dark:border-[#6f5aa0] dark:bg-[#2a2142]">
          <button
            class="relative z-10 flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors duration-200"
            :class="isLogin ? 'text-primary dark:text-secondary' : 'text-[#6f6785] dark:text-[#cdc3e2]'"
            @click="!isLogin && onClick()"
          >
            Login
          </button>
          <button
            class="relative z-10 flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors duration-200"
            :class="!isLogin ? 'text-primary dark:text-secondary' : 'text-[#6f6785] dark:text-[#cdc3e2]'"
            @click="isLogin && onClick()"
          >
            Sign Up
          </button>
          <!-- sliding pill -->
          <div
            class="tab-slider absolute inset-1 w-[calc(50%-4px)] rounded-full border border-[#e4d5f5] bg-white shadow-[0_2px_8px_#78a0dc38] transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] dark:border-[#4d3a72] dark:bg-[#3a2e58] dark:shadow-[0_2px_12px_#00000066]"
            :class="{ 'translate-x-full': !isLogin }"
          />
        </div>
      </div>

      <!-- animated form area -->
      <div class="overflow-x-hidden px-6 pb-2">
        <Transition :name="transitionName" mode="out-in">
          <!-- ── Login ── -->
          <form v-if="isLogin" key="login" class="flex flex-col gap-3.5" @submit.prevent="onSubmit">
            <p class="mb-1 text-center text-[1.05rem] font-bold text-foreground">Welcome back! 🌸</p>
            <div class="flex flex-col gap-1">
              <FormItem v-model="form.login.username" label="Username" placeholder="Enter your username" autocomplete="username" />
              <span v-if="errors.login.username" class="pl-2 text-xs text-primary">{{ errors.login.username }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <FormItem
                v-model="form.login.password"
                label="Password"
                placeholder="Enter your password"
                type="password"
                autocomplete="current-password"
              />
              <span v-if="errors.login.password" class="pl-2 text-xs text-primary">{{ errors.login.password }}</span>
            </div>
            <button
              type="submit"
              class="from-anella-cloud-purple to-anella-dark-lavender mt-1.5 w-full cursor-pointer rounded-full border border-[#d8c8f1] bg-gradient-to-br py-2.5 text-[0.95rem] font-bold text-white shadow-[0_0_12px_#b9b0f5aa,0_0_28px_#9a8de866] transition-[box-shadow,opacity,transform] duration-150 hover:shadow-[0_0_18px_#b9b0f5cc,0_0_40px_#9a8de899] active:scale-[0.97] active:opacity-90 dark:border-[#f0e8ff77] dark:shadow-[0_0_14px_#b9b0f5cc,0_0_36px_#9a8de8aa]"
            >
              Login ✨
            </button>
            <p class="text-foreground-muted mt-0.5 text-center text-xs">
              No account yet?
              <button
                type="button"
                class="hover:text-primary-hover font-bold text-primary underline decoration-2 underline-offset-2 dark:text-secondary dark:hover:text-primary"
                @click="onClick"
              >
                Sign up here →
              </button>
            </p>
          </form>

          <!-- ── Sign Up ── -->
          <form v-else key="signup" class="flex flex-col gap-3.5" @submit.prevent="onSubmit">
            <p class="mb-1 text-center text-[1.05rem] font-bold text-foreground">Join us! 💕</p>
            <div class="flex flex-col gap-1">
              <FormItem v-model="form.signUp.displayName" label="Display Name" placeholder="Your cute name 🌷" autocomplete="name" />
              <span v-if="errors.signUp.displayName" class="pl-2 text-xs text-primary">{{ errors.signUp.displayName }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <FormItem v-model="form.signUp.username" label="Username" placeholder="Choose a username" autocomplete="username" />
              <span v-if="errors.signUp.username" class="pl-2 text-xs text-primary">{{ errors.signUp.username }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <FormItem v-model="form.signUp.password" label="Password" placeholder="Create a password" type="password" autocomplete="new-password" />
              <span v-if="errors.signUp.password" class="pl-2 text-xs text-primary">{{ errors.signUp.password }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <FormItem
                v-model="form.signUp.confirmPassword"
                label="Confirm Password"
                placeholder="Repeat your password"
                type="password"
                autocomplete="new-password"
              />
              <span v-if="errors.signUp.confirmPassword" class="pl-2 text-xs text-primary">{{ errors.signUp.confirmPassword }}</span>
            </div>
            <button
              type="submit"
              class="mt-1.5 w-full cursor-pointer rounded-full border border-[#f3b9d1] bg-gradient-to-br from-primary to-secondary py-2.5 text-[0.95rem] font-bold text-white shadow-[0_0_12px_#f99ab8aa,0_0_28px_#ffb6cc66] transition-[box-shadow,opacity,transform] duration-150 hover:shadow-[0_0_18px_#f99ab8cc,0_0_40px_#ffb6cc99] active:scale-[0.97] active:opacity-90 dark:border-[#f0e8ff77] dark:shadow-[0_0_14px_#f99ab8cc,0_0_36px_#ffb6cc99]"
            >
              Sign Up 🌷
            </button>
            <p class="text-foreground-muted mt-0.5 text-center text-xs">
              Already have an account?
              <button
                type="button"
                class="hover:text-primary-hover font-bold text-primary underline decoration-2 underline-offset-2 dark:text-secondary dark:hover:text-primary"
                @click="onClick"
              >
                ← Login here
              </button>
            </p>
          </form>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* keyframe animations — not expressible in Tailwind */
@keyframes float-a {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-18px);
  }
}
@keyframes float-b {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(14px);
  }
}

/* directional slide transitions */
.slide-left-enter-from {
  transform: translateX(32px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-32px);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-32px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(32px);
  opacity: 0;
}
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 280ms ease;
}
</style>
