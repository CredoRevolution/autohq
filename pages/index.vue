<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({ title: 'Dashboard' })

const stats = [
  { label: 'Total Jobs', value: '0', icon: 'i-lucide-briefcase', delta: '' },
  { label: 'Applied', value: '0', icon: 'i-lucide-send', delta: '' },
  { label: 'Interviews', value: '0', icon: 'i-lucide-calendar', delta: '' },
  { label: 'Avg Fit Score', value: '—', icon: 'i-lucide-target', delta: '' },
]
</script>

<template>
  <template #header>
    <span class="text-sm font-medium">Dashboard</span>
  </template>

  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Good morning 👋</h1>
      <p class="text-muted-foreground text-sm mt-1">Here's what's happening with your job search.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl border bg-card p-4 flex flex-col gap-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">{{ stat.label }}</span>
          <span :class="[stat.icon, 'size-4 text-muted-foreground']" />
        </div>
        <span class="text-3xl font-bold">{{ stat.value }}</span>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border bg-card p-4 space-y-3">
        <h2 class="font-semibold text-sm">Recent Jobs</h2>
        <p class="text-sm text-muted-foreground">No jobs yet. <NuxtLink href="/jobs" class="underline underline-offset-2">Browse & add jobs →</NuxtLink></p>
      </div>
      <div class="rounded-xl border bg-card p-4 space-y-3">
        <h2 class="font-semibold text-sm">Automation Status</h2>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="i-lucide-circle-dot size-3 text-yellow-500" />
          n8n not connected yet
        </div>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="i-lucide-circle-dot size-3 text-yellow-500" />
          Telegram bot not configured
        </div>
      </div>
    </div>
  </div>
</template>
