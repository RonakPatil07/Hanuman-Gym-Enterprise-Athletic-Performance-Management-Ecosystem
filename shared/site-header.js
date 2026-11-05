/* ==============================================================================
   HANUMAN GYM - AUTHORITATIVE GLOBAL HEADER INJECTOR
   Direct Path Architecture with Seamless Asset Resolution, Mobile Drawer & Live Cart Sync
   ============================================================================== */
(function () {
  const host = document.getElementById("site-header");
  if (!host) return;

  // Calculate project base path dynamically
  const fullPath = window.location.pathname;
  const match = fullPath.match(/^.*\/PS-miniproject\//i);
  let basePath = "/PS-miniproject/";
  if (match) {
    basePath = match[0];
  } else {
    const cleanPath = fullPath.startsWith("/") ? fullPath.slice(1) : fullPath;
    const depth = cleanPath.split("/").length - 1;
    basePath = depth > 0 ? "../".repeat(depth) : "./";
  }

  // Authoritative Design System Tokens Injection
  const tokensHref = `${basePath}shared/design-tokens.css`;
  if (!document.querySelector(`link[href*="design-tokens.css"]`)) {
    const tokensLink = document.createElement("link");
    tokensLink.rel = "stylesheet";
    tokensLink.href = tokensHref;
    document.head.insertBefore(tokensLink, document.head.firstChild);
  }

  // Authoritative CSS Injection
  const cssHref = `${basePath}shared/site-header.css`;
  if (!document.querySelector(`link[href*="site-header.css"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssHref;
    document.head.appendChild(link);
  }

  // Ensure Standard Google Fonts (Outfit, Inter, Syne & Plus Jakarta Sans) are loaded
  if (!document.querySelector(`link[href*="fonts.googleapis.com/css2?family="]`)) {
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&family=Inter:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(fontLink);
  }

  // Ensure Font Awesome is loaded for icons
  const faHref = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
  if (!document.querySelector(`link[href*="font-awesome"]`)) {
    const faLink = document.createElement("link");
    faLink.rel = "stylesheet";
    faLink.href = faHref;
    document.head.appendChild(faLink);
  }

  // Ensure Shared Global Footer is loaded
  const footerScriptSrc = `${basePath}shared/site-footer.js`;
  if (!document.querySelector(`script[src*="site-footer.js"]`)) {
    const footerScript = document.createElement("script");
    footerScript.src = footerScriptSrc;
    footerScript.defer = true;
    (document.body || document.head).appendChild(footerScript);
  }

  // Check auth user
  let authUser = null;
  try {
    const raw = localStorage.getItem("gym_auth_user") || sessionStorage.getItem("gym_auth_user");
    if (raw) authUser = JSON.parse(raw);
  } catch (e) {}

  const mySpaceHref = authUser ? `${basePath}login_register/dashboard.html` : `${basePath}P Home/myspace.html`;

  const mainLinks = [
    { label: "Home", href: `${basePath}P Home/index.html`, icon: "fa-house" },
    { label: "Memberships", href: `${basePath}Memberships/index.html`, icon: "fa-id-card" },
    { label: "About", href: `${basePath}P About/about.html`, icon: "fa-circle-info" },
    { label: "Workouts", href: `${basePath}P workout Program/workout-programs.html`, icon: "fa-dumbbell" },
    { label: "Trainers", href: `${basePath}Training_Section/index.html`, icon: "fa-user-ninja" },
    { label: "Store", href: `${basePath}store/index.html`, icon: "fa-bag-shopping" },
    { label: "Recipes", href: `${basePath}P Recipe/recipes.html`, icon: "fa-utensils" },
    { label: "Exercise", href: `${basePath}Form module/index.html`, icon: "fa-person-running" },
    { label: "Locations", href: `${basePath}Locations/location.html`, icon: "fa-map-location-dot" },
    { label: "My Space", href: mySpaceHref, icon: "fa-layer-group" },
  ];

  const adminLink = { label: "Admin", href: `${basePath}admin/login.html` };
  const signinLink = { label: "Sign In", href: `${basePath}login_register/index.html` };
  const storeCheckoutLink = `${basePath}store/checkout.html`;

  // Compute Cart Count
  let cartCount = 0;
  try {
    const savedCart = localStorage.getItem("gym_store_cart");
    if (savedCart) {
      const items = JSON.parse(savedCart);
      if (Array.isArray(items)) {
        cartCount = items.reduce((acc, it) => acc + (parseInt(it.quantity || it.qty || 1, 10)), 0);
      }
    }
  } catch (e) {}

  const currentPath = decodeURIComponent(fullPath.toLowerCase());
  const isActive = (href, label) => {
    if (!href) return false;
    const targetPath = decodeURIComponent(new URL(href, window.location.href).pathname.toLowerCase());
    
    // Check if current is root or P Home
    if ((currentPath.endsWith("/ps-miniproject/") || currentPath.endsWith("/ps-miniproject/index.html") || currentPath.endsWith("/p home/index.html")) && targetPath.endsWith("/p home/index.html")) {
      return true;
    }
    // Check if current is My Space / Dashboard
    if (label === "My Space" && (currentPath.includes("dashboard.html") || currentPath.includes("myspace.html"))) {
      return true;
    }
    // Check if current is Exercise Academy
    if (label === "Exercise" && (currentPath.includes("form module") || currentPath.includes("gym_exercise_form") || currentPath.includes("exercise-library"))) {
      return true;
    }
    return currentPath === targetPath;
  };

  const logoSrc = `${basePath}P Home/images/logo.png`;

  host.innerHTML = `
    <header class="site-header">
      <div class="site-nav-container">
        <!-- LEFT: BRAND LOGO + NAME -->
        <a href="${basePath}P Home/index.html" class="site-header-brand" aria-label="Hanuman Gym Home">
          <div class="site-logo">
            <img src="${logoSrc}" alt="Hanuman Gym Logo">
          </div>
          <span class="site-brand-text">HANUMAN <span>GYM</span></span>
        </a>

        <!-- CENTER: MAIN NAVIGATION (DESKTOP) -->
        <nav class="site-nav-menu" aria-label="Main Navigation">
          ${mainLinks
            .map(
              (link) => `
            <a href="${link.href}" class="site-nav-item ${
                isActive(link.href, link.label) ? "active" : ""
              }">${link.label}</a>
          `
            )
            .join("")}
        </nav>

        <!-- RIGHT: CALL TO ACTION BUTTONS -->
        <div class="site-header-actions">
          <!-- Store Cart Icon -->
          <a href="${storeCheckoutLink}" class="cart-action-btn" title="View Store Cart" aria-label="Store Cart">
            <i class="fa-solid fa-cart-shopping"></i>
            <span class="cart-badge-count ${cartCount > 0 ? '' : 'hidden'}" id="globalHeaderCartBadge">${cartCount}</span>
          </a>

          <!-- Admin Button -->
          <a href="${adminLink.href}" class="admin-action-btn ${
            isActive(adminLink.href, adminLink.label) ? "active" : ""
          }"><i class="fa-solid fa-shield-halved" style="margin-right: 5px;"></i>${adminLink.label}</a>

          <!-- Auth Button -->
          ${
            currentPath.includes("dashboard.html")
              ? `<a href="javascript:void(0)" onclick="if(window.GymApiClient){GymApiClient.logout();}else{localStorage.removeItem('gym_auth_token');localStorage.removeItem('gym_auth_user');}window.location.href='${basePath}login_register/index.html';" class="signin-action-btn" style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35); color: #FCA5A5;"><i class="fa-solid fa-power-off" style="margin-right: 6px;"></i>Logout</a>`
              : `<a href="${signinLink.href}" class="signin-action-btn ${
                  isActive(signinLink.href, signinLink.label) ? "active" : ""
                }"><i class="fa-solid fa-arrow-right-to-bracket" style="margin-right: 6px;"></i>${authUser && authUser.name ? authUser.name.split(' ')[0] : signinLink.label}</a>`
          }

          <!-- Mobile Hamburger Toggle -->
          <button type="button" class="site-hamburger-btn" id="siteHamburgerBtn" aria-label="Toggle mobile menu" aria-expanded="false">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- MOBILE BACKDROP & OFF-CANVAS DRAWER -->
    <div class="site-mobile-backdrop" id="siteMobileBackdrop"></div>
    <div class="site-mobile-drawer" id="siteMobileDrawer" aria-hidden="true">
      <div class="site-drawer-header">
        <a href="${basePath}P Home/index.html" class="site-drawer-brand">
          <img src="${logoSrc}" alt="Hanuman Gym Logo">
          <span>HANUMAN <span>GYM</span></span>
        </a>
        <button type="button" class="site-drawer-close-btn" id="siteDrawerCloseBtn" aria-label="Close menu">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <nav class="site-drawer-nav">
        ${mainLinks
          .map(
            (link) => `
          <a href="${link.href}" class="site-drawer-item ${
              isActive(link.href, link.label) ? "active" : ""
            }">
            <i class="fa-solid ${link.icon}"></i>
            <span>${link.label}</span>
          </a>
        `
          )
          .join("")}
      </nav>

      <div class="site-drawer-actions">
        <a href="${storeCheckoutLink}" class="site-drawer-action-btn" style="background: rgba(179, 221, 36, 0.09); border: 1px solid rgba(179, 221, 36, 0.40); color: var(--color-accent, #B3DD24);">
          <i class="fa-solid fa-cart-shopping"></i> View Cart (${cartCount})
        </a>
        <a href="${adminLink.href}" class="site-drawer-action-btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #CBD5E1;">
          <i class="fa-solid fa-shield-halved"></i> Admin Portal
        </a>
        ${
          currentPath.includes("dashboard.html")
            ? `<a href="javascript:void(0)" onclick="if(window.GymApiClient){GymApiClient.logout();}else{localStorage.removeItem('gym_auth_token');localStorage.removeItem('gym_auth_user');}window.location.href='${basePath}login_register/index.html';" class="site-drawer-action-btn" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #FCA5A5;"><i class="fa-solid fa-power-off"></i> Logout</a>`
            : `<a href="${signinLink.href}" class="site-drawer-action-btn" style="background: var(--color-accent, #B3DD24); color: #000; font-weight: 700;"><i class="fa-solid fa-arrow-right-to-bracket"></i> ${authUser && authUser.name ? 'My Account (' + authUser.name.split(' ')[0] + ')' : 'Sign In / Register'}</a>`
        }
      </div>
    </div>
  `;

  // --- MOBILE DRAWER EVENT CONTROLLER ---
  const hamburgerBtn = document.getElementById("siteHamburgerBtn");
  const drawerCloseBtn = document.getElementById("siteDrawerCloseBtn");
  const mobileDrawer = document.getElementById("siteMobileDrawer");
  const mobileBackdrop = document.getElementById("siteMobileBackdrop");

  const openDrawer = () => {
    if (!mobileDrawer || !mobileBackdrop) return;
    mobileDrawer.classList.add("open");
    mobileBackdrop.classList.add("open");
    mobileDrawer.setAttribute("aria-hidden", "false");
    if (hamburgerBtn) hamburgerBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    if (!mobileDrawer || !mobileBackdrop) return;
    mobileDrawer.classList.remove("open");
    mobileBackdrop.classList.remove("open");
    mobileDrawer.setAttribute("aria-hidden", "true");
    if (hamburgerBtn) hamburgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileDrawer && mobileDrawer.classList.contains("open")) {
      closeDrawer();
    }
  });

  // --- CART UPDATE BROADCAST LISTENER ---
  window.addEventListener("storage", (e) => {
    if (e.key === "gym_store_cart") {
      try {
        const itms = JSON.parse(e.newValue || "[]");
        const c = Array.isArray(itms) ? itms.reduce((acc, it) => acc + (parseInt(it.quantity || it.qty || 1, 10)), 0) : 0;
        const badge = document.getElementById("globalHeaderCartBadge");
        if (badge) {
          badge.textContent = c;
          if (c > 0) badge.classList.remove("hidden");
          else badge.classList.add("hidden");
        }
      } catch (err) {}
    }
  });

  // --- SMOOTH PAGE TRANSITIONS LOGIC ---
  const initSmoothTransitions = () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.2s ease-in-out';

    const navLinks = host.querySelectorAll('.site-nav-item, .site-header-brand, .admin-action-btn, .signin-action-btn, .cart-action-btn, .site-drawer-item, .site-drawer-action-btn');
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || this.target) return;

        let currentNorm = decodeURIComponent(window.location.pathname.toLowerCase());
        let targetNorm = decodeURIComponent(new URL(this.href, window.location.href).pathname.toLowerCase());

        // Normalize root URLs
        if (currentNorm.endsWith("/ps-miniproject/") || currentNorm.endsWith("/ps-miniproject/index.html")) {
          currentNorm = "/ps-miniproject/p home/index.html";
        }
        if (targetNorm.endsWith("/ps-miniproject/") || targetNorm.endsWith("/ps-miniproject/index.html")) {
          targetNorm = "/ps-miniproject/p home/index.html";
        }

        // If already on the same page, smoothly scroll to top and avoid re-fading/blackout
        if (currentNorm === targetNorm) {
          closeDrawer();
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Different page -> Smooth fade and navigate
        closeDrawer();
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(() => {
          window.location.href = this.href;
        }, 150);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothTransitions);
  } else {
    initSmoothTransitions();
  }
})();