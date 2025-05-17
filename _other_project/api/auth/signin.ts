   // admin/src/pages/api/auth/signin.ts
   import type { NextApiRequest, NextApiResponse } from 'next';
   import { supabaseServer } from '@/lib/supabaseServer';
   import { serialize } from 'cookie';

   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === 'POST') {
       const { email, password } = req.body;

       const { data, error } = await supabaseServer.auth.signInWithPassword({
         email,
         password,
       });

       if (error) {
         return res.status(400).json({ error: error.message });
       }

       // Set the 'access_token' and 'refresh_token' cookies
       const accessTokenCookie = serialize('access_token', data.session.access_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         path: '/',
         maxAge: data.session.expires_in, // Adjust as needed
       });

       const refreshTokenCookie = serialize('refresh_token', data.session.refresh_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         path: '/',
         maxAge: 60 * 60 * 24 * 30, // Example: 30 days
       });

       res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
       return res.status(200).json({ user: data.user, session: data.session });
     } else {
       res.setHeader('Allow', ['POST']);
       res.status(405).end(`Method ${req.method} Not Allowed`);
     }
   }