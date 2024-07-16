<script setup lang="ts">
import Upload from "./components/upload.vue";
</script>

<template>
  <Upload :disabled="false" :multiple="true" :drag="true"></Upload>
</template>
