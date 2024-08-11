<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import FormItem from './components/FormItem.vue';
import { showToast } from 'vant';

const router = useRouter();
const currentForm = ref('');
const defaultForm = {
  login: {
    username: '',
    password: '',
  },
  signUp: {
    username: '',
    password: '',
    confirmPassword: '',
  },
};
const form = ref(defaultForm);

const onClick = () => {
  form.value.login = {
    username: '',
    password: '',
  };
  form.value.signUp = {
    username: '',
    password: '',
    confirmPassword: '',
  };
  if (currentForm.value == 'login') {
    currentForm.value = 'sign-up';

    router.replace({ name: 'sign-up' });
  } else {
    currentForm.value = 'login';
    router.replace({ name: 'login' });
  }
};
const onSubmit = () => {
  form.value.login.password = '';
  console.log(form.value);
};

onMounted(() => {
  setTimeout(() => {
    if (router.currentRoute.value.name == 'login') {
      currentForm.value = 'login';
    }
    if (router.currentRoute.value.name == 'sign-up') {
      currentForm.value = 'sign-up';
    }
  }, 100);

  // window.addEventListener('devicemotion', (event) => {
  //   if (
  //     event?.acceleration?.x &&
  //     (event?.acceleration?.x > 30 || event?.acceleration?.x < -30)
  //   ) {
  //     showToast(`shake ${event?.acceleration?.x}`);
  //   }
  // });
});
</script>

<template>
  <div
    class="fixed flex h-screen w-screen select-none flex-col items-center justify-center pb-40"
  >
    <div
      class="login-container relative flex h-[500px] w-[700px] overflow-hidden rounded"
    >
      <div class="rotate-background z-20" :class="currentForm"></div>

      <!-- login -->
      <div
        class="login-left absolute z-10 flex h-full w-1/2 flex-col justify-center space-y-2 p-5"
        :class="currentForm"
      >
        <div class="text-3xl font-bold">Login</div>
        <FormItem
          v-model:model-value="form.login.username"
          label="Username/Email"
          placeholder="Username/Email"
          class="w-[200px]"
        />
        <FormItem
          v-model:model-value="form.login.password"
          label="Password"
          placeholder="Password"
          type="password"
          class="w-[200px]"
        />
        <button class="button w-[200px]" @click="onSubmit">Login</button>
      </div>
      <div
        class="login-right absolute z-30 flex h-full w-1/2 flex-col items-end justify-center p-5 text-2xl font-bold text-white"
        :class="currentForm"
      >
        <div>Don't have account yet?</div>
        <button class="" @click="onClick">Sign up here -></button>
      </div>

      <!-- sign up-->
      <div
        class="sign-up-left absolute z-30 flex h-full w-1/2 flex-col items-start justify-center p-5 text-start text-2xl font-bold text-white"
        :class="currentForm"
      >
        <div>Already have an account?</div>
        <button class="" @click="onClick">
          {{ '<- Login Here' }}
        </button>
      </div>
      <div
        class="sign-up-right absolute z-10 flex h-full w-1/2 flex-col items-end justify-center space-y-2 p-5 text-end"
        :class="currentForm"
      >
        <div class="text-3xl font-bold">Sign Up</div>
        <FormItem
          v-model:model-value="form.signUp.username"
          label="Username/Email"
          placeholder="Username/Email"
          class="w-[200px] text-end"
        />
        <FormItem
          v-model:model-value="form.signUp.password"
          label="Password"
          placeholder="Password"
          type="password"
          class="w-[200px] text-end"
        />
        <FormItem
          v-model:model-value="form.signUp.confirmPassword"
          label="Confirm Password"
          placeholder="Password"
          type="password"
          class="w-[200px] text-end"
        />
        <button class="button w-[200px]" @click="onSubmit">Sign Up</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  --shadow-login: rgb(55, 255, 255);
  --text-color: rgb(57, 172, 172);

  color: var(--text-color);
  border: 1px solid var(--shadow-login);

  -webkit-box-shadow: 0px 0px 20px 0px var(--shadow-login);
  -moz-box-shadow: 0px 0px 20px 0px var(--shadow-login);
  box-shadow: 0px 0px 20px 0px var(--shadow-login);

  .rotate-background {
    position: absolute;
    top: -90%;
    height: 200%;
    width: 250%;
    left: -20%;
    background-color: var(--shadow-login);
    background-image: linear-gradient(
      35deg,
      rgba(0, 0, 0, 1),
      var(--shadow-login),
      var(--shadow-login)
    );
    border: 1px solid var(--shadow-login);
    transition: all 1300ms ease-in-out;

    &.login {
      left: -5%;
      transform: rotate(50deg);
    }

    &.sign-up {
      left: -145%;
      transform: rotate(-50deg);
    }
  }

  .login-right {
    transition: all 1300ms ease-in-out;
    right: -50%;
    &.login {
      right: 0%;
    }
  }

  .login-left {
    transition: all 1300ms ease-in-out;
    left: -50%;
    &.login {
      left: 0%;
    }
  }

  .sign-up-right {
    transition: all 1300ms ease-in-out;
    right: -50%;
    &.sign-up {
      right: 0%;
    }
  }

  .sign-up-left {
    transition: all 1300ms ease-in-out;
    left: -50%;
    &.sign-up {
      left: 0%;
    }
  }

  .button {
    margin-top: 20px;
    border: 1px solid var(--text-color);
    padding: 2px;
    border-radius: 20px;

    transition: all 500ms ease-in-out;

    &:active {
      background: black;
      color: white;
    }
  }
}

.dark {
  .login-container {
    --shadow-login: rgb(55, 255, 255);
    --text-color: rgb(55, 255, 255);
  }
}
</style>
