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

// ── Skills as chips ──────────────────────────
const skills = ref<string[]>([])
const skillInput = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function parseSkills(raw: string): string[] {
  return [...new Set(
    raw.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean)
  )]
}

function addSkill() {
  const parts = parseSkills(skillInput.value)
  for (const p of parts) {
    if (!skills.value.some(s => s.toLowerCase() === p.toLowerCase())) skills.value.push(p)
  }
  skillInput.value = ''
}
function onSkillKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addSkill()
  } else if (e.key === 'Backspace' && !skillInput.value && skills.value.length) {
    skills.value.pop()
  }
}
function removeSkill(i: number) {
  skills.value.splice(i, 1)
}

function exportCsv() {
  const csv = skills.value.join(',\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'autohq-skills.csv'
  a.click()
  URL.revokeObjectURL(url)
}
function importCsv(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    for (const p of parseSkills(String(reader.result ?? ''))) {
      if (!skills.value.some(s => s.toLowerCase() === p.toLowerCase())) skills.value.push(p)
    }
  }
  reader.readAsText(file)
  ;(e.target as HTMLInputElement).value = ''
}

onMounted(async () => {
  const { data } = await supabase.from('profile').select('*').eq('id', 1).single()
  if (data) {
    Object.assign(form, data)
    skills.value = parseSkills(data.skills ?? '')
  }
})

async function save() {
  saving.value = true
  error.value = ''
  saved.value = false
  if (skillInput.value.trim()) addSkill()
  const payload = { ...form, skills: skills.value.join(', ') }
  const { error: err } = await supabase.from('profile').upsert({ id: 1, ...payload })
  saving.value = false
  if (err) { error.value = err.message; return }
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

const textareaClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none'
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Profile & CV</h1>
      <p class="text-muted-foreground text-sm mt-1">Эти данные питают AI-генерацию сопроводительных писем и скоринг.</p>
    </div>

    <!-- Basics -->
    <div class="surface p-6 space-y-4">
      <p class="text-sm font-semibold flex items-center gap-2">
        <Icon name="lucide:user" class="size-4 text-primary" /> Основное
      </p>

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

    <!-- Skills -->
    <div class="surface p-6 space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold flex items-center gap-2">
          <Icon name="lucide:wand-sparkles" class="size-4 text-primary" /> Навыки
          <span class="text-xs font-normal text-muted-foreground">({{ skills.length }})</span>
        </p>
        <div class="flex items-center gap-1">
          <input ref="fileInput" type="file" accept=".csv,text/csv,text/plain" class="hidden" @change="importCsv" />
          <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" @click="fileInput?.click()">
            <Icon name="lucide:upload" class="size-3.5 mr-1" /> Импорт
          </Button>
          <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" :disabled="!skills.length" @click="exportCsv">
            <Icon name="lucide:download" class="size-3.5 mr-1" /> Экспорт CSV
          </Button>
        </div>
      </div>

      <div class="rounded-md border bg-background p-2 focus-within:ring-2 focus-within:ring-ring/50 transition-shadow">
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(skill, i) in skills"
            :key="skill + i"
            class="inline-flex items-center gap-1 rounded-md bg-primary/12 text-primary border border-primary/20 px-2 py-0.5 text-xs font-medium"
          >
            {{ skill }}
            <button type="button" class="hover:text-foreground/70 transition-colors" @click="removeSkill(i)">
              <Icon name="lucide:x" class="size-3" />
            </button>
          </span>
          <input
            v-model="skillInput"
            @keydown="onSkillKey"
            @blur="addSkill"
            :placeholder="skills.length ? 'Добавить…' : 'Vue 3, Nuxt, TypeScript… (Enter)'"
            class="flex-1 min-w-[120px] bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <p class="text-xs text-muted-foreground">Enter или запятая — добавить. Backspace на пустом поле — удалить последний. CSV — список через запятую/перенос строки.</p>
    </div>

    <!-- CV content -->
    <div class="surface p-6 space-y-4">
      <p class="text-sm font-semibold flex items-center gap-2">
        <Icon name="lucide:file-text" class="size-4 text-primary" /> CV контент
      </p>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">Summary / О себе</label>
        <textarea v-model="form.summary" rows="4"
          placeholder="Full-stack developer с 5+ годами опыта в Vue/Nuxt, Node.js…" :class="textareaClass" />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">Опыт работы</label>
        <textarea v-model="form.experience" rows="5"
          placeholder="AIScreen — Full-Stack Developer (2024–н.в.)&#10;Разработка AI-powered приложений…" :class="textareaClass" />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">Языки</label>
        <Input v-model="form.languages" placeholder="Русский (родной), Английский (B2)" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

    <div class="sticky bottom-4 flex justify-end">
      <Button :disabled="saving" @click="save" class="shadow-lg">
        <Icon v-if="saving" name="lucide:loader-circle" class="size-4 mr-1.5 animate-spin" />
        <Icon v-else-if="saved" name="lucide:check" class="size-4 mr-1.5" />
        <Icon v-else name="lucide:save" class="size-4 mr-1.5" />
        {{ saving ? 'Сохраняю…' : saved ? 'Сохранено!' : 'Сохранить профиль' }}
      </Button>
    </div>
  </div>
</template>
