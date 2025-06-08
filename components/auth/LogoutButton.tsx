'use client'

import { logout } from '@/app/dashboard/actions'
import { useTranslation } from 'react-i18next'

export default function LogoutButton() {
  const { t } = useTranslation()

  return (
    <form action={logout}>
      <button
        type="submit"
        className="py-2 px-4 rounded-md no-underline bg-red-500 hover:bg-red-600 text-white"
      >
        {t('logout_button')}
      </button>
    </form>
  )
} 