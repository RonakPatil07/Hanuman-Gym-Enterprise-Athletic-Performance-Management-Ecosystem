/**
 * ==============================================================================
 * Hanuman Gym - Unified Locations & Branch Discovery Controller
 * Enterprise Architecture: Single Data Layer, URL Deep-Linking, My Home Gym Sync,
 * Schema.org SEO JSON-LD, Leaflet Map, and GPS Nearest Branch Locator
 * ==============================================================================
 */

(function (global) {
    let branchesData = [];
    let leafletMap = null;
    let markersMap = {};
    let activeRegion = 'all';
    let activeFacility = 'all';
    let userLocation = null;

    // Toast Notification System
    function showLocationToast(msg, icon = 'fa-star') {
        let container = document.getElementById('location-toast-box');
        if (!container) {
            container = document.createElement('div');
            container.id = 'location-toast-box';
            container.style.cssText = `
                position: fixed;
                bottom: 28px;
                right: 28px;
                z-index: 9999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: rgba(18, 18, 18, 0.96);
            border: 1px solid #B3DD24;
            color: #FFFFFF;
            padding: 14px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 600;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            pointer-events: auto;
        `;

        toast.innerHTML = `<i class="fa-solid ${icon}" style="color:#B3DD24; font-size:18px;"></i> <span>${msg}</span>`;
        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateY(10px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // URL State Synchronizer
    function updateUrlState(params) {
        try {
            const url = new URL(window.location.href);
            Object.keys(params).forEach(key => {
                if (params[key] && params[key] !== 'all') {
                    url.searchParams.set(key, params[key]);
                } else {
                    url.searchParams.delete(key);
                }
            });
            window.history.replaceState({}, '', url.toString());
        } catch (e) {}
    }

    function readUrlState() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            branch: urlParams.get('branch') || urlParams.get('id') || null,
            region: urlParams.get('region') || 'all',
            facility: urlParams.get('facility') || urlParams.get('amenity') || 'all',
            search: urlParams.get('search') || urlParams.get('q') || ''
        };
    }

    // Haversine Distance Formula (km)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1));
    }

    // Real-Time Open/Closed & Crowd Occupancy Status
    function getLiveStatus(branch) {
        if (branch.is24x7) {
            return {
                isOpen: true,
                statusText: '🟢 24/7 Access Open',
                statusClass: 'open',
                crowdText: '🟢 Moderate',
                crowdDetail: 'Biometric Access Active'
            };
        }

        const now = new Date();
        const currentHour = now.getHours() + (now.getMinutes() / 60);
        const isOpen = currentHour >= branch.openHour && currentHour < branch.closeHour;

        let crowdText = '🟢 Quiet';
        let crowdDetail = 'Great time to lift';

        if (currentHour >= 6 && currentHour < 8.5) {
            crowdText = '🟡 Morning Rush';
            crowdDetail = 'Moderate energy';
        } else if (currentHour >= 18 && currentHour < 21) {
            crowdText = '🟠 Peak Hours';
            crowdDetail = 'High energy & busy racks';
        } else if (currentHour >= 21 && currentHour < 23) {
            crowdText = '🟡 Evening Wind Down';
            crowdDetail = 'Moderate space';
        }

        return {
            isOpen: isOpen,
            statusText: isOpen ? `🟢 Open Now • Closes ${branch.hours.split('-')[1] || '11:00 PM'}` : `🔴 Closed • Opens 5:00 AM`,
            statusClass: isOpen ? 'open' : 'closed',
            crowdText: crowdText,
            crowdDetail: crowdDetail
        };
    }

    // Home Gym Preferences
    function getHomeGymId() {
        return localStorage.getItem('gym_home_branch') || null;
    }

    function setHomeGym(branchId) {
        const branch = branchesData.find(b => b.id === branchId);
        if (!branch) return;

        localStorage.setItem('gym_home_branch', branchId);
        showLocationToast(`Set ${branch.name} as your Home Gym!`, 'fa-house-chimney');

        // Sync with GymCloudStore
        if (window.GymCloudStore && typeof window.GymCloudStore.recordExerciseLog === 'function') {
            try {
                window.GymCloudStore.recordExerciseLog({
                    homeBranch: branchId,
                    updatedAt: new Date().toISOString()
                });
            } catch (e) {}
        }

        renderBranchCards();
    }

    // Inject SEO Schema.org/HealthClub JSON-LD
    function injectLocalBusinessSchema(data) {
        try {
            const schemaScript = document.createElement('script');
            schemaScript.type = 'application/ld+json';
            schemaScript.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HealthClub",
                "name": "Hanuman Gym - Chain of Centers",
                "department": data.map(b => ({
                    "@type": "ExerciseGym",
                    "name": b.name,
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": b.address,
                        "addressLocality": b.city,
                        "addressRegion": "Maharashtra",
                        "addressCountry": "IN"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": b.lat,
                        "longitude": b.lng
                    },
                    "telephone": b.primaryPhone,
                    "openingHours": b.hours
                }))
            });
            document.head.appendChild(schemaScript);
        } catch (e) {}
    }

    // Initialize Leaflet Map with CDN loading resilience
    function initLeafletMap() {
        const mapEl = document.getElementById('gym-interactive-map');
        if (!mapEl) return;

        if (typeof L === 'undefined') {
            setTimeout(initLeafletMap, 300);
            return;
        }

        if (leafletMap) return;

        leafletMap = L.map('gym-interactive-map', {
            center: [19.18, 73.10],
            zoom: 10,
            zoomControl: true,
            scrollWheelZoom: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(leafletMap);

        branchesData.forEach(branch => {
            const customIcon = L.divIcon({
                className: 'custom-gym-marker',
                html: `
                    <div style="
                        width: 32px; height: 32px;
                        background: #B3DD24;
                        border: 2px solid #000;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #000;
                        font-size: 14px;
                        box-shadow: 0 0 15px rgba(179, 221, 36, 0.6);
                        cursor: pointer;
                        transition: transform 0.2s ease;
                    ">
                        <i class="fa-solid fa-dumbbell"></i>
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = L.marker([branch.lat, branch.lng], { icon: customIcon }).addTo(leafletMap);

            const popupContent = `
                <div class="map-popup-card">
                    <h4>${branch.name}</h4>
                    <p><i class="fa-solid fa-location-dot" style="color:#B3DD24;"></i> ${branch.address}</p>
                    <p><i class="fa-solid fa-clock" style="color:#B3DD24;"></i> ${branch.hours}</p>
                    <div style="display:flex; gap:8px; margin-top:8px;">
                        <a href="${branch.googleMapsUrl}" target="_blank" class="btn-popup-dir">
                            <i class="fa-solid fa-diamond-turn-right"></i> Directions
                        </a>
                        <button type="button" onclick="window.HanumanLocations.openPass('${branch.id}')" style="background:#000; color:#B3DD24; border:1px solid #B3DD24; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:800; cursor:pointer;">
                            Free Pass
                        </button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            markersMap[branch.id] = marker;
        });
    }

    function panToBranchOnMap(branchId) {
        const branch = branchesData.find(b => b.id === branchId);
        if (branch && leafletMap) {
            leafletMap.flyTo([branch.lat, branch.lng], 14, { duration: 1.2 });
            const marker = markersMap[branchId];
            if (marker) marker.openPopup();
            const mapSection = document.getElementById('mapSection');
            if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
            updateUrlState({ branch: branch.id });
        }
    }

    // Render Branch Cards
    function renderBranchCards() {
        const searchInput = document.getElementById('location-search-input');
        const container = document.getElementById('branchesContainer');
        const countEl = document.getElementById('branches-count-badge');
        const emptyState = document.getElementById('locations-empty-state');
        const homeGymId = getHomeGymId();

        if (!container) return;

        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

        let list = branchesData.map(branch => {
            let distance = null;
            if (userLocation) {
                distance = calculateDistance(userLocation.lat, userLocation.lng, branch.lat, branch.lng);
            }
            return { ...branch, distance, isHome: branch.id === homeGymId };
        });

        if (userLocation) {
            list.sort((a, b) => a.distance - b.distance);
        }

        const filtered = list.filter(branch => {
            const matchesQuery = !query ||
                branch.name.toLowerCase().includes(query) ||
                branch.city.toLowerCase().includes(query) ||
                branch.address.toLowerCase().includes(query) ||
                branch.region.toLowerCase().includes(query);

            const matchesRegion = activeRegion === 'all' || branch.region === activeRegion;
            const matchesFacility = activeFacility === 'all' || branch.facilities.some(f => f.toLowerCase().includes(activeFacility.toLowerCase()));

            return matchesQuery && matchesRegion && matchesFacility;
        });

        if (filtered.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            container.innerHTML = filtered.map(branch => {
                const live = getLiveStatus(branch);
                const waMessage = encodeURIComponent(`Hi Hanuman Gym! I would like to inquire about membership and timings at the ${branch.name}.`);
                const waUrl = `https://wa.me/919876543210?text=${waMessage}`;

                return `
                    <div class="branch-card" id="branch-card-${branch.id}" data-id="${branch.id}" style="${branch.isHome ? 'border-color:#B3DD24; box-shadow:0 0 20px rgba(179, 221, 36,0.15);' : ''}">
                        <div class="branch-card-header">
                            <div>
                                <h3 class="branch-name">${branch.name}</h3>
                                <div style="display:flex; gap:6px; align-items:center; margin-top:4px; flex-wrap:wrap;">
                                    <span class="branch-region-tag"><i class="fa-solid fa-map-pin"></i> ${branch.region}</span>
                                    ${branch.isHome ? `
                                        <span style="background:rgba(179, 221, 36,0.18); border:1px solid #B3DD24; color:#B3DD24; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:800;">
                                            ⭐ My Home Gym
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        ${branch.distance !== null ? `
                            <div class="branch-distance-tag">
                                <i class="fa-solid fa-location-crosshairs"></i> 📍 ${branch.distance} km away from you
                            </div>
                        ` : ''}

                        <!-- Live Status & Crowd Occupancy -->
                        <div class="live-status-row">
                            <span class="status-badge ${live.statusClass}">
                                <i class="fa-solid fa-circle" style="font-size:8px;"></i> ${live.statusText}
                            </span>
                            <span class="crowd-meter">
                                <i class="fa-solid fa-users"></i> ${live.crowdText}
                            </span>
                        </div>

                        <!-- Address & Hours -->
                        <div class="branch-address">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${branch.address}</span>
                        </div>

                        <div class="branch-hours">
                            <i class="fa-solid fa-clock"></i>
                            <span>${branch.hours}</span>
                        </div>

                        <!-- Facility Pills -->
                        <div class="branch-facilities-list">
                            ${branch.facilities.map(f => `<span class="facility-pill"><i class="fa-solid fa-circle-check text-gold" style="color:#B3DD24; font-size:10px; margin-right:4px;"></i>${f}</span>`).join('')}
                        </div>

                        <!-- Action Buttons -->
                        <div class="branch-actions-grid">
                            <button type="button" class="btn-card-action btn-pass-primary" onclick="window.HanumanLocations.openPass('${branch.id}')">
                                <i class="fa-solid fa-ticket"></i> Book Free 1-Day Pass
                            </button>
                            
                            <a href="${branch.googleMapsUrl}" target="_blank" class="btn-card-action btn-action-outline">
                                <i class="fa-solid fa-diamond-turn-right"></i> Directions
                            </a>

                            <button type="button" class="btn-card-action btn-action-outline" onclick="window.HanumanLocations.openPhone('${branch.id}')">
                                <i class="fa-solid fa-phone"></i> Call Desk
                            </button>

                            <a href="${waUrl}" target="_blank" class="btn-card-action btn-action-whatsapp">
                                <i class="fa-brands fa-whatsapp"></i> WhatsApp
                            </a>

                            <button type="button" class="btn-card-action btn-action-outline" onclick="window.HanumanLocations.panMap('${branch.id}')">
                                <i class="fa-solid fa-map-location-dot"></i> View on Map
                            </button>

                            <button type="button" class="btn-card-action btn-action-outline" style="${branch.isHome ? 'color:#B3DD24;' : ''}" onclick="window.HanumanLocations.setHome('${branch.id}')">
                                <i class="${branch.isHome ? 'fa-solid fa-star' : 'fa-regular fa-star'}"></i> ${branch.isHome ? 'Home Gym' : 'Set Home Gym'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (countEl) countEl.textContent = `Showing ${filtered.length} of ${branchesData.length} Centers`;
        updateUrlState({ region: activeRegion, facility: activeFacility, search: query });
    }

    // GPS Geolocation Locator
    function locateNearestGym() {
        const locateBtn = document.getElementById('btn-gps-locate');
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        if (locateBtn) {
            locateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating Nearest Gym...`;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };

                if (locateBtn) {
                    locateBtn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Sorted by Nearest Gym`;
                    locateBtn.classList.add('active');
                }

                if (leafletMap) {
                    const userIcon = L.divIcon({
                        className: 'user-gps-marker',
                        html: `
                            <div style="
                                width: 22px; height: 22px;
                                background: #3ECF8E;
                                border: 3px solid #FFF;
                                border-radius: 50%;
                                box-shadow: 0 0 15px rgba(62, 207, 142, 0.8);
                            "></div>
                        `,
                        iconSize: [22, 22]
                    });

                    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                        .addTo(leafletMap)
                        .bindPopup('<strong>📍 Your Location</strong>')
                        .openPopup();

                    leafletMap.setView([userLocation.lat, userLocation.lng], 11);
                }

                renderBranchCards();
            },
            () => {
                if (locateBtn) {
                    locateBtn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Find Nearest Gym to Me`;
                }
                alert('Unable to access location. Please check your browser location permissions.');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    // 1-Click Free Pass Booking
    function openPassBooking(branchId) {
        const branch = branchesData.find(b => b.id === branchId);
        const modal = document.getElementById('bookingModal');
        const locSelect = document.getElementById('bookingLocation');

        if (modal) {
            if (locSelect && branch) {
                locSelect.value = branch.id;
            }
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Open Phone Modal
    function openPhoneModal(branchId) {
        const branch = branchesData.find(b => b.id === branchId);
        if (!branch) return;

        const modal = document.getElementById('phoneModal');
        if (modal) {
            document.getElementById('phoneModalTitle').textContent = `Contact ${branch.name}`;
            document.getElementById('primaryPhone').textContent = branch.primaryPhone;
            document.getElementById('secondaryPhone').textContent = branch.secondaryPhone;

            document.getElementById('primaryCallBtn').href = `tel:${branch.primaryPhone.replace(/\s/g, '')}`;
            document.getElementById('secondaryCallBtn').href = `tel:${branch.secondaryPhone.replace(/\s/g, '')}`;

            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Reset Filters
    function resetFilters() {
        const searchInput = document.getElementById('location-search-input');
        if (searchInput) searchInput.value = '';
        activeRegion = 'all';
        activeFacility = 'all';
        document.querySelectorAll('#region-filter-chips .location-chip').forEach(c => c.classList.toggle('active', c.dataset.region === 'all'));
        document.querySelectorAll('#facility-filter-chips .location-chip').forEach(c => c.classList.toggle('active', c.dataset.facility === 'all'));
        renderBranchCards();
        updateUrlState({ region: 'all', facility: 'all', search: '' });
    }

    // Master Initialization
    async function initLocationsHub() {
        try {
            if (window.HANUMAN_LOCATIONS_DATA && Array.isArray(window.HANUMAN_LOCATIONS_DATA)) {
                branchesData = window.HANUMAN_LOCATIONS_DATA;
            } else {
                const res = await fetch('data/locations.json');
                if (!res.ok) throw new Error('Failed to load data/locations.json');
                branchesData = await res.json();
            }

            injectLocalBusinessSchema(branchesData);
            initLeafletMap();
            renderBranchCards();

            // Search Input Listener
            const searchInput = document.getElementById('location-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', renderBranchCards);
            }

            // GPS Button Listener
            const gpsBtn = document.getElementById('btn-gps-locate');
            if (gpsBtn) {
                gpsBtn.addEventListener('click', locateNearestGym);
            }

            // Region Filter Chips
            document.querySelectorAll('#region-filter-chips .location-chip').forEach(chip => {
                chip.addEventListener('click', function () {
                    document.querySelectorAll('#region-filter-chips .location-chip').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    activeRegion = this.dataset.region;
                    renderBranchCards();
                });
            });

            // Facility Filter Chips
            document.querySelectorAll('#facility-filter-chips .location-chip').forEach(chip => {
                chip.addEventListener('click', function () {
                    document.querySelectorAll('#facility-filter-chips .location-chip').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    activeFacility = this.dataset.facility;
                    renderBranchCards();
                });
            });

            // Modal Close on click outside & Escape
            window.addEventListener('click', (e) => {
                document.querySelectorAll('.modal').forEach(m => {
                    if (e.target === m) closeModal(m.id);
                });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.modal').forEach(m => closeModal(m.id));
                }
            });

            // Date constraint: min date is today
            const dateInput = document.getElementById('bookingDate');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.setAttribute('min', today);
                if (!dateInput.value) dateInput.value = today;
            }

            // Handle Booking Form Submission
            const bookingForm = document.getElementById('bookingForm');
            if (bookingForm) {
                bookingForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    const formData = new FormData(this);
                    const data = Object.fromEntries(formData);

                    const msgEl = document.getElementById('bookingMessage');
                    if (msgEl) {
                        msgEl.textContent = `Thank you ${data.name}! Your Free 1-Day Pass at ${data.location} has been confirmed.`;
                        msgEl.className = 'message success';
                        msgEl.style.display = 'block';
                    }

                    if (window.GymApiClient) {
                        GymApiClient.createInquiry({
                            name: data.name,
                            email: data.email,
                            phone: data.phone,
                            location: data.location,
                            inquiry_type: 'trial_pass',
                            message: `Pass booked for Date: ${data.date}, Time Slot: ${data.time}`
                        }).catch(() => {});
                    }

                    if (window.GymCloudStore && typeof window.GymCloudStore.recordInquiry === 'function') {
                        GymCloudStore.recordInquiry({
                            name: data.name,
                            email: data.email,
                            phone: data.phone,
                            location: data.location,
                            type: 'trial_pass',
                            notes: `Free 1-Day Pass - Date: ${data.date}, Time: ${data.time}`
                        });
                    }

                    this.reset();
                    setTimeout(() => closeModal('bookingModal'), 2500);
                });
            }

            // Read URL State & Deep-Link
            const urlState = readUrlState();
            if (urlState.search && searchInput) {
                searchInput.value = urlState.search;
            }
            if (urlState.region && urlState.region !== 'all') {
                activeRegion = urlState.region;
                document.querySelectorAll('#region-filter-chips .location-chip').forEach(c => c.classList.toggle('active', c.dataset.region === activeRegion));
            }
            if (urlState.facility && urlState.facility !== 'all') {
                activeFacility = urlState.facility;
                document.querySelectorAll('#facility-filter-chips .location-chip').forEach(c => c.classList.toggle('active', c.dataset.facility === activeFacility));
            }

            renderBranchCards();

            if (urlState.branch) {
                setTimeout(() => panToBranchOnMap(urlState.branch), 500);
            }

        } catch (err) {
            console.error('Error initializing Locations Hub:', err);
        }
    }

    global.HanumanLocations = {
        init: initLocationsHub,
        locate: locateNearestGym,
        openPass: openPassBooking,
        openPhone: openPhoneModal,
        closeModal: closeModal,
        panMap: panToBranchOnMap,
        setHome: setHomeGym,
        reset: resetFilters
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLocationsHub);
    } else {
        initLocationsHub();
    }
})(typeof window !== "undefined" ? window : this);
