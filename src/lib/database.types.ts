// Placeholder database types.
//
// Once your Supabase project exists and is linked, regenerate the real types with:
//   yarn generate-types
// (runs: supabase gen types typescript --linked > src/lib/database.types.ts)
//
// Keeping a minimal stub here lets the app type-check before the project is set up.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
