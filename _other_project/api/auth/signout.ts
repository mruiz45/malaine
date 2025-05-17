   // admin/src/pages/api/auth/signout.ts
   import type { NextApiRequest, NextApiResponse } from 'next';
   import { supabaseServer } from '@/lib/supabaseServer';
   import { serialize } from 'cookie';

   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === 'POST') {
       const { error } = await supabaseServer.auth.signOut();
       if (error) {
         return res.status(400).json({ error: error.message });
       }

       // Clear the 'access_token' and 'refresh_token' cookies
       const accessTokenCookie = serialize('access_token', '', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         path: '/',
         expires: new Date(0),
       });

       const refreshTokenCookie = serialize('refresh_token', '', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         path: '/',
         expires: new Date(0),
       });

       res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
       return res.status(200).json({ message: 'Signed out successfully' });
     } else {
       res.setHeader('Allow', ['POST']);
       res.status(405).end(`Method ${req.method} Not Allowed`);
     }
   }