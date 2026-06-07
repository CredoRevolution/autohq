import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.NUXT_PUBLIC_SUPABASE_KEY

  if (!url || !key) {
    return { error: 'env missing', hasUrl: !!url, hasKey: !!key }
  }

  try {
    const sb = createClient(url, key)
    const { data, error } = await sb.from('jobs').select('id').limit(1)
    return {
      ok: !error,
      error: error?.message ?? null,
      rowCount: data?.length ?? 0,
      urlPrefix: url.slice(0, 30),
      keyPrefix: key.slice(0, 15),
    }
  }
  catch (e: any) {
    return { ok: false, thrown: e?.message ?? String(e) }
  }
})
