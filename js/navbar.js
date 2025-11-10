// Navbar loader and authentication handler

class NavbarManager {
  constructor() {
    this.supabaseClient = null;
    this.currentUser = null;
  }

  async init(supabaseClient) {
    this.supabaseClient = supabaseClient;
    await this.loadNavbar();
    await this.initializeAuth();
    this.setupEventListeners();
  }

  async loadNavbar() {
    try {
      const response = await fetch("navbar.html");
      const html = await response.text();
      const navbarContainer = document.getElementById("navbar-container");
      if (navbarContainer) {
        navbarContainer.innerHTML = html;
      }
    } catch (error) {
      console.error("Error loading navbar:", error);
    }
  }

  async initializeAuth() {
    if (!this.supabaseClient) return;

    // Check initial auth status
    await this.checkAuthStatus();

    // Listen for auth state changes
    this.supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (session?.user) {
        this.updateAuthUI(session.user);
      } else {
        this.updateAuthUI(null);
      }
    });
  }

  async checkAuthStatus() {
    try {
      const {
        data: { session },
      } = await this.supabaseClient.auth.getSession();
      if (session?.user) {
        this.updateAuthUI(session.user);
      } else {
        this.updateAuthUI(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      this.updateAuthUI(null);
    }
  }

  getInitials(fullName) {
    if (!fullName) return "??";
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  updateAuthUI(user) {
    this.currentUser = user;

    const loginLink = document.getElementById("login-link");
    const userProfile = document.getElementById("user-profile");
    const userAvatarImg = document.getElementById("user-avatar-img");
    const userInitials = document.getElementById("user-initials");
    const dropdownAvatarImg = document.getElementById("dropdown-avatar-img");
    const dropdownInitials = document.getElementById("dropdown-initials");
    const userFullName = document.getElementById("user-full-name");
    const userEmail = document.getElementById("user-email");
    const mobileLoginLink = document.getElementById("mobile-login-link");
    const mobileLogoutButton = document.getElementById("mobile-logout-button");

    if (user) {
      // User is logged in
      if (loginLink) loginLink.classList.add("hidden");
      if (userProfile) userProfile.classList.remove("hidden");
      if (mobileLoginLink) mobileLoginLink.classList.add("hidden");
      if (mobileLogoutButton) mobileLogoutButton.classList.remove("hidden");

      const metadata = user.user_metadata || {};
      const fullName = metadata.full_name || user.email.split("@")[0];
      const email = user.email;
      const avatarUrl = metadata.avatar_url;
      const initials = this.getInitials(fullName);

      // Update user info in dropdown
      if (userFullName) userFullName.textContent = fullName;
      if (userEmail) userEmail.textContent = email;

      // Set avatar or initials
      if (avatarUrl) {
        if (userAvatarImg) {
          userAvatarImg.src = avatarUrl;
          userAvatarImg.classList.remove("hidden");
        }
        if (userInitials) userInitials.classList.add("hidden");
        if (dropdownAvatarImg) {
          dropdownAvatarImg.src = avatarUrl;
          dropdownAvatarImg.classList.remove("hidden");
        }
        if (dropdownInitials) dropdownInitials.classList.add("hidden");
      } else {
        if (userInitials) {
          userInitials.textContent = initials;
          userInitials.classList.remove("hidden");
        }
        if (userAvatarImg) userAvatarImg.classList.add("hidden");
        if (dropdownInitials) {
          dropdownInitials.textContent = initials;
          dropdownInitials.classList.remove("hidden");
        }
        if (dropdownAvatarImg) dropdownAvatarImg.classList.add("hidden");
      }
    } else {
      // User is logged out
      if (loginLink) loginLink.classList.remove("hidden");
      if (userProfile) userProfile.classList.add("hidden");
      if (mobileLoginLink) mobileLoginLink.classList.remove("hidden");
      if (mobileLogoutButton) mobileLogoutButton.classList.add("hidden");
    }

    // Update cart count from localStorage
    this.updateCartCount();
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("kavakCart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  async handleLogout() {
    try {
      const { error } = await this.supabaseClient.auth.signOut();
      if (error) throw error;

      localStorage.removeItem("user");
      this.updateAuthUI(null);

      // Show notification if available
      if (window.showNotification) {
        window.showNotification("Successfully logged out", false);
      }

      // Close dropdown
      const userDropdown = document.getElementById("user-dropdown");
      if (userDropdown) userDropdown.classList.remove("show");

      // Redirect to home page
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout error:", error);
      if (window.showNotification) {
        window.showNotification("Error logging out", true);
      }
    }
  }

  setupEventListeners() {
    // User dropdown toggle
    const userMenuButton = document.getElementById("user-menu-button");
    const userDropdown = document.getElementById("user-dropdown");
    const userProfile = document.getElementById("user-profile");

    if (userMenuButton) {
      userMenuButton.addEventListener("click", (e) => {
        e.stopPropagation();
        if (userDropdown) userDropdown.classList.toggle("show");
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (userDropdown && userProfile && !userProfile.contains(e.target)) {
        userDropdown.classList.remove("show");
      }
    });

    // Logout buttons
    const logoutButton = document.getElementById("logout-button");
    const mobileLogoutButton = document.getElementById("mobile-logout-button");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.handleLogout());
    }
    if (mobileLogoutButton) {
      mobileLogoutButton.addEventListener("click", () => this.handleLogout());
    }

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");

    if (mobileMenuButton) {
      mobileMenuButton.addEventListener("click", () => {
        if (mobileMenu) mobileMenu.classList.toggle("hidden");
      });
    }

    // Cart modal button
    const cartModalButton = document.getElementById("cart-modal-button");
    if (cartModalButton) {
      cartModalButton.addEventListener("click", () => {
        // Trigger cart modal if available
        if (window.showCartModal) {
          window.showCartModal();
        } else {
          // Fallback to cart page
          window.location.href = "cart.html";
        }
      });
    }
  }
}

// Make it globally available
window.NavbarManager = NavbarManager;
