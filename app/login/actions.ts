'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // TODO: Improve error handling to return message to the form
    console.error('Login error:', error.message)
    return redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
} 