<template>
  <BadgeMain
    class="w-7"
    :class="isRequired ? 'bg-lime-500 text-white' : 'border border-lime-500 bg-white text-lime-500'"
    >BA</BadgeMain
  >
</template>

<script lang="ts" setup>
defineProps<{
  isRequired?: boolean;
}>();
</script>
