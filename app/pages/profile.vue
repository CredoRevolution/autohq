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
  return [...new Set(raw.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean))]
}
function addSkill() {
  for (const p of parseSkills(skillInput.value)) {
    if (!skills.value.some(s => s.toLowerCase() === p.toLowerCase())) skills.value.push(p)
  }
  skillInput.value = ''
}
function onSkillKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }
  else if (e.key === 'Backspace' && !skillInput.value && skills.value.length) skills.value.pop()
}
function removeSkill(i: number) { skills.value.splice(i, 1) }

function exportCsv() {
  const blob = new Blob([skills.value.join(',\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'autohq-skills.csv'; a.click()
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
  saving.value = true; error.value = ''; saved.value = false
  if (skillInput.value.trim()) addSkill()
  const payload = { ...form, skills: skills.value.join(', ') }
  const { error: err } = await supabase.from('profile').upsert({ id: 1, ...payload })
  saving.value = false
  if (err) { error.value = err.message; return }
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function printCv() { window.print() }

// derived contact links for the preview
const contacts = computed(() => [
  { icon: 'lucide:mail', value: form.email },
  { icon: 'lucide:map-pin', value: form.location },
  { icon: 'lucide:github', value: form.github },
  { icon: 'lucide:linkedin', value: form.linkedin },
].filter(c => c.value))

const experienceBlocks = computed(() =>
  form.experience.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)
)

const textareaClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none'
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3 no-print">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Profile & CV</h1>
        <p class="text-muted-foreground text-sm mt-1">Слева — данные (питают AI-письма и скоринг). Справа — живое превью резюме.</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="printCv">
          <Icon name="lucide:printer" class="size-4 mr-1.5" /> Печать / PDF
        </Button>
        <Button :disabled="saving" @click="save">
          <Icon v-if="saving" name="lucide:loader-circle" class="size-4 mr-1.5 animate-spin" />
          <Icon v-else-if="saved" name="lucide:check" class="size-4 mr-1.5" />
          <Icon v-else name="lucide:save" class="size-4 mr-1.5" />
          {{ saving ? 'Сохраняю…' : saved ? 'Сохранено!' : 'Сохранить' }}
        </Button>
      </div>
    </div>

    <p v-if="error" class="text-sm text-destructive no-print">{{ error }}</p>

    <div class="grid gap-6 lg:grid-cols-2 lg:items-start">

      <!-- ── EDITOR ────────────────────────── -->
      <div class="space-y-4 no-print">
        <div class="surface p-5 space-y-4">
          <p class="text-sm font-semibold flex items-center gap-2"><Icon name="lucide:user" class="size-4 text-primary" /> Основное</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-1.5"><label class="text-xs font-medium text-muted-foreground">Имя</label><Input v-model="form.name" placeholder="Александр" /></div>
            <div class="space-y-1.5"><label class="text-xs font-medium text-muted-foreground">Должность</label><Input v-model="form.title" placeholder="Full-Stack Developer" /></div>
            <div class="space-y-1.5"><label class="text-xs font-medium text-muted-foreground">Email</label><Input v-model="form.email" type="email" placeholder="you@example.com" /></div>
            <div class="space-y-1.5"><label class="text-xs font-medium text-muted-foreground">Локация</label><Input v-model="form.location" placeholder="Брест, Беларусь (Remote)" /></div>
            <div class="space-y-1.5"><label class="text-xs font-medium text-muted-foreground">GitHub</label><Input v-model="form.github" placeholder="github.com/username" /></div>
            <div class="space-y-1.5"><label class="text-xs font-medium text-muted-foreground">LinkedIn</label><Input v-model="form.linkedin" placeholder="linkedin.com/in/username" /></div>
          </div>
          <div class="space-y-1.5"><label class="text-xs font-medium text-muted-foreground">Зарплатные ожидания</label><Input v-model="form.salary_expectation" placeholder="$3000–5000/мес, remote" /></div>
        </div>

        <!-- Skills -->
        <div class="surface p-5 space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold flex items-center gap-2">
              <Icon name="lucide:wand-sparkles" class="size-4 text-primary" /> Навыки
              <span class="text-xs font-normal text-muted-foreground">({{ skills.length }})</span>
            </p>
            <div class="flex items-center gap-1">
              <input ref="fileInput" type="file" accept=".csv,text/csv,text/plain" class="hidden" @change="importCsv" />
              <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" @click="fileInput?.click()"><Icon name="lucide:upload" class="size-3.5 mr-1" /> Импорт</Button>
              <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" :disabled="!skills.length" @click="exportCsv"><Icon name="lucide:download" class="size-3.5 mr-1" /> CSV</Button>
            </div>
          </div>
          <div class="rounded-md border bg-background p-2 focus-within:ring-2 focus-within:ring-ring/50 transition-shadow">
            <div class="flex flex-wrap gap-1.5">
              <span v-for="(skill, i) in skills" :key="skill + i"
                class="inline-flex items-center gap-1 rounded-md bg-primary/12 text-primary border border-primary/20 px-2 py-0.5 text-xs font-medium">
                {{ skill }}
                <button type="button" class="hover:text-foreground/70 transition-colors" @click="removeSkill(i)"><Icon name="lucide:x" class="size-3" /></button>
              </span>
              <input v-model="skillInput" @keydown="onSkillKey" @blur="addSkill"
                :placeholder="skills.length ? 'Добавить…' : 'Vue 3, Nuxt, TypeScript… (Enter)'"
                class="flex-1 min-w-[120px] bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground" />
            </div>
          </div>
        </div>

        <!-- CV content -->
        <div class="surface p-5 space-y-4">
          <p class="text-sm font-semibold flex items-center gap-2"><Icon name="lucide:file-text" class="size-4 text-primary" /> CV контент</p>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Summary / О себе</label>
            <textarea v-model="form.summary" rows="4" placeholder="Full-stack developer с 5+ годами опыта…" :class="textareaClass" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Опыт работы <span class="opacity-60">(пустая строка разделяет блоки)</span></label>
            <textarea v-model="form.experience" rows="6" placeholder="AIScreen — Full-Stack Developer (2024–н.в.)&#10;Разработка AI-приложений…&#10;&#10;Freelance — Web Developer (2021–2024)&#10;…" :class="textareaClass" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Языки</label>
            <Input v-model="form.languages" placeholder="Русский (родной), Английский (B2)" />
          </div>
        </div>
      </div>

      <!-- ── LIVE CV PREVIEW (paper sheet) ──── -->
      <div class="lg:sticky lg:top-6">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 no-print">Превью резюме</p>
        <div class="cv-sheet rounded-xl border bg-white text-zinc-900 shadow-xl p-8 sm:p-10">
          <!-- Header -->
          <header class="border-b border-zinc-200 pb-4">
            <h2 class="text-2xl font-bold tracking-tight">{{ form.name || 'Ваше имя' }}</h2>
            <p class="text-base text-zinc-500 mt-0.5">{{ form.title || 'Должность' }}</p>
            <div v-if="contacts.length" class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
              <span v-for="c in contacts" :key="c.value" class="inline-flex items-center gap-1">
                <Icon :name="c.icon" class="size-3.5 text-zinc-400" /> {{ c.value }}
              </span>
            </div>
          </header>

          <!-- Summary -->
          <section v-if="form.summary" class="mt-5">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">О себе</h3>
            <p class="text-sm leading-relaxed text-zinc-700 whitespace-pre-line">{{ form.summary }}</p>
          </section>

          <!-- Skills -->
          <section v-if="skills.length" class="mt-5">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Навыки</h3>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="s in skills" :key="s" class="rounded border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">{{ s }}</span>
            </div>
          </section>

          <!-- Experience -->
          <section v-if="experienceBlocks.length" class="mt-5">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Опыт</h3>
            <div class="space-y-3">
              <p v-for="(block, i) in experienceBlocks" :key="i" class="text-sm leading-relaxed text-zinc-700 whitespace-pre-line">{{ block }}</p>
            </div>
          </section>

          <!-- Languages -->
          <section v-if="form.languages" class="mt-5">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Языки</h3>
            <p class="text-sm text-zinc-700">{{ form.languages }}</p>
          </section>

          <p v-if="!form.name && !form.summary && !skills.length" class="text-sm text-zinc-400 text-center py-8">
            Заполни поля слева — резюме появится здесь.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>
