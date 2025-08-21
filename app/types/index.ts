// @/types/index.ts
export interface Project {
  id: string;
  author_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  updated_at: string | null;
  created_at: string;
  group_id: string | null;
  content: any; // JSONB data
}
