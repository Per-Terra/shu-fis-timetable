<template>
  <BadgeMain
    class="w-7"
    :class="isRequired ? 'bg-sky-500 text-white' : 'border border-sky-500 bg-white text-sky-500'"
    >IE</BadgeMain
  >
</template>

<script lang="ts" setup>
defineProps<{
  isRequired?: boolean;
}>();
</script>
