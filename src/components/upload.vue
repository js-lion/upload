<script setup lang="ts">
/**
 * @file 文件上传
 * @author svon.me@gmail.com
 */

import {ref} from "vue"
import FileBox from "./file.vue";
import {onUploadFile} from "./config";
import {Space, Button} from "ant-design-vue";
import {CloudUploadOutlined} from "@ant-design/icons-vue";

import type {PropType} from "vue";
import type {AcceptFun} from "./accept";
import type {Result} from "../util/upload/res";

const $emit = defineEmits(["success", "update:loading", "change", "abnormal"]);
const props = defineProps({
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
  // 用于控制外层的 loading 状态
  loading: {
    type: Boolean,
    required: false,
    default: () => false
  },
  disabled: {
    type: Boolean,
    required: false,
    default: () => false
  },
  drag: {
    type: Boolean,
    required: false,
    default: () => false
  },
  // 单个文件大小限制, 单位 M
  maxSize: {
    type: Number,
    required: false,
    default: () => 0, // 0 表示无限制
  },
  // 启用多文件时, 文件数量上线
  limit: {
    type: Number,
    required: false,
    default: () => 0, // 0 表示无限制
  },
  bucket: {
    type: String,
    required: true,
  }
})

const fileRef = ref();
const dragenter = ref(false);
const uuid = ref<number>(Math.random());

const onChange = function (file: File, progress: number, data?: Result) {
  $emit("change", file, progress, data);
}

const onUpload = async function (value: File[]) {
  $emit("update:loading", true);
  try {
    const res: Result[] = await onUploadFile(props, value, onChange);
    $emit("success", res);
  } catch (e) {
    // 异常
    $emit("abnormal", e);
  }
  uuid.value = Math.random();
  setTimeout(function () {
    $emit("update:loading", false);
  }, 300);
}

const onClick = function () {
  if (fileRef.value) {
    fileRef.value.FileDialogBox();
  }
}

const onDragenter = function () {
  dragenter.value = true;
}

const onDrop = function (e: Event) {
  dragenter.value = false;
  if (props.drag) {
    // 如果当前为禁止上传
    if (props.disabled) {
      return false;
    }
    // 获取拖拽的文件并上传文件
    // @ts-ignore
    const dt = e.dataTransfer;
    const files = dt.files;
    onUpload(files);
  }
}

const onDragOver = function () {
  dragenter.value = false;
}

const onDragLeave = function () {
  dragenter.value = true;
};


</script>

<template>
  <div @dragenter.prevent="onDragenter" @drop.prevent="onDrop" @dragover.prevent="onDragOver" @dragleave="onDragLeave">
    <label>
      <FileBox ref="fileRef" :disabled="disabled" :accept="accept" :multiple="multiple" :key="uuid"
               @change="onUpload"></FileBox>
    </label>
    <div @click.stop.prevent="onClick">
      <slot :dragenter="drag ? dragenter : false" :disabled="disabled">
        <Button :disabled="disabled">
          <Space>
            <CloudUploadOutlined/>
            <span>文件上传</span>
          </Space>
        </Button>
      </slot>
    </div>
  </div>
</template>
