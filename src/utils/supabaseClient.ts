import api from './api';

// Type pour les paramètres de requête
type QueryParams = {
  columns?: string;
  orderBy?: string;
  ascending?: boolean;
  start?: number;
  end?: number;
  match?: Record<string, any>;
  data?: Record<string, any>;
};

// Client Supabase modifié qui utilise notre API interne
class SupabaseClient {
  // Méthode pour créer une requête sur une table
  from(table: string) {
    return {
      // Sélectionner des données
      select: (columns: string = '*') => {
        return {
          order: (orderBy: string, { ascending = true } = {}) => {
            return {
              range: (start: number, end: number) => {
                return this._executeQuery(table, 'select', {
                  columns,
                  orderBy,
                  ascending,
                  start,
                  end,
                });
              },
              eq: (column: string, value: any) => {
                return this._executeQuery(table, 'select', {
                  columns,
                  orderBy,
                  ascending,
                  match: { [column]: value },
                });
              },
              // Exécuter la requête sans filtres supplémentaires
              execute: () => {
                return this._executeQuery(table, 'select', {
                  columns,
                  orderBy,
                  ascending,
                });
              },
            };
          },
          eq: (column: string, value: any) => {
            return this._executeQuery(table, 'select', {
              columns,
              match: { [column]: value },
            });
          },
          // Exécuter la requête sans filtres supplémentaires
          execute: () => {
            return this._executeQuery(table, 'select', { columns });
          },
        };
      },

      // Insérer des données
      insert: (data: Record<string, any>) => {
        return this._executeQuery(table, 'insert', { data });
      },

      // Mettre à jour des données
      update: (data: Record<string, any>) => {
        return {
          match: (match: Record<string, any>) => {
            return this._executeQuery(table, 'update', { data, match });
          },
          eq: (column: string, value: any) => {
            return this._executeQuery(table, 'update', {
              data,
              match: { [column]: value },
            });
          },
        };
      },

      // Supprimer des données
      delete: () => {
        return {
          match: (match: Record<string, any>) => {
            return this._executeQuery(table, 'delete', { match });
          },
          eq: (column: string, value: any) => {
            return this._executeQuery(table, 'delete', {
              match: { [column]: value },
            });
          },
        };
      },

      // Récupérer un seul enregistrement
      single: () => {
        return this._executeQuery(table, 'get', {});
      },
    };
  }

  // Méthode privée pour exécuter la requête via notre API
  private async _executeQuery(
    table: string,
    method: string,
    params: QueryParams
  ) {
    try {
      const response = await api.post('/supabase', {
        table,
        method,
        params,
      });
      return response;
    } catch (error) {
      console.error('Error executing Supabase query:', error);
      return {
        error,
        data: null,
      };
    }
  }
}

// Créer une instance du client
const supabaseClient = new SupabaseClient();

export default supabaseClient; 