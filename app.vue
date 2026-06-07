<script setup lang="ts">
useHead({
  titleTemplate: '%s — AutoHQ',
  htmlAttrs: { lang: 'en' },
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
