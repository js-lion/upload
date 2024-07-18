<script setup lang="ts">
import Upload from "./components/upload.vue";

const onSuccess = function (list: object[]) {
  console.log(list)
}
</script>

<template>
  <Upload :disabled="false" :multiple="true" :drag="true" bucket="eci-assets" @success="onSuccess"></Upload>
</template>
