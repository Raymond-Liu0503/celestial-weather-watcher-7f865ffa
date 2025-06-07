
import { supabase } from '@/integrations/supabase/client';

interface VisitData {
  totalVisits: number;
  lastVisit: string;
  sessionStart: string;
  pagesViewed: string[];
  sessionId: string;
}

class VisitTracker {
  private storageKey = 'celestial_observatory_visits';

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  getVisitData(): VisitData {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      // Ensure sessionId exists for backward compatibility
      if (!data.sessionId) {
        data.sessionId = this.generateSessionId();
      }
      return data;
    }
    return {
      totalVisits: 0,
      lastVisit: '',
      sessionStart: new Date().toISOString(),
      pagesViewed: [],
      sessionId: this.generateSessionId()
    };
  }

  async trackVisit(page: string = '/'): Promise<void> {
    const data = this.getVisitData();
    const now = new Date().toISOString();
    
    // Check if this is a new session (more than 30 minutes since last visit)
    const isNewSession = !data.lastVisit || 
      (new Date().getTime() - new Date(data.lastVisit).getTime()) > 30 * 60 * 1000;
    
    if (isNewSession) {
      data.totalVisits += 1;
      data.sessionStart = now;
      data.sessionId = this.generateSessionId(); // Generate new session ID
    }
    
    data.lastVisit = now;
    
    if (!data.pagesViewed.includes(page)) {
      data.pagesViewed.push(page);
    }
    
    // Save to localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    
    // Track in Supabase
    try {
      await this.saveToSupabase(data, page, isNewSession);
    } catch (error) {
      console.error('Failed to save visit data to Supabase:', error);
    }
    
    console.log(`📊 Visit tracked: ${data.totalVisits} total visits, session started: ${data.sessionStart}`);
  }

  private async saveToSupabase(data: VisitData, page: string, isNewSession: boolean): Promise<void> {
    const visitData = {
      session_id: data.sessionId,
      page_path: page,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      visit_count: data.totalVisits,
      session_start: data.sessionStart,
      last_visit: data.lastVisit
    };

    if (isNewSession) {
      // Insert new visit record
      const { error } = await supabase
        .from('visitor_analytics')
        .insert(visitData);
      
      if (error) {
        throw error;
      }
    } else {
      // Update existing visit record for this session
      const { error } = await supabase
        .from('visitor_analytics')
        .update({
          last_visit: data.lastVisit,
          page_path: page
        })
        .eq('session_id', data.sessionId);
      
      if (error) {
        // If update fails, try to insert (in case record doesn't exist)
        const { error: insertError } = await supabase
          .from('visitor_analytics')
          .insert(visitData);
        
        if (insertError) {
          throw insertError;
        }
      }
    }
  }

  getSessionDuration(): number {
    const data = this.getVisitData();
    if (!data.sessionStart) return 0;
    return Math.floor((new Date().getTime() - new Date(data.sessionStart).getTime()) / 1000);
  }

  async getAnalytics() {
    try {
      const { data, error } = await supabase
        .from('visitor_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return [];
    }
  }
}

export const visitTracker = new VisitTracker();
