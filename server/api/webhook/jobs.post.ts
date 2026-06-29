import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const secret = process.env.WEBHOOK_SECRET || process.env.NUXT_WEBHOOK_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, message: 'WEBHOOK_SECRET is not configured' })
  }

  const authHeader = getHeader(event, 'x-webhook-secret')
  if (authHeader !== secret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  if (!body?.title || !body?.company) {
    throw createError({ statusCode: 400, message: 'title and company are required' })
  }

  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw createError({ statusCode: 500, message: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  let siteEnabled = true
  let telegramEnabled = true

  if (body.source) {
    const { data: settings } = await supabase
      .from('source_settings')
      .select('site_enabled, telegram_enabled')
      .eq('source_id', body.source)
      .single()

    if (settings) {
      siteEnabled = settings.site_enabled
      telegramEnabled = settings.telegram_enabled
    }
  }

  if (!siteEnabled) {
    return { ok: true, skipped: true, telegram_notify: false }
  }

  // Cross-posting dedup with a freshness window.
  // The same vacancy often appears under different URLs (LinkedIn reblogs
  // HH/Djinni, aggregators re-post), so the UNIQUE index on `url` can't catch it
  // — every copy has its own link. We dedup by title + company (case-insensitive).
  //
  // BUT a company may re-open the SAME role months later, and Alex may want to
  // apply to that fresh opening. So we only treat a match as a duplicate if we
  // first saw it within the last DEDUP_WINDOW_DAYS. An older match is considered
  // a genuine re-posting and is allowed back in.
  const DEDUP_WINDOW_DAYS = 30
  const since = new Date(Date.now() - DEDUP_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const escapeLike = (s: string) => s.replace(/[%_\\]/g, '\\$&')
  const { data: existing } = await supabase
    .from('jobs')
    .select('id')
    .ilike('title', escapeLike(String(body.title)))
    .ilike('company', escapeLike(String(body.company)))
    .gte('created_at', since)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return { ok: true, skipped: true, duplicate: true, telegram_notify: false }
  }

  const fitScore = body.fit_score != null ? Number(body.fit_score) : null

  const { data, error } = await supabase.from('jobs').insert({
    title: String(body.title),
    company: String(body.company),
    url: body.url ? String(body.url) : null,
    location: body.location ? String(body.location) : null,
    remote: Boolean(body.remote ?? false),
    status: body.status ?? 'new',
    fit_score: fitScore,
    salary_min: body.salary_min != null ? Number(body.salary_min) : null,
    salary_max: body.salary_max != null ? Number(body.salary_max) : null,
    notes: body.notes ? String(body.notes) : null,
    description: body.description ? String(body.description) : null,
    cover_letter: body.cover_letter ? String(body.cover_letter) : null,
    score_reason: body.score_reason ? String(body.score_reason) : null,
    source: body.source ? String(body.source) : null,
  }).select('id').single()

  if (error) {
    // Duplicate URL — silently skip
    if (error.code === '23505') {
      return { ok: true, skipped: true, telegram_notify: false }
    }
    throw createError({ statusCode: 500, message: error.message })
  }

  // Telegram threshold is a live setting (app_config), default 70
  let minScore = 70
  const { data: cfg } = await supabase
    .from('app_config')
    .select('telegram_min_score')
    .eq('id', 1)
    .single()
  if (cfg?.telegram_min_score != null) minScore = cfg.telegram_min_score

  const scorePassed = fitScore === null || fitScore >= minScore
  return { ok: true, id: data.id, telegram_notify: telegramEnabled && scorePassed }
})
