<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

definePageMeta({ layout: 'default' })
useHead({ title: 'Profile & CV' })

const supabase = useSupabaseClient()
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  title: '',
  location: '',
  email: '',
  github: '',
  linkedin: '',
  summary: '',
  skills: '',
  experience: '',
  languages: '',
  salary_expectation: '',
})

onMounted(async () => {
  const { data } = await supabase.from('profile').select('*').eq('id', 1).single()
  if (data) Object.assign(form, data)
})

async function save() {
  saving.value = true
  error.value = ''
  saved.value = false
  const { error: err } = await supabase.from('profile').upsert({ id: 1, ...form })
  saving.value = false
  if (err) { error.value = err.message; return }
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <div class="max-w-xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Profile & CV</h1>
      <p class="text-muted-foreground text-sm mt-1">Данные используются для генерации сопроводительных писем.</p>
    </div>

    <div class="rounded-xl border bg-card p-6 space-y-4">
      <p class="text-sm font-semibold">Основное</p>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Имя</label>
          <Input v-model="form.name" placeholder="Александр" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Должность</label>
          <Input v-model="form.title" placeholder="Full-Stack Developer" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Email</label>
          <Input v-model="form.email" type="email" placeholder="you@example.com" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Локация</label>
          <Input v-model="form.location" placeholder="Брест, Беларусь (Remote)" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">GitHub</label>
          <Input v-model="form.github" placeholder="github.com/username" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">LinkedIn</label>
          <Input v-model="form.linkedin" placeholder="linkedin.com/in/username" />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">Зарплатные ожидания</label>
        <Input v-model="form.salary_expectation" placeholder="$3000–5000/мес, remote" />
      </div>
    </div>

    <div class="rounded-xl border bg-card p-6 space-y-4">
      <p class="text-sm font-semibold">CV контент</p>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">Summary / О себе</label>
        <textarea
          v-model="form.summary"
          rows="4"
          placeholder="Full-stack developer с 5+ годами опыта в Vue/Nuxt, Node.js..."
          class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">Навыки (через запятую)</label>
        <textarea
          v-model="form.skills"
          rows="3"
          placeholder="Vue 3, Nuxt 4, TypeScript, Node.js, PostgreSQL, Docker, Git..."
          class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">Опыт работы</label>
        <textarea
          v-model="form.experience"
          rows="5"
          placeholder="AIScreen — Full-Stack Developer (2024–н.в.)&#10;Разработка AI-powered приложений..."
          class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">Языки</label>
        <Input v-model="form.languages" placeholder="Русский (родной), Английский (B2)" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

    <Button :disabled="saving" @click="save">
      <Icon v-if="saving" name="lucide:loader-circle" class="size-4 mr-1 animate-spin" />
      <Icon v-else-if="saved" name="lucide:check" class="size-4 mr-1" />
      <Icon v-else name="lucide:save" class="size-4 mr-1" />
      {{ saving ? 'Сохраняю…' : saved ? 'Сохранено!' : 'Сохранить профиль' }}
    </Button>
  </div>
</template>
