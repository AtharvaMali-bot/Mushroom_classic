// Centralized authentication utilities

const AuthHelper = {
  supabaseClient: null,

  init(url, anonKey) {
    if (!window.supabase) {
      console.error("Supabase library not loaded");
      return false;
    }
    this.supabaseClient = supabase.createClient(url, anonKey);
    return true;
  },

  async getCurrentUser() {
    if (!this.supabaseClient) return null;
    const {
      data: { user },
    } = await this.supabaseClient.auth.getUser();
    return user;
  },

  async getSession() {
    if (!this.supabaseClient) return null;
    const {
      data: { session },
    } = await this.supabaseClient.auth.getSession();
    return session;
  },

  async signOut() {
    if (!this.supabaseClient) return;
    const { error } = await this.supabaseClient.auth.signOut();
    if (!error) {
      localStorage.removeItem("user");
      window.location.href = "/login.html";
    }
    return error;
  },

  async requireAuth() {
    const session = await this.getSession();
    if (!session) {
      // Store intended destination
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = "/login.html";
      return false;
    }
    return true;
  },

  onAuthStateChange(callback) {
    if (!this.supabaseClient) return;
    return this.supabaseClient.auth.onAuthStateChange(callback);
  },
};

// Make it globally available
window.AuthHelper = AuthHelper;
