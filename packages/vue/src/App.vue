<script setup lang="ts">
import { ref } from "vue";
import IvyTour from "./components/tour";

const elRef = ref<any>(null);

const open = () => {
  if (elRef.value) {
    elRef.value.open();
  }
};

const steps = ref([
  {
    target: "#copy",
    title: "我是标题",
    content: "这是 copy 的内容",
    placement: "right",
  },
  {
    target: "#cute",
    title: "我是标题",
    content: "这是 cute 的内容",
    placement: "bottom",
  },
  {
    target: "#paste",
    title: "我是标题",
    content: "这是 paste 的内容",
    placement: "right",
  },
  {
    target: "#paste1",
    title: "我是标题",
    content: "这是 paste 的内容",
    placement: "left",
  },
  {
    target: ".tour-1",
    title: "我是标题",
    content: "这是 paste 的内容",
    placement: "top",
  },
]);
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <div>
    <div>
      <button @click="open">打开 Tour</button>
    </div>
    <div style="height: 20vh; padding-left: 10vw">
      <button id="copy">复制</button>
      <button id="paste">粘贴</button>
      <button id="paste1">粘贴 1</button>
    </div>
    <div style="height: 40vh; padding-left: 10vw">
      <button id="cute">剪切</button>
    </div>
    <div style="height: 40vh; padding-left: 10vw">
      <p>这是类容，为了出现滚动条</p>
    </div>
    <div style="height: 40vh; padding-left: 10vw">
      <button class="tour-1">类选择器-1</button>
    </div>
  </div>

  <ivy-tour :steps="steps" ref="elRef" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
