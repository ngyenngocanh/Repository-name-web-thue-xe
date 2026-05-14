<template>
  <div class="bg-white p-4 rounded-lg border">
    <h4 class="font-bold mb-3">ĐIỀU {{ number }}. {{ title }}</h4>
    <div class="text-sm leading-relaxed pl-6">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  number: {
    type: [Number, String],
    required: true
  },
  title: {
    type: String,
    required: true
  }
})
</script>
