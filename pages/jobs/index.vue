<script setup lang="ts">
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

definePageMeta({ layout: 'default' })
useHead({ title: 'Jobs' })

type JobStatus = 'new' | 'reviewing' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'archived'

interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  status: JobStatus
  fit_score: number | null
  created_at: string
  url: string | null
}

const statusConfig: Record<JobStatus, { label: string; class: string }> = {
  new: { label: 'New', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  reviewing: { label: 'Reviewing', class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  applied: { label: 'Applied', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  interviewing: { label: 'Interview', class: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  offer: { label: 'Offer', class: 'bg-green-500/10 text-green-500 border-green-500/20' },
  rejected: { label: 'Rejected', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
  archived: { label: 'Archived', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
}

const search = ref('')
const statusFilter = ref<string>('all')

const jobs = ref<Job[]>([])
</script>

<template>
  <template #header>
    <span class="text-sm font-medium">Jobs</span>
  </template>

  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Job Tracker</h1>
        <p class="text-muted-foreground text-sm mt-0.5">{{ jobs.length }} jobs tracked</p>
      </div>
      <Button as-child size="sm">
        <NuxtLink href="/jobs/new">
          <span class="i-lucide-plus size-4 mr-1" />
          Add Job
        </NuxtLink>
      </Button>
    </div>

    <div class="flex gap-2">
      <Input
        v-model="search"
        placeholder="Search jobs..."
        class="max-w-sm"
      />
      <Select v-model="statusFilter">
        <SelectTrigger class="w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem v-for="(cfg, key) in statusConfig" :key="key" :value="key">
            {{ cfg.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="jobs.length === 0" class="rounded-xl border border-dashed bg-card p-12 text-center">
      <span class="i-lucide-briefcase size-10 text-muted-foreground mx-auto block mb-3" />
      <p class="font-medium">No jobs yet</p>
      <p class="text-sm text-muted-foreground mt-1 mb-4">Add your first job manually or connect n8n to auto-import.</p>
      <Button size="sm" as-child>
        <NuxtLink href="/jobs/new">Add job</NuxtLink>
      </Button>
    </div>

    <div v-else class="rounded-xl border overflow-hidden">
      <table class="w-full text-sm">
        <thead class="border-b bg-muted/30">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Position</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Fit</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Added</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="job in jobs"
            :key="job.id"
            class="border-b last:border-0 hover:bg-muted/20 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="font-medium">{{ job.title }}</div>
              <div class="text-muted-foreground text-xs">{{ job.company }}</div>
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ job.remote ? '🌍 Remote' : job.location }}
            </td>
            <td class="px-4 py-3">
              <span
                :class="['inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', statusConfig[job.status].class]"
              >
                {{ statusConfig[job.status].label }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span v-if="job.fit_score" class="font-medium">{{ job.fit_score }}%</span>
              <span v-else class="text-muted-foreground">—</span>
            </td>
            <td class="px-4 py-3 text-muted-foreground text-xs">
              {{ new Date(job.created_at).toLocaleDateString() }}
            </td>
            <td class="px-4 py-3">
              <Button variant="ghost" size="sm" as-child>
                <NuxtLink :href="`/jobs/${job.id}`">View</NuxtLink>
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
