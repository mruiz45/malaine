import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { message } from 'antd';
import { getRolesList } from '@/services/userService';
import { UserPhysicalRole } from '@/models/UserPhysicalRole';
import { RoleTypes, RoleNames } from '@/lib/types';

interface AuthContextType {
  user: any;
  accessToken: string | undefined;
  refreshToken: string | undefined;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: any) => void;
  siteIds: number[];
  setSiteIds: (siteIds: number[]) => void;
  partnerIds: number[];
  setPartnerIds: (partnerIds: number[]) => void;
  roles: UserPhysicalRole[];
  getSitesByPartner: (partnerId: number) => { siteIds: number[], accessTypes: string[] };
  getPartnersAccess: () => { partnerId: number, accessTypes: string[] }[];
  initializeAuth: () => Promise<void>;
  isSystemAdmin: boolean;
  isSystemSuperAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: undefined,
  refreshToken: undefined,
  loading: true,
  signOut: async () => { },
  setUser: () => { },
  siteIds: [],
  setSiteIds: () => { },
  partnerIds: [],
  setPartnerIds: () => { },
  roles: [],
  getSitesByPartner: () => ({ siteIds: [], accessTypes: [] }),
  getPartnersAccess: () => [],
  initializeAuth: async () => { },
  isSystemAdmin: false,
  isSystemSuperAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(undefined);
  const [siteIds, setSiteIds] = useState<number[]>([]);
  const [partnerIds, setPartnerIds] = useState<number[]>([]);
  const [roles, setRoles] = useState<UserPhysicalRole[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isSystemAdminState, setIsSystemAdmin] = useState(false);
  const [isSuperAdminState, setIsSuperAdmin] = useState(false);

  const initializeAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/session', { method: 'GET' });
      const result = await response.json();

      if (response.ok && result.user) {
        setUser(result.user);
        setAccessToken(Cookies.get('access_token'));
        setRefreshToken(Cookies.get('refresh_token'));

        // Retrieve the list of roles for the user
        const rolesList: UserPhysicalRole[] = await getRolesList(result.user.id);
        setRoles(rolesList);
        console.log('Roles for user:', rolesList);

        // Safely derive the list of site IDs from the roles (filtering out null values)
        // Add null check to prevent TypeError if rolesList is undefined
        const sites = Array.isArray(rolesList) 
          ? rolesList.map(role => role.site_id).filter(id => id !== null) as number[]
          : [];
        setSiteIds(sites);

        // Safely derive the list of partner IDs from the roles (filtering out null values)
        // Add null check to prevent TypeError if rolesList is undefined
        const partners = Array.isArray(rolesList)
          ? rolesList.map(role => role.partner_id).filter(id => id !== null) as number[]
          : [];
        setPartnerIds(partners);

        // Check if the user has the role of system admin or super admin
        // Add null check to prevent TypeError if rolesList is undefined
        const isSystemAdmin = Array.isArray(rolesList) && rolesList.some(role => 
          role.role_type === RoleTypes.SYSTEM && role.role_name === RoleNames.ADMIN);
        const isSuperAdmin = Array.isArray(rolesList) && rolesList.some(role => 
          role.role_type === RoleTypes.SYSTEM && role.role_name === RoleNames.SUPER_ADMIN);
        setIsSystemAdmin(isSystemAdmin);
        setIsSuperAdmin(isSuperAdmin);

        // A system admin or super admin can access all sites and partners
        if (isSystemAdmin || isSuperAdmin) {
          setSiteIds([-1]);
          setPartnerIds([-1]);
        }

        // Redirect user based on role
        if (router.pathname === '/') {
          if (isSystemAdmin || isSuperAdmin) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        try {
          await fetch('/api/auth/signout', { method: 'POST' });
        } catch (signOutError) {
          console.error('Sign out error during auth failure:', signOutError);
        } finally {
          Cookies.remove('supabase-auth-token');
          setUser(null);
          setAccessToken(undefined);
          setRefreshToken(undefined);
          setSiteIds([]);
          setPartnerIds([]);
          setRoles([]);
          setIsSystemAdmin(false);
          setIsSuperAdmin(false);
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Authentication initialization error:', error);
      try {
        await fetch('/api/auth/signout', { method: 'POST' });
      } catch (signOutError) {
        console.error('Sign out error during auth failure:', signOutError);
      } finally {
        Cookies.remove('supabase-auth-token');
        setUser(null);
        setAccessToken(undefined);
        setRefreshToken(undefined);
        setSiteIds([]);
        setPartnerIds([]);
        setRoles([]);
        setIsSystemAdmin(false);
        setIsSuperAdmin(false);
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (response.ok) {
        Cookies.remove('supabase-auth-token');
        setUser(null);
        setAccessToken(undefined);
        setRefreshToken(undefined);
        setSiteIds([]);
        setPartnerIds([]);
        setRoles([]);
        setIsSystemAdmin(false);
        setIsSuperAdmin(false);
        router.push('/');
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Failed to sign out');
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      message.error('Failed to sign out');
    }
  };

  // Utility function to get site IDs and access types for a specific partner
  const getSitesByPartner = (partnerId: number): { siteIds: number[], accessTypes: string[] } => {
    // Filter roles that match the given partnerId and have a valid site_id
    const rolesForPartner = roles.filter(role => role.partner_id === partnerId && role.site_id !== null);
    // Extract unique site IDs
    const siteIdsForPartner = Array.from(new Set(rolesForPartner.map(role => role.site_id as number)));
    // Extract unique access types based on the role name
    const accessTypesForPartner = Array.from(new Set(rolesForPartner.map(role => role.role_name)));
    return { siteIds: siteIdsForPartner, accessTypes: accessTypesForPartner };
  };

  // Utility function to get access information for all partners
  const getPartnersAccess = (): { partnerId: number, accessTypes: string[] }[] => {
    // Get unique partner IDs from roles (ignoring nulls)
    const uniquePartners = Array.from(new Set(roles.map(role => role.partner_id).filter(id => id !== null))) as number[];
    return uniquePartners.map(pid => {
      const rolesForPartner = roles.filter(role => role.partner_id === pid);
      const accessTypes = Array.from(new Set(rolesForPartner.map(role => role.role_name)));
      return { partnerId: pid, accessTypes };
    });
  };

  const isSystemAdmin = isSystemAdminState;
  const isSystemSuperAdmin = isSuperAdminState;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        signOut,
        setUser,
        initializeAuth,
        siteIds,
        setSiteIds,
        partnerIds,
        setPartnerIds,
        roles,
        getSitesByPartner,
        getPartnersAccess,
        isSystemAdmin,
        isSystemSuperAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);