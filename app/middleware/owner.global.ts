// Owner-gate. @nuxtjs/supabase пускает ЛЮБОГО, кто прошёл GitHub OAuth.
// Этот middleware дополнительно проверяет, что залогинился именно владелец,
// и разлогинивает всех остальных. Без него любой GitHub-аккаунт попадает
// в данные владельца (профиль, резюме, вакансии).
export default defineNuxtRouteMiddleware((to) => {
  // Страницы потока авторизации пропускаем всегда
  if (to.path === '/login' || to.path === '/confirm') return

  const user = useSupabaseUser()
  // Не залогинен — пусть @nuxtjs/supabase сам редиректит на /login
  if (!user.value) return

  const owner = useRuntimeConfig().public.ownerGithub
  // Гейт не настроен — не блокируем (например, локальный dev)
  if (!owner) return

  const meta = user.value.user_metadata ?? {}
  const login = (meta.user_name ?? meta.preferred_username) as string | undefined

  // Логины GitHub регистронезависимы — сравниваем в нижнем регистре
  if (login?.toLowerCase() !== owner.toLowerCase()) {
    if (import.meta.client) {
      // Чужой аккаунт — рвём сессию
      useSupabaseClient().auth.signOut()
    }
    return navigateTo('/login?denied=1')
  }
})
