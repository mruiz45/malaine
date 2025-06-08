'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error.message)
    // Optionally handle error, e.g., redirect with an error message
    redirect('/dashboard?error=Could not log out')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateLanguagePreference(formData: FormData) {
  const language = formData.get('language') as string
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not found')
    return { error: 'User not found' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ language_preference: language })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating language preference:', error)
    return { error: 'Error updating language preference' }
  }

  revalidatePath('/dashboard')
  return { success: true }
} 