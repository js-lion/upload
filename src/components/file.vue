<script setup lang="ts">
/**
 * @file 文件对话框
 * @author svon.me@gmail.com
 */

import {ref} from "vue";
import {getAcceptValue} from "./config";

import type {PropType} from "vue";
import type {AcceptFun} from "./accept";

const $emit = defineEmits(["change"]);
defineProps({
  // 是否多选，默认单选
  multiple: {
    type: Boolean,
    required: false,
    default: () => false
  },
  // 文件格式限制
  accept: {
    default: "*",
    required: false,
    type: [String, Function] as PropType<string | AcceptFun>
  },
  disabled: {
    type: Boolean,
    required: false,
    default: () => false
  },
})

const fileInput = ref();

const onSelectFile = function (e: Event) {
  const dom = e.target as HTMLInputElement;
  const files = dom.files;
  if (files && files.length > 0) {
    $emit("change", files);
  }
};

const FileDialogBox = function () {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

defineExpose({FileDialogBox});

</script>

<template>
  <template v-if="!disabled&&multiple">
    <input type="file" ref="fileInput" :accept="getAcceptValue(accept)" multiple
           style="display: none"
           @input.stop.prevent
           @change.stop.prevent="onSelectFile">
  </template>
  <template v-else-if="!disabled">
    <input type="file" ref="fileInput" :accept="getAcceptValue(accept)" style="display: none"
           @input.stop.prevent
           @change.stop.prevent="onSelectFile">
  </template>
</template>