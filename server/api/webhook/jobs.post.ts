import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const authHeader = getHeader(event, 'x-webhook-secret')
  if (authHeader !== config.webhookSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  if (!body?.title || !body?.company) {
    throw createError({ statusCode: 400, message: 'title and company are required' })
  }

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey || config.public.supabaseKey,
  )

  const { data, error } = await supabase.from('jobs').insert({
    title: String(body.title),
    company: String(body.company),
    url: body.url ? String(body.url) : null,
    location: body.location ? String(body.location) : null,
    remote: Boolean(body.remote ?? false),
    status: body.status ?? 'new',
    fit_score: body.fit_score ? Number(body.fit_score) : null,
    salary_min: body.salary_min ? Number(body.salary_min) : null,
    salary_max: body.salary_max ? Number(body.salary_max) : null,
    notes: body.notes ? String(body.notes) : null,
  }).select('id').single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { ok: true, id: data.id }
})
