<script setup lang="ts">
import { Button } from '~/components/ui/button'

definePageMeta({ layout: 'default' })
useHead({ title: 'Automations' })

const config = useRuntimeConfig()

const sources = [
  {
    id: 'hh',
    name: 'HH.ru',
    description: 'Вакансии из России и СНГ',
    icon: 'lucide:building-2',
    color: 'text-red-500',
  },
  {
    id: 'remotive',
    name: 'Remotive.com',
    description: 'Международные remote вакансии',
    icon: 'lucide:globe',
    color: 'text-blue-500',
  },
  {
    id: 'remoteok',
    name: 'RemoteOK',
    description: 'Remote-first вакансии по тегам',
    icon: 'lucide:laptop',
    color: 'text-green-500',
  },
]

const steps = [
  { label: 'n8n запускается по расписанию', icon: 'lucide:clock' },
  { label: 'Запрашивает вакансии из источников', icon: 'lucide:search' },
  { label: 'Фильтрует уже добавленные', icon: 'lucide:filter' },
  { label: 'Отправляет новые в AutoHQ', icon: 'lucide:send' },
  { label: 'Уведомляет в Telegram', icon: 'lucide:message-circle' },
]
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Automations</h1>
      <p class="text-muted-foreground text-sm mt-1">n8n workflows автоматически ищут и добавляют вакансии.</p>
    </div>

    <div class="rounded-xl border bg-card p-5 space-y-4">
      <div class="flex items-center gap-2">
        <span class="size-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
        <span class="font-medium text-sm">n8n работает</span>
        <a href="https://n8n.credorevolution.space" target="_blank" rel="noopener" class="ml-auto text-xs text-muted-foreground underline underline-offset-2">
          Открыть n8n →
        </a>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Как это работает</p>
        <div class="space-y-2">
          <div v-for="(step, i) in steps" :key="i" class="flex items-center gap-3 text-sm">
            <div class="size-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
              {{ i + 1 }}
            </div>
            <Icon :name="step.icon" class="size-4 text-muted-foreground shrink-0" />
            <span>{{ step.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <p class="text-sm font-medium">Источники вакансий</p>
      <div class="grid gap-3 sm:grid-cols-3">
        <div v-for="src in sources" :key="src.id" class="rounded-xl border bg-card p-4 space-y-2">
          <Icon :name="src.icon" :class="['size-5', src.color]" />
          <p class="font-medium text-sm">{{ src.name }}</p>
          <p class="text-xs text-muted-foreground">{{ src.description }}</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border bg-card p-5 space-y-3">
      <p class="text-sm font-medium">Webhook endpoint</p>
      <p class="text-xs text-muted-foreground">n8n отправляет вакансии на этот URL:</p>
      <code class="block rounded-md bg-muted px-3 py-2 text-xs font-mono break-all">
        POST https://credorevolution.space/api/webhook/jobs
      </code>
      <p class="text-xs text-muted-foreground">Header: <code class="bg-muted px-1 rounded">x-webhook-secret: autohq-webhook-2026</code></p>
    </div>
  </div>
</template>
