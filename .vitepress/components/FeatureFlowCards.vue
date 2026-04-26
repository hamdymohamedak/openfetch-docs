<template>
  <section class="of-flow">
    <div class="of-flow__header">
      <p class="of-flow__eyebrow">Visual Runtime</p>
      <h3>One request, many layers</h3>
      <p>
        This quick animation shows what openFetch executes under the hood, from
        config merge to final response.
      </p>
    </div>

    <ol class="of-flow__timeline" aria-label="OpenFetch request lifecycle">
      <li
        v-for="(step, index) in steps"
        :key="step.title"
        class="of-flow__step"
        :style="{ '--of-delay': `${index * 140}ms` }"
      >
        <span class="of-flow__badge">{{ index + 1 }}</span>
        <div class="of-flow__card">
          <h4>{{ step.title }}</h4>
          <p>{{ step.text }}</p>
          <code>{{ step.note }}</code>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    title: "Merge & prepare",
    text: "Defaults + per-request config are merged, then init hooks mutate the final request config.",
    note: "mergeConfig -> init[]",
  },
  {
    title: "Interceptors + middleware",
    text: "Request interceptors run, then middleware wraps dispatch. Retry/cache/debug live here.",
    note: "request interceptors -> middleware",
  },
  {
    title: "Dispatch",
    text: "openFetch builds URL, serializes body, executes fetch, parses data, validates status/schema, then transforms response.",
    note: "dispatch() -> fetch()",
  },
  {
    title: "Finalize response",
    text: "Response interceptors run, errors are normalized, and data is returned (or unwrapped) to your app.",
    note: "response interceptors -> return",
  },
];
</script>
