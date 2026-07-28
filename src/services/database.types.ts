export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: string;
          ward: string;
          avatar_url: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string;
          role?: string;
          ward?: string;
          avatar_url?: string;
          active?: boolean;
        };
        Update: {
          email?: string;
          full_name?: string;
          phone?: string;
          role?: string;
          ward?: string;
          avatar_url?: string;
          active?: boolean;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          head_name: string;
          contact_email: string;
          contact_phone: string;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string;
          head_name?: string;
          contact_email?: string;
          contact_phone?: string;
        };
        Update: Partial<Database['public']['Tables']['departments']['Insert']>;
      };
      complaint_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          department_slug: string;
          keywords: string;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          department_slug: string;
          keywords?: string;
        };
        Update: Partial<Database['public']['Tables']['complaint_categories']['Insert']>;
      };
      workers: {
        Row: {
          id: string;
          profile_id: string;
          department_id: string | null;
          ward: string;
          availability: string;
          active_complaints: number;
          rating: number;
          total_assigned: number;
          total_resolved: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          department_id?: string | null;
          ward?: string;
          availability?: string;
          active_complaints?: number;
          rating?: number;
          total_assigned?: number;
          total_resolved?: number;
        };
        Update: Partial<Database['public']['Tables']['workers']['Insert']>;
      };
      complaints: {
        Row: {
          id: string;
          ticket_number: string;
          user_id: string;
          department_id: string | null;
          assigned_worker_id: string | null;
          category: string;
          category_slug: string;
          title: string;
          description: string;
          ai_title: string;
          ai_description: string;
          ai_summary: string;
          severity: string;
          priority: string;
          status: string;
          recommended_department_id: string | null;
          duplicate_of: string | null;
          image_url: string;
          after_image_url: string;
          latitude: number | null;
          longitude: number | null;
          address: string;
          ward: string;
          completion_notes: string;
          created_at: string;
          assigned_at: string | null;
          in_progress_at: string | null;
          resolved_at: string | null;
          updated_at: string;
        };
        Insert: {
          ticket_number: string;
          user_id?: string;
          department_id?: string | null;
          assigned_worker_id?: string | null;
          category: string;
          category_slug?: string;
          title: string;
          description?: string;
          ai_title?: string;
          ai_description?: string;
          ai_summary?: string;
          severity?: string;
          priority?: string;
          status?: string;
          recommended_department_id?: string | null;
          duplicate_of?: string | null;
          image_url?: string;
          after_image_url?: string;
          latitude?: number | null;
          longitude?: number | null;
          address?: string;
          ward?: string;
          completion_notes?: string;
          assigned_at?: string | null;
          in_progress_at?: string | null;
          resolved_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['complaints']['Insert']>;
      };
      complaint_timeline: {
        Row: {
          id: string;
          complaint_id: string;
          status: string;
          note: string;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          complaint_id: string;
          status: string;
          note?: string;
          actor_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['complaint_timeline']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          complaint_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          type: string;
          title: string;
          body?: string;
          complaint_id?: string | null;
          read?: boolean;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      feedback: {
        Row: {
          id: string;
          complaint_id: string;
          user_id: string;
          rating: number;
          note: string;
          created_at: string;
        };
        Insert: {
          complaint_id: string;
          user_id?: string;
          rating: number;
          note?: string;
        };
        Update: Partial<Database['public']['Tables']['feedback']['Insert']>;
      };
    };
  };
}
