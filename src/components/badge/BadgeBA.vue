<template>
  <BadgeMain
    class="w-7"
    :class="
      isRequired
        ? 'bg-emerald-500 text-white'
        : 'border border-emerald-500 bg-white text-emerald-500'
    "
    >BA</BadgeMain
  >
</template>

<script lang="ts" setup>
defineProps<{
  isRequired?: boolean;
}>();
</script>
