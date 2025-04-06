<template>
  <BadgeMain
    class="w-7"
    :class="
      isRequired ? 'bg-yellow-500 text-white' : 'border border-yellow-500 bg-white text-yellow-500'
    "
    >DS</BadgeMain
  >
</template>

<script lang="ts" setup>
defineProps<{
  isRequired?: boolean;
}>();
</script>
