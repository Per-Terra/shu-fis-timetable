<template>
  <BadgeMain
    class="w-7"
    :class="
      isRequired ? 'bg-slate-500 text-white' : 'border border-slate-500 bg-white text-slate-500'
    "
    >教</BadgeMain
  >
</template>

<script lang="ts" setup>
defineProps<{
  isRequired?: boolean;
}>();
</script>
