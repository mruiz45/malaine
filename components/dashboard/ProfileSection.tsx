'use client';

import { Tables } from '@/lib/database.types';

type Profile = Tables<'profiles'> & { email: string | undefined };

interface ProfileSectionProps {
  user: Profile;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-gray-800">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-gray-800 capitalize">{user.role}</p>
        </div>
        {user.role === 'admin' && (
           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
             Admin
           </span>
        )}
      </div>
    </div>
  );
}
