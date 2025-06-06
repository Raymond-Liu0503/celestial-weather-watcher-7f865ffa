
interface VisitData {
  totalVisits: number;
  lastVisit: string;
  sessionStart: string;
  pagesViewed: string[];
}

class VisitTracker {
  private storageKey = 'celestial_observatory_visits';

  getVisitData(): VisitData {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      totalVisits: 0,
      lastVisit: '',
      sessionStart: new Date().toISOString(),
      pagesViewed: []
    };
  }

  trackVisit(page: string = '/'): void {
    const data = this.getVisitData();
    const now = new Date().toISOString();
    
    // Check if this is a new session (more than 30 minutes since last visit)
    const isNewSession = !data.lastVisit || 
      (new Date().getTime() - new Date(data.lastVisit).getTime()) > 30 * 60 * 1000;
    
    if (isNewSession) {
      data.totalVisits += 1;
      data.sessionStart = now;
    }
    
    data.lastVisit = now;
    
    if (!data.pagesViewed.includes(page)) {
      data.pagesViewed.push(page);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    
    console.log(`📊 Visit tracked: ${data.totalVisits} total visits, session started: ${data.sessionStart}`);
  }

  getSessionDuration(): number {
    const data = this.getVisitData();
    if (!data.sessionStart) return 0;
    return Math.floor((new Date().getTime() - new Date(data.sessionStart).getTime()) / 1000);
  }
}

export const visitTracker = new VisitTracker();
