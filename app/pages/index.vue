<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({ title: 'Dashboard' })

const supabase = useSupabaseClient()

const { data: jobs } = await useAsyncData('dashboard-jobs', async () => {
  const { data } = await supabase
    .from('jobs')
    .select('id, status, fit_score, created_at, title, company')
    .order('created_at', { ascending: false })
  return data ?? []
})

const stats = computed(() => {
  const all = jobs.value ?? []
  const applied = all.filter(j => ['applied', 'interviewing', 'offer'].includes(j.status))
  const interviews = all.filter(j => j.status === 'interviewing')
  const scored = all.filter(j => j.fit_score != null)
  const avgFit = scored.length
    ? Math.round(scored.reduce((s, j) => s + (j.fit_score ?? 0), 0) / scored.length)
    : null

  return [
    { label: 'Total Jobs',    value: String(all.length),       icon: 'lucide:briefcase' },
    { label: 'Applied',       value: String(applied.length),   icon: 'lucide:send' },
    { label: 'Interviews',    value: String(interviews.length), icon: 'lucide:calendar' },
    { label: 'Avg Fit Score', value: avgFit != null ? `${avgFit}%` : '—', icon: 'lucide:target' },
  ]
})

const recent = computed(() => (jobs.value ?? []).slice(0, 5))

const statusClass: Record<string, string> = {
  new:          'bg-blue-500/10 text-blue-500',
  reviewing:    'bg-yellow-500/10 text-yellow-500',
  applied:      'bg-purple-500/10 text-purple-500',
  interviewing: 'bg-orange-500/10 text-orange-500',
  offer:        'bg-green-500/10 text-green-500',
  rejected:     'bg-red-500/10 text-red-500',
  archived:     'bg-gray-500/10 text-gray-400',
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Good morning 👋</h1>
      <p class="text-muted-foreground text-sm mt-1">Here's what's happening with your job search.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="rounded-xl border bg-card p-4 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">{{ stat.label }}</span>
          <Icon :name="stat.icon" class="size-4 text-muted-foreground" />
        </div>
        <span class="text-3xl font-bold">{{ stat.value }}</span>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border bg-card p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-sm">Recent Jobs</h2>
          <NuxtLink href="/jobs" class="text-xs text-muted-foreground underline underline-offset-2">View all</NuxtLink>
        </div>
        <div v-if="recent.length === 0" class="text-sm text-muted-foreground">
          No jobs yet. <NuxtLink href="/jobs/new" class="underline underline-offset-2">Add one →</NuxtLink>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="job in recent"
            :key="job.id"
            class="flex items-center justify-between py-1"
          >
            <div>
              <div class="text-sm font-medium leading-tight">{{ job.title }}</div>
              <div class="text-xs text-muted-foreground">{{ job.company }}</div>
            </div>
            <span :class="['text-xs rounded-full px-2 py-0.5 font-medium', statusClass[job.status]]">
              {{ job.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-4 space-y-3">
        <h2 class="font-semibold text-sm">Automation Status</h2>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="size-2 rounded-full bg-yellow-500 shrink-0" />
            n8n not connected yet
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="size-2 rounded-full bg-yellow-500 shrink-0" />
            Telegram bot not configured
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
