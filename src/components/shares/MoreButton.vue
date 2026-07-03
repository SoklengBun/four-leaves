<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		ariaLabel?: string;
	}>(),
	{
		ariaLabel: 'More actions',
	},
);

const emit = defineEmits<{ click: [] }>();

const onClick = () => {
	emit('click');
};
</script>

<template>
	<button
		type="button"
		class="fixed right-3 top-3 z-20 mr-auto flex size-[40px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffcfe7] bg-[linear-gradient(160deg,#fff9fd_0%,#ffeaf5_100%)] text-[#ff4f9b] shadow-[0_4px_10px_#ffd9ec,inset_0_0_0_4px_#fff4fb] transition-[transform,box-shadow] duration-150 active:scale-95 active:shadow-[0_2px_8px_#ffd2e8,inset_0_0_0_4px_#ffeef8] md:hidden"
		:aria-label="props.ariaLabel"
		@click="onClick"
	>
		<span
			class="relative inline-flex h-[18px] w-[18px] text-[#ff4f9b] after:absolute after:-right-1 after:-top-0.5 after:h-[6px] after:w-[6px] after:rounded-full after:bg-white after:shadow-[0_0_0_1px_#ffd2ea,0_0_6px_#fff7fc] after:content-['']"
			aria-hidden="true"
		>
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M6.5 12C6.5 12.8284 5.82843 13.5 5 13.5C4.17157 13.5 3.5 12.8284 3.5 12C3.5 11.1716 4.17157 10.5 5 10.5C5.82843 10.5 6.5 11.1716 6.5 12Z"
					fill="currentColor"
				/>
				<path
					d="M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z"
					fill="currentColor"
				/>
				<path
					d="M20.5 12C20.5 12.8284 19.8284 13.5 19 13.5C18.1716 13.5 17.5 12.8284 17.5 12C17.5 11.1716 18.1716 10.5 19 10.5C19.8284 10.5 20.5 11.1716 20.5 12Z"
					fill="currentColor"
				/>
			</svg>
		</span>
	</button>
</template>
