'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const supabase = createClient()

  if (password !== confirmPassword) {
    return redirect('/signup?error=Passwords do not match')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    // options: {
    //   emailRedirectTo: '', // TODO: Add email confirmation redirect
    // },
  })

  if (error) {
    console.error('Signup error:', error.message)
    return redirect('/signup?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
} 