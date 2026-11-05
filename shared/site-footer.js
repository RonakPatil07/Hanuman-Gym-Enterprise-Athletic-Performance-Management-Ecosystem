/* ==============================================================================
   HANUMAN GYM - AUTHORITATIVE GLOBAL FOOTER INJECTOR
   Enterprise 4-Zone Mega Footer with Direct Reliable Routing
   ============================================================================== */
(function () {
  function initFooter() {
    if (document.querySelector(".site-global-footer")) return;

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

    const cssHref = `${basePath}shared/site-footer.css`;
    if (!document.querySelector(`link[href*="site-footer.css"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }

    if (!document.querySelector(`link[href*="font-awesome"]`)) {
      const faLink = document.createElement("link");
      faLink.rel = "stylesheet";
      faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
      document.head.appendChild(faLink);
    }

    const logoSrc = `${basePath}P Home/images/logo.png`;

    const footerHTML = `
      <footer class="site-global-footer">
        <div class="footer-main-container">
          <div class="footer-grid">
            
            <!-- Column 1: Brand & Brotherhood -->
            <div class="footer-brand-col">
              <a href="${basePath}P Home/index.html" class="footer-logo-wrap">
                <img src="${logoSrc}" alt="Hanuman Gym Logo" class="footer-logo-img">
                <span class="footer-brand-title">HANUMAN <span>GYM</span></span>
              </a>
              <p class="footer-brand-tagline">
                Forging elite strength, mental discipline, and human performance since 2018. The official training hub for champions and athletes worldwide.
              </p>
              <div class="footer-social-strip">
                <a href="https://instagram.com" target="_blank" class="footer-social-btn" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
                <a href="https://youtube.com" target="_blank" class="footer-social-btn" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
                <a href="https://twitter.com" target="_blank" class="footer-social-btn" title="Twitter / X"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="https://discord.com" target="_blank" class="footer-social-btn" title="Discord Community"><i class="fa-brands fa-discord"></i></a>
                <a href="https://spotify.com" target="_blank" class="footer-social-btn" title="Workout Playlist"><i class="fa-brands fa-spotify"></i></a>
              </div>
            </div>

            <!-- Column 2: Platform & Store -->
            <div class="footer-nav-col">
              <h4><i class="fa-solid fa-compass"></i> Explore</h4>
              <ul class="footer-links-list">
                <li><a href="${basePath}P Home/index.html"><i class="fa-solid fa-angle-right"></i> Home Overview</a></li>
                <li><a href="${basePath}Memberships/index.html"><i class="fa-solid fa-angle-right"></i> Membership Passes</a></li>
                <li><a href="${basePath}store/index.html"><i class="fa-solid fa-angle-right"></i> FitStore Merchandise</a></li>
                <li><a href="${basePath}Training_Section/index.html"><i class="fa-solid fa-angle-right"></i> Personal Coaches</a></li>
                <li><a href="${basePath}custom workout plan/workout-plan.html"><i class="fa-solid fa-angle-right"></i> AI Workout Wizard</a></li>
                <li><a href="${basePath}P Recipe/recipes.html"><i class="fa-solid fa-angle-right"></i> Athlete Meal Plans</a></li>
              </ul>
            </div>

            <!-- Column 3: Training & Member Portal -->
            <div class="footer-nav-col">
              <h4><i class="fa-solid fa-dumbbell"></i> Athlete Hub</h4>
              <ul class="footer-links-list">
                <li><a href="${basePath}P Home/myspace.html"><i class="fa-solid fa-angle-right"></i> My Space Command</a></li>
                <li><a href="${basePath}P workout Program/workout-programs.html"><i class="fa-solid fa-angle-right"></i> Training Splits</a></li>
                <li><a href="${basePath}Form module/index.html"><i class="fa-solid fa-angle-right"></i> Exercise Form Module</a></li>
                <li><a href="${basePath}Locations/location.html"><i class="fa-solid fa-angle-right"></i> Branch Locations</a></li>
                <li><a href="${basePath}P About/about.html"><i class="fa-solid fa-angle-right"></i> Our Gym Philosophy</a></li>
                <li><a href="${basePath}admin/login.html"><i class="fa-solid fa-angle-right"></i> Staff & Admin Portal</a></li>
              </ul>
            </div>

            <!-- Column 4: Gym HQ & VIP Newsletter -->
            <div class="footer-nav-col">
              <h4><i class="fa-solid fa-bolt"></i> Athlete Newsletter</h4>
              <div class="footer-newsletter-box">
                <h5>Join the Brotherhood</h5>
                <p>Receive weekly training splits, high-protein recipes, and exclusive gear drops.</p>
                <form class="footer-input-group" onsubmit="event.preventDefault(); alert('Welcome to the Hanuman Gym Brotherhood! Check your inbox for your first workout split.'); this.reset();">
                  <input type="email" placeholder="athlete@example.com" class="footer-input" required>
                  <button type="submit" class="footer-subscribe-btn">Join</button>
                </form>
              </div>

              <div class="footer-contact-details">
                <div class="footer-contact-item">
                  <i class="fa-solid fa-location-dot"></i>
                  <span>108 Champion's Blvd, Iron District</span>
                </div>
                <div class="footer-contact-item">
                  <i class="fa-solid fa-phone"></i>
                  <span>+91 (800) 426-8626 • 24/7 Hotline</span>
                </div>
                <div class="footer-contact-item">
                  <i class="fa-solid fa-clock"></i>
                  <span>24/7 Access for Enrolled Athletes</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Strip -->
          <div class="footer-bottom-strip">
            <div>
              &copy; ${new Date().getFullYear()} Hanuman Gym Technologies Inc. All rights reserved.
            </div>

            <div class="footer-badges">
              <span class="footer-badge-pill"><i class="fa-solid fa-lock"></i> 256-Bit SSL Secured</span>
              <span class="footer-badge-pill"><i class="fa-solid fa-cloud-bolt"></i> Supabase Realtime</span>
              <span class="footer-badge-pill"><i class="fa-solid fa-shield-halved"></i> ISO 9001 Fitness Standard</span>
            </div>

            <div class="footer-legal-links">
              <a href="${basePath}P About/about.html">Privacy</a>
              <a href="${basePath}P About/about.html">Terms</a>
              <a href="${basePath}Locations/location.html">Support</a>
            </div>
          </div>
        </div>
      </footer>
    `;

    const host = document.getElementById("site-footer");
    if (host) {
      host.innerHTML = footerHTML;
    } else {
      const oldFooter = document.querySelector("footer:not(.site-global-footer)");
      if (oldFooter) {
        oldFooter.outerHTML = footerHTML;
      } else {
        document.body.insertAdjacentHTML("beforeend", footerHTML);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFooter);
  } else {
    initFooter();
  }
})();
