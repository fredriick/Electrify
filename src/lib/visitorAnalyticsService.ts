import { getSupabaseClient } from './auth';

export interface VisitorSession {
  id: string;
  session_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  landing_page?: string;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  created_at: string;
  updated_at: string;
}

export interface PageView {
  id: string;
  session_id: string;
  user_id?: string;
  page_path: string;
  page_title?: string;
  referrer?: string;
  time_on_page?: number;
  created_at: string;
}

export interface ProductView {
  id: string;
  session_id: string;
  user_id?: string;
  product_id: string;
  supplier_id: string;
  view_duration?: number;
  created_at: string;
}

export interface VisitorAnalytics {
  total_visitors: number;
  total_page_views: number;
  total_product_views: number;
  conversion_rate: number;
  avg_time_on_site: number;
}

class VisitorAnalyticsService {
  private sessionId: string | null = null;
  private currentPageStartTime: number = 0;

  constructor() {
    this.initializeSession();
  }

  private initializeSession() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
    this.currentPageStartTime = Date.now();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';

    // Check if session ID exists in sessionStorage
    let sessionId = sessionStorage.getItem('visitor_session_id');
    
    if (!sessionId) {
      // Generate new session ID
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }
    
    return sessionId;
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') return {};

    const userAgent = navigator.userAgent;
    
    // Detect device type
    let deviceType = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Detect browser
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'chrome';
    else if (userAgent.includes('Firefox')) browser = 'firefox';
    else if (userAgent.includes('Safari')) browser = 'safari';
    else if (userAgent.includes('Edge')) browser = 'edge';

    // Detect OS
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'windows';
    else if (userAgent.includes('Mac')) os = 'macos';
    else if (userAgent.includes('Linux')) os = 'linux';
    else if (userAgent.includes('Android')) os = 'android';
    else if (userAgent.includes('iOS')) os = 'ios';

    return { deviceType, browser, os };
  }

  async trackPageView(pagePath: string, pageTitle?: string, userId?: string) {
    // Disable analytics temporarily to prevent errors
    return;
    
    if (!this.sessionId) return;

    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) return;

    try {
      const timeOnPage = Math.floor((Date.now() - this.currentPageStartTime) / 1000);
      const now = new Date().toISOString();
      
      // Check if a similar page view already exists in the last minute to avoid duplicates
      const { data: existingViews } = await supabaseClient
        .from('page_views')
        .select('id')
        .eq('session_id', this.sessionId)
        .eq('page_path', pagePath)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
        .limit(1);

      // Only insert if no recent duplicate exists
      if (!existingViews || existingViews.length === 0) {
        await supabaseClient.from('page_views').insert({
          session_id: this.sessionId,
          user_id: userId,
          page_path: pagePath,
          page_title: pageTitle,
          referrer: document.referrer || null,
          time_on_page: timeOnPage,
          created_at: now
        });
      }

      // Reset timer for next page
      this.currentPageStartTime = Date.now();
    } catch (error) {
      // Silently handle errors to prevent interference with main functionality
      console.warn('Page view tracking failed:', error);
    }
  }

  async trackProductView(productId: string, supplierId: string, userId?: string) {
    // Disable analytics temporarily to prevent errors
    return;
    
    if (!this.sessionId) return;

    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) return;

    try {
      // Check if a similar product view already exists in the last minute
      const { data: existingViews } = await supabaseClient
        .from('product_views')
        .select('id')
        .eq('session_id', this.sessionId)
        .eq('product_id', productId)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
        .limit(1);

      // Only insert if no recent duplicate exists
      if (!existingViews || existingViews.length === 0) {
        await supabaseClient.from('product_views').insert({
          session_id: this.sessionId,
          user_id: userId,
          product_id: productId,
          supplier_id: supplierId,
          view_duration: 0,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      // Silently handle errors to prevent interference with main functionality
      console.warn('Product view tracking failed:', error);
    }
  }

  async createVisitorSession(userId?: string) {
    // Disable analytics temporarily to prevent errors
    return;
    
    if (!this.sessionId) return;

    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) return;

    try {
      const deviceInfo = this.getDeviceInfo();
      
      // Check if session already exists
      const { data: existingSession } = await supabaseClient
        .from('visitor_sessions')
        .select('id')
        .eq('session_id', this.sessionId)
        .limit(1);

      // Only create session if it doesn't exist
      if (!existingSession || existingSession.length === 0) {
        await supabaseClient.from('visitor_sessions').insert({
          session_id: this.sessionId,
          user_id: userId,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          landing_page: window.location.pathname,
          ...deviceInfo,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      // Silently handle errors to prevent interference with main functionality
      console.warn('Visitor session creation failed:', error);
    }
  }

  async getSupplierVisitorAnalytics(
    supplierId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<VisitorAnalytics> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabaseClient.rpc('get_supplier_visitor_analytics', {
        p_supplier_id: supplierId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString()
      });

      if (error) {
        console.error('Error fetching visitor analytics:', error);
        return {
          total_visitors: 0,
          total_page_views: 0,
          total_product_views: 0,
          conversion_rate: 0,
          avg_time_on_site: 0
        };
      }

      return data?.[0] || {
        total_visitors: 0,
        total_page_views: 0,
        total_product_views: 0,
        conversion_rate: 0,
        avg_time_on_site: 0
      };
    } catch (error) {
      console.error('Error fetching visitor analytics:', error);
      return {
        total_visitors: 0,
        total_page_views: 0,
        total_product_views: 0,
        conversion_rate: 0,
        avg_time_on_site: 0
      };
    }
  }

  async getConversionRate(supplierId: string, startDate: Date, endDate: Date): Promise<number> {
    const analytics = await this.getSupplierVisitorAnalytics(supplierId, startDate, endDate);
    return analytics.conversion_rate;
  }
}

// Export singleton instance
export const visitorAnalyticsService = new VisitorAnalyticsService();


