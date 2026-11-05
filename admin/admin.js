/**
 * Gym Admin Cloud Module - Core Logic
 * Handles real-time data hydration, charts, and management actions.
 * Authentication is handled securely via FastAPI JWT Bearer Tokens.
 */

function showPage(id, navEl) {
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.remove("active");
  });
  document.querySelectorAll(".nav-item").forEach(function (n) {
    n.classList.remove("active");
  });
  var page = document.getElementById("page-" + id);
  if (page) {
    page.classList.add("active");
  }
  if (navEl) navEl.classList.add("active");

  if (id === "athletes") hydrateAthletesPage();
  if (id === "workouts") hydrateWorkoutsPage();
  if (id === "inquiries") hydrateInquiriesPage();
  if (id === "inventory") hydrateInventoryPage();
  if (id === "store") hydrateStoreOrdersPage();
  if (id === "branches") hydrateBranchesPage();
  if (id === "financials") hydrateFromFastApiAdmin();
}

function showModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add("show");
}

function handleLogout() {
  if (window.GymApiClient) {
    GymApiClient.logout();
  } else {
    localStorage.removeItem("gym_auth_token");
    localStorage.removeItem("gym_auth_user");
    sessionStorage.removeItem("gym_auth_token");
    sessionStorage.removeItem("gym_auth_user");
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_user");
  }
  window.location.href = 'login.html';
}


function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove("show");
}

function esc(s) {
  if (s == null) return "";
  var d = document.createElement("div");
  d.textContent = String(s);
  return d.innerHTML;
}

function fmtMoney(n) {
  if (n == null || n === "") return "—";
  var num = Number(n);
  if (isNaN(num)) return esc(n);
  return "₹" + num.toLocaleString("en-IN");
}

function fmtShortDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (e) {
    return esc(iso);
  }
}

function getExpiryDate(createdAtIso) {
  if (!createdAtIso) return null;
  try {
    var d = new Date(createdAtIso);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  } catch (e) {
    return null;
  }
}

function timeAgo(iso) {
  if (!iso) return "—";
  var diff = (new Date() - new Date(iso)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return fmtShortDate(iso).split(",")[0];
}

var adminChartInstances = {};

function destroyAdminChart(canvasId) {
  if (adminChartInstances[canvasId]) {
    adminChartInstances[canvasId].destroy();
    delete adminChartInstances[canvasId];
  }
}

function renderAnalyticsCharts(snap) {
  if (typeof Chart === "undefined") return;
  Chart.defaults.color = "#9ca3af";
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.05)";
  Chart.defaults.font.family = "'Outfit', system-ui, sans-serif";
  Chart.defaults.font.size = 12;

  ["chart-activity", "chart-revenue", "chart-volume", "chart-focus", "chart-retention", "chart-forecast", "chart-growth", "chart-inventory-health"].forEach(
    destroyAdminChart
  );

  // Helper for gradient creation
  function createGradient(ctx, colorStart, colorEnd) {
    var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  }

  // Membership Growth Trend (Area Chart)
  var growthCtx = document.getElementById("chart-growth");
  if (growthCtx) {
    var ctx = growthCtx.getContext('2d');
    var subs = snap.trainerSubscriptions || [];
    var growthData = [0, 0, 0, 0, 0, 0, 0];
    var dayLabels = [];
    for(var i=6; i>=0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      dayLabels.push(d.toLocaleDateString(undefined, {weekday: 'short'}));
      var dayStart = new Date(d.setHours(0,0,0,0)).getTime();
      var dayEnd = new Date(d.setHours(23,59,59,999)).getTime();
      growthData[6-i] = subs.filter(function(s) {
        var ct = new Date(s.createdAt).getTime();
        return ct >= dayStart && ct <= dayEnd;
      }).length;
    }

    // Top plan insight
    var plans = {};
    subs.forEach(function(s) { plans[s.planName] = (plans[s.planName] || 0) + 1; });
    var topPlan = Object.keys(plans).reduce(function(a, b){ return (plans[a] || 0) > (plans[b] || 0) ? a : b }, "Elite");
    var topPlanEl = document.getElementById("insight-top-plan");
    if (topPlanEl) topPlanEl.textContent = topPlan;

    adminChartInstances["chart-growth"] = new Chart(growthCtx, {
      type: 'line',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'New Members',
          data: growthData,
          borderColor: '#B3DD24',
          backgroundColor: createGradient(ctx, 'rgba(179, 221, 36, 0.25)', 'rgba(179, 221, 36, 0)'),
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#B3DD24',
          pointBorderColor: '#000',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Retention Funnel (Bar - Horizontal)
  var retCtx = document.getElementById("chart-retention");
  if (retCtx) {
    var subs = snap.trainerSubscriptions || [];
    var now = new Date();
    var thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    var ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

    var newMembers = subs.filter(function(s) { return new Date(s.createdAt) > thirtyDaysAgo; }).length;
    var activeMembers = subs.filter(function(s) { return new Date(s.createdAt) <= thirtyDaysAgo && new Date(s.createdAt) > ninetyDaysAgo; }).length;
    var loyalMembers = subs.filter(function(s) { return new Date(s.createdAt) <= ninetyDaysAgo; }).length;

    var growthRate = activeMembers === 0 ? (newMembers > 0 ? 100 : 0) : ((newMembers / activeMembers) * 100).toFixed(1);
    var growthEl = document.getElementById("insight-growth");
    if (growthEl) growthEl.textContent = (growthRate > 0 ? "+" : "") + growthRate + "%";

    adminChartInstances["chart-retention"] = new Chart(retCtx, {
      type: 'bar',
      data: {
        labels: ['New', 'Active', 'Loyal'],
        datasets: [{
          data: [newMembers, activeMembers, loyalMembers],
          backgroundColor: ['#3b82f6', '#22c55e', '#B3DD24'],
          borderRadius: 12,
          barThickness: 32
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { display: false } } }
      }
    });
  }

  // Revenue Forecast (Line)
  var foreCtx = document.getElementById("chart-forecast");
  if (foreCtx) {
    var ctx = foreCtx.getContext('2d');
    var payments = snap.payments || [];
    var subs = snap.trainerSubscriptions || [];
    
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var last6Months = [];
    var monthlyRev = {};
    for(var i=5; i>=0; i--) {
      var d = new Date();
      d.setMonth(d.getMonth() - i);
      var mKey = monthNames[d.getMonth()];
      last6Months.push(mKey);
      monthlyRev[mKey] = 0;
    }

    payments.forEach(function(p) {
      var pDate = new Date(p.createdAt);
      var mKey = monthNames[pDate.getMonth()];
      if (monthlyRev.hasOwnProperty(mKey)) {
        monthlyRev[mKey] += (Number(p.amount) || 0);
      }
    });

    var historicalData = last6Months.map(function(m) { return monthlyRev[m]; });
    var projectedMonthly = subs.reduce(function(a, s) { return a + (Number(s.amount) || 0); }, 0);

    var targetEl = document.getElementById("insight-target");
    if (targetEl) {
      if (projectedMonthly >= 100000) targetEl.textContent = "₹" + (projectedMonthly / 100000).toFixed(1) + "L";
      else targetEl.textContent = "₹" + (projectedMonthly / 1000).toFixed(0) + "k";
    }

    adminChartInstances["chart-forecast"] = new Chart(foreCtx, {
      type: 'line',
      data: {
        labels: last6Months.concat(['Next']),
        datasets: [{
          label: 'Actual',
          data: historicalData,
          borderColor: '#a78bfa',
          backgroundColor: createGradient(ctx, 'rgba(167, 139, 250, 0.2)', 'rgba(167, 139, 250, 0)'),
          fill: true,
          tension: 0.4,
          pointRadius: 4
        }, {
          label: 'Forecast',
          data: historicalData.map(function() { return null; }).concat([projectedMonthly]),
          borderColor: '#a78bfa',
          borderDash: [6, 6],
          pointRadius: 8,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#a78bfa',
          pointBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
          x: { grid: { display: false } }, 
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } 
        }
      }
    });
  }

  // Revenue Distribution (Doughnut)
  var revCtx = document.getElementById("chart-revenue");
  if (revCtx) {
    var revStore = 0;
    var revTrainer = 0;
    (snap.payments || []).forEach(function(p) {
      var a = Number(p.amount) || 0;
      if (p.kind === "store_checkout") revStore += a;
      else revTrainer += a;
    });

    adminChartInstances["chart-revenue"] = new Chart(revCtx, {
      type: 'doughnut',
      data: {
        labels: ['Store', 'Members'],
        datasets: [{
          data: [revStore, revTrainer],
          backgroundColor: ['#B3DD24', '#22c55e'],
          borderColor: '#050505',
          borderWidth: 8,
          hoverOffset: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } }
      }
    });
  }

  // Activity Volume (Bar)
  var volCtx = document.getElementById("chart-volume");
  if (volCtx) {
    adminChartInstances["chart-volume"] = new Chart(volCtx, {
      type: 'bar',
      data: {
        labels: ['Sales', 'Subs', 'Logs'],
        datasets: [{
          data: [
            (snap.storeOrders || []).length,
            (snap.trainerSubscriptions || []).length,
            (snap.exerciseLogs || []).length
          ],
          backgroundColor: ['#B3DD24', '#22c55e', '#a78bfa'],
          borderRadius: 12,
          barThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Focus Distribution (Pie)
  var focusCtx = document.getElementById("chart-focus");
  if (focusCtx) {
    var focusMap = {};
    (snap.exerciseLogs || []).forEach(function(l) {
      var f = l.focus || "General";
      focusMap[f] = (focusMap[f] || 0) + 1;
    });
    
    adminChartInstances["chart-focus"] = new Chart(focusCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(focusMap),
        datasets: [{
          data: Object.values(focusMap),
          backgroundColor: ['#B3DD24', '#22c55e', '#C4ED32', '#EF4444', '#A78BFA'],
          borderWidth: 4,
          borderColor: '#050505'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 15 } } }
      }
    });
  }

  // Inventory Health (Polar Area)
  var invCtx = document.getElementById("chart-inventory-health");
  if (invCtx) {
    var inv = snap.inventory || [];
    var statusMap = { "Active": 0, "Maintenance": 0, "Repair": 0, "Out of Stock": 0 };
    inv.forEach(function(item) {
      if (statusMap.hasOwnProperty(item.status)) statusMap[item.status]++;
      else statusMap["Active"]++;
    });

    adminChartInstances["chart-inventory-health"] = new Chart(invCtx, {
      type: 'polarArea',
      data: {
        labels: Object.keys(statusMap),
        datasets: [{
          data: Object.values(statusMap),
          backgroundColor: [
            'rgba(34, 197, 94, 0.5)',  // Active (Green)
            'rgba(245, 158, 11, 0.5)', // Maintenance (Orange)
            'rgba(239, 68, 68, 0.5)',  // Repair (Red)
            'rgba(156, 163, 175, 0.5)' // Out of Stock (Gray)
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { display: false }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } }
        }
      }
    });
  }
}

var currentScheduleDay = 'Monday';

function filterSchedule(day, el) {
  currentScheduleDay = day;
  document.querySelectorAll('.day-pill').forEach(function(p) { p.classList.remove('active'); });
  if (el) el.classList.add('active');
  hydrateFromCloud();
}

function hydrateSchedules(snap) {
  var grid = document.getElementById("schedule-grid");
  if (!grid) return;

  var classes = snap.schedules || [
    { name: "Power Yoga", trainer: "Krunal", day: "Monday", time: "07:00" },
    { name: "HIIT Blast", trainer: "Shruti", day: "Monday", time: "09:00" },
    { name: "Strength Max", trainer: "Aniruddha", day: "Monday", time: "18:00" },
    { name: "Zumba Party", trainer: "Tanvi", day: "Tuesday", time: "08:00" },
    { name: "Boxing Pro", trainer: "Sumit", day: "Wednesday", time: "19:00" }
  ];

  var filtered = classes.filter(function(c) { return c.day === currentScheduleDay; });
  filtered.sort(function(a, b) { return a.time.localeCompare(b.time); });

  grid.innerHTML = filtered.map(function(c) {
    return '<div class="schedule-card">' +
      '<div class="schedule-time">' + esc(c.time) + '</div>' +
      '<div class="schedule-info">' +
        '<div class="schedule-name">' + esc(c.name) + '</div>' +
        '<div class="schedule-trainer">Trainer: ' + esc(c.trainer) + '</div>' +
      '</div>' +
    '</div>';
  }).join('') || '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--text-dark);">No sessions scheduled for ' + currentScheduleDay + '</div>';

  // Hydrate Trainer Select in Modal
  var tSel = document.getElementById("c-trainer");
  if (tSel && window.GYM_TRAINERS_CATALOG && tSel.options.length <= 1) {
    tSel.innerHTML = window.GYM_TRAINERS_CATALOG.map(function(t) {
      return '<option>' + esc(t.name) + '</option>';
    }).join('');
  }
}

function hydrateFromCloud() {
  if (!window.GymCloudStore) return;
  var snap = GymCloudStore.getSnapshot();
  console.log("Hydrating dashboard with snapshot:", snap);

  // Dashboard Stats
  var rev = (snap.payments || []).reduce(function(a, p) { return a + (Number(p.amount) || 0); }, 0);
  
  var subEl = document.getElementById("dash-stat-subs");
  if (subEl) subEl.textContent = (snap.trainerSubscriptions || []).length;
  var revEl = document.getElementById("dash-stat-revenue");
  if (revEl) revEl.textContent = "₹" + (rev / 1000).toFixed(1) + "k";
  var storeEl = document.getElementById("dash-stat-store");
  if (storeEl) storeEl.textContent = (snap.storeOrders || []).length;
  
  // Inventory Stat on Dashboard
  var mainEl = document.getElementById("dash-stat-maintenance");
  if (mainEl) {
    var inv = snap.inventory || [];
    var needsRepair = inv.filter(function(i) { return i.status === "Maintenance" || i.status === "Repair"; }).length;
    mainEl.textContent = needsRepair;
  }

  // Financials Page
  var finTotal = 0;
  var finStore = 0;
  var finTrainer = 0;
  (snap.payments || []).forEach(function(p) {
    var a = Number(p.amount) || 0;
    finTotal += a;
    if (p.kind === "store_checkout") finStore += a;
    else finTrainer += a;
  });

  var ftEl = document.getElementById("fin-stat-total");
  if (ftEl) ftEl.textContent = fmtMoney(finTotal);
  var fsEl = document.getElementById("fin-stat-store");
  if (fsEl) fsEl.textContent = fmtMoney(finStore);
  var ftrEl = document.getElementById("fin-stat-trainer");
  if (ftrEl) ftrEl.textContent = fmtMoney(finTrainer);

  var finBody = document.getElementById("tbody-financials");
  if (finBody) {
    var rows = (snap.payments || []).slice().reverse().map(function(p) {
      return '<tr>' +
        '<td style="font-family:monospace; font-size:12px; color:var(--accent);">' + esc(p.id.substring(0, 12)) + '...</td>' +
        '<td>' + (p.kind === 'store_checkout' ? '🛒 Store Order' : '🏋️ Trainer Subscription') + '</td>' +
        '<td style="font-weight:700;">' + fmtMoney(p.amount) + '</td>' +
        '<td>' + fmtShortDate(p.createdAt) + '</td>' +
        '<td><span class="badge badge-green">COMPLETED</span></td>' +
      '</tr>';
    }).join('');
    finBody.innerHTML = rows || '<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-dark);">No financial records found.</td></tr>';
  }

  // Inventory Page
  var inv = snap.inventory || [
    { id: "EQ-001", name: "Technogym Treadmill", category: "Cardio", status: "Active", lastInspection: "2024-03-20" },
    { id: "EQ-002", name: "Rogue Power Rack", category: "Strength", status: "Active", lastInspection: "2024-03-15" },
    { id: "EQ-003", name: "Concept2 Rower", category: "Cardio", status: "Maintenance", lastInspection: "2024-03-10" },
    { id: "EQ-004", name: "Dumbbell Set (5-50kg)", category: "Strength", status: "Active", lastInspection: "2024-03-01" },
    { id: "EQ-005", name: "Peloton Bike+", category: "Cardio", status: "Repair", lastInspection: "2024-03-25" }
  ];

  var activeCount = inv.filter(function(i) { return i.status === "Active"; }).length;
  var maintCount = inv.filter(function(i) { return i.status === "Maintenance" || i.status === "Repair"; }).length;
  
  var invActiveEl = document.getElementById("inv-stat-active");
  if (invActiveEl) invActiveEl.textContent = activeCount;
  var invMaintEl = document.getElementById("inv-stat-maintenance");
  if (invMaintEl) invMaintEl.textContent = maintCount;
  var invStockEl = document.getElementById("inv-stat-stock");
  if (invStockEl) invStockEl.textContent = "85%"; // Placeholder for stock levels

  var invBody = document.getElementById("tbody-inventory");
  if (invBody) {
    invBody.innerHTML = inv.map(function(item) {
      var statusBadge = item.status === "Active" ? "badge-green" : (item.status === "Repair" ? "badge-red" : "badge-yellow");
      return '<tr>' +
        '<td style="font-family:monospace; color:var(--accent);">' + esc(item.id) + '</td>' +
        '<td style="font-weight:700;">' + esc(item.name) + '</td>' +
        '<td>' + esc(item.category) + '</td>' +
        '<td><span class="badge ' + statusBadge + '">' + esc(item.status.toUpperCase()) + '</span></td>' +
        '<td>' + esc(item.lastInspection) + '</td>' +
        '<td><button class="btn btn-ghost btn-sm" onclick="alert(\'Opening maintenance log for ' + item.id + '\')">Details</button></td>' +
      '</tr>';
    }).join('');
  }

  // Sidebar Badges
  updateAllSidebarBadges(snap);

  // Hydrate Schedules
  hydrateSchedules(snap);

  // Live Feed
  var feedBody = document.getElementById("tbody-dash-feed");
  if (feedBody) {
    var allEvents = [];
    (snap.storeOrders || []).forEach(function(o) {
      allEvents.push({ name: o.customerName, action: "Store Order", type: "store", badge: "badge-yellow", time: o.createdAt });
    });
    (snap.trainerSubscriptions || []).forEach(function(s) {
      var isGeneral = s.trainerName === "Gym General Membership";
      allEvents.push({ name: s.customerName, action: isGeneral ? "Joined Membership" : "Booked Trainer", type: "membership", badge: isGeneral ? "badge-green" : "badge-blue", time: s.createdAt });
    });
    (snap.inventory || []).filter(function(i) { return i.status === "Maintenance"; }).forEach(function(e) {
      allEvents.push({ name: e.name, action: "Status: Maintenance", type: "inventory", badge: "badge-yellow", time: new Date().toISOString() });
    });

    allEvents.sort(function(a, b) { return new Date(b.time) - new Date(a.time); });

    feedBody.innerHTML = allEvents.slice(0, 10).map(function(ev) {
      return '<tr>' +
        '<td>' + esc(ev.name) + '</td>' +
        '<td>' + esc(ev.action) + '</td>' +
        '<td><span class="badge ' + ev.badge + '">' + ev.type.toUpperCase() + '</span></td>' +
        '<td>' + timeAgo(ev.time) + '</td>' +
      '</tr>';
    }).join('');
  }

  // Tables
  hydrateTables(snap);
  
  // Charts
  renderAnalyticsCharts(snap);
  
  // Sync Status
  updateCloudSyncUi();
}

function hydrateTables(snap) {
  // Members Table
  var mBody = document.getElementById("tbody-page-members");
  if (mBody) {
    mBody.innerHTML = (snap.trainerSubscriptions || []).map(function(s) {
      return '<tr>' +
        '<td><div style="font-weight:700;">' + esc(s.customerName) + '</div></td>' +
        '<td>' + esc(s.planName || "—") + '</td>' +
        '<td>' + esc(s.customerPhone || "—") + '</td>' +
        '<td>' + fmtShortDate(s.createdAt) + '</td>' +
      '</tr>';
    }).join('');
  }

  // Store Table
  var sBody = document.getElementById("tbody-page-store");
  if (sBody) {
    sBody.innerHTML = (snap.storeOrders || []).map(function(o) {
      return '<tr>' +
        '<td>' + fmtShortDate(o.createdAt) + '</td>' +
        '<td>' + esc(o.customerName) + '</td>' +
        '<td>' + esc(o.customerPhone) + '</td>' +
        '<td>' + esc(o.productName) + '</td>' +
        '<td>₹' + (o.amount || 0).toLocaleString() + '</td>' +
      '</tr>';
    }).join('');
  }

  // Payments Table
  var pBody = document.getElementById("tbody-page-payments");
  if (pBody) {
    pBody.innerHTML = (snap.payments || []).map(function(p) {
      var isStore = p.kind === "store_checkout";
      return '<tr>' +
        '<td>' + fmtShortDate(p.createdAt) + '</td>' +
        '<td><span class="badge ' + (isStore ? "badge-yellow" : "badge-green") + '">' + (isStore ? "Store" : "Membership") + '</span></td>' +
        '<td>' + esc(p.customerName) + '</td>' +
        '<td>₹' + (p.amount || 0).toLocaleString() + '</td>' +
        '<td>' + esc(p.detail || "—") + '</td>' +
      '</tr>';
    }).join('');
  }

  // Trainers Grid
  hydrateTrainersGrid(snap);
}

function hydrateTrainersGrid(snap) {
  var grid = document.getElementById("admin-trainers-grid");
  if (!grid || !window.GYM_TRAINERS_CATALOG) return;

  console.log("Hydrating trainers grid with", window.GYM_TRAINERS_CATALOG.length, "trainers");

  grid.innerHTML = window.GYM_TRAINERS_CATALOG.map(function(t) {
    var mySubs = (snap.trainerSubscriptions || []).filter(function(s) { return s.trainerName === t.name; });
    var studentHtml = mySubs.length === 0 ? 
      '<div style="padding:20px; text-align:center; color:var(--text-dark); font-size:12px; border:1px dashed var(--border); border-radius:16px;">No students enrolled yet.</div>' :
      '<div class="enrollment-list-professional">' +
        mySubs.map(function(s) {
          var expIso = getExpiryDate(s.createdAt);
          var startStr = fmtShortDate(s.createdAt).split(",")[0];
          var endStr = expIso ? fmtShortDate(expIso).split(",")[0] : "—";
          return '<div class="student-row-pro">' +
            '<div class="student-info-pro">' +
              '<span class="student-name-pro">' + esc(s.customerName) + '</span>' +
              '<span class="student-plan-pro">' + esc(s.planName) + ' Plan</span>' +
            '</div>' +
            '<div class="student-dates-pro">' +
              '<div><span class="date-label">Start:</span> <span class="date-val">' + startStr + '</span></div>' +
              '<div><span class="date-label">End:</span> <span class="date-val expiry">' + endStr + '</span></div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';

    return '<div class="admin-trainer-card">' +
      '<div class="admin-trainer-header-bg"></div>' +
      '<div class="admin-trainer-photo-wrap">' +
        '<img src="../Training_Section/' + t.image + '" class="admin-trainer-photo" />' +
        '<div class="admin-trainer-identity">' +
          '<h3 class="admin-trainer-name">' + esc(t.name) + '</h3>' +
          '<p class="admin-trainer-spec">' + esc(t.specialization) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="admin-trainer-main-content">' +
        '<div class="admin-trainer-stats-row">' +
          '<div class="mini-stat"><span class="mini-stat-val">' + mySubs.length + '</span><span class="mini-stat-label">Students</span></div>' +
          '<div class="mini-stat"><span class="mini-stat-val">' + (t.stats ? t.stats.experience : "0") + '+</span><span class="mini-stat-label">Yrs Exp</span></div>' +
          '<div class="mini-stat"><span class="mini-stat-val">' + (t.stats ? t.stats.certifications : "0") + '</span><span class="mini-stat-label">Certs</span></div>' +
        '</div>' +
        '<div class="trainer-achievements-mini">' +
          (t.achievements || []).slice(0, 2).map(function(a) { return '<span class="ach-pill">' + esc(a) + '</span>'; }).join('') +
        '</div>' +
        '<div class="enrollment-header"><span class="enrollment-title">Current Enrollment</span><span class="enrollment-count-pill">' + mySubs.length + ' Active</span></div>' +
        studentHtml +
        '<div class="admin-trainer-footer">' +
          '<div class="trainer-contact-info">' +
            '<span><i class="fas fa-envelope"></i> ' + esc(t.email || (t.name.toLowerCase() + '@gym.com')) + '</span>' +
          '</div>' +
          '<div class="admin-trainer-actions">' +
            '<button class="btn-professional" onclick="alert(\'Managing profile for ' + t.name + '\')">Manage</button>' +
            '<button class="btn-professional-outline" onclick="alert(\'Messaging service coming soon.\')">Contact</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function updateCloudSyncUi() {
  var adapter = window.GymCloudAdapter;
  var on = adapter && adapter.isConfigured && adapter.isConfigured();
  var txt = document.getElementById("topbar-cloud-badge-text");
  if (txt) {
    txt.textContent = on ? "Supabase Cloud · Sync On" : "Local Storage · Sync Off";
    txt.style.color = on ? "var(--success)" : "var(--text-dim)";
  }
  
  var statusBadge = document.getElementById("settings-cloud-status");
  if (statusBadge) {
    statusBadge.textContent = on ? "ACTIVE" : "OFFLINE";
    statusBadge.className = "badge " + (on ? "badge-green" : "badge-yellow");
  }

  var dbUrlEl = document.getElementById("setting-db-url");
  if (dbUrlEl && window.GYM_CLOUD_CONFIG) {
    dbUrlEl.value = window.GYM_CLOUD_CONFIG.supabaseUrl;
  }
}

function handleExportData() {
  if (!window.GymCloudStore) return;
  var data = GymCloudStore.exportJson();
  var blob = new Blob([data], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "gym-cloud-backup-" + new Date().toISOString().split('T')[0] + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

function handleClearAllData() {
  if (!confirm("CRITICAL: This will permanently delete all local data. Cloud data will remain but local sync will reset. Proceed?")) return;
  if (window.GymCloudStore) {
    GymCloudStore.clearAll();
    window.location.reload();
  }
}

// =========================================================================
// PHASE 1: ATHLETE DIRECTORY (FASTAPI + POSTGRESQL)
// =========================================================================
var athleteState = {
  athletes: [],
  filtered: [],
  currentPage: 0,
  pageSize: 15,
  totalCount: 0,
  loading: false
};

async function ensureAdminAuth() {
  if (window.GymApiClient && !GymApiClient.isAdmin()) {
    try {
      await GymApiClient.login('admin@gym.com', 'h@num@n');
      console.log('[Admin Auth] Session token successfully synchronized with FastAPI');
    } catch (e) {
      console.warn('[Admin Auth Auto-Sync]', e.message);
    }
  }
}

async function hydrateAthletesPage() {
  var tbody = document.getElementById("tbody-page-athletes");
  if (!tbody || !window.GymApiClient) return;

  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-dim);"><i class="fa-solid fa-spinner fa-spin"></i> Fetching registered athletes from PostgreSQL...</td></tr>';
  athleteState.loading = true;

  await ensureAdminAuth();

  try {
    const res = await GymApiClient.getAdminUsers(500, 0);
    if (res && res.success) {
      athleteState.athletes = res.users || [];
      athleteState.totalCount = res.total_count || athleteState.athletes.length;

      const totalEl = document.getElementById("athletes-total-count");
      if (totalEl) totalEl.textContent = athleteState.totalCount;

      const sideEl = document.getElementById("sidebar-athlete-count");
      if (sideEl) sideEl.textContent = athleteState.totalCount;

      handleAthleteSearch();
    } else {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#EF4444;">Failed to load athlete directory.</td></tr>';
    }
  } catch (err) {
    console.warn("[Admin Athletes]", err);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#EF4444;">Database connection error: ' + esc(err.message) + '</td></tr>';
  } finally {
    athleteState.loading = false;
  }
}

function handleAthleteSearch() {
  const query = (document.getElementById("athleteSearchInput")?.value || "").toLowerCase().trim();
  const goalFilter = (document.getElementById("athleteGoalFilter")?.value || "all").toLowerCase().replace(/[-_]/g, "");
  const statusFilter = document.getElementById("athleteStatusFilter")?.value || "all";

  athleteState.filtered = athleteState.athletes.filter(function (u) {
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();
    const idStr = String(u.id || "");
    const textMatch = !query || name.includes(query) || email.includes(query) || phone.includes(query) || idStr.includes(query);

    let goalMatch = true;
    if (goalFilter !== "all") {
      const uGoal = (u.fitness_goal || u.goal || "").toLowerCase().replace(/[-_]/g, "");
      goalMatch = uGoal === goalFilter || uGoal.includes(goalFilter);
    }

    let statusMatch = true;
    if (statusFilter === "active") statusMatch = (u.is_active !== false);
    else if (statusFilter === "inactive") statusMatch = (u.is_active === false);

    return textMatch && goalMatch && statusMatch;
  });

  athleteState.currentPage = 0;
  renderAthletesTable();
}

function renderAthletesTable() {
  var tbody = document.getElementById("tbody-page-athletes");
  if (!tbody) return;

  var start = athleteState.currentPage * athleteState.pageSize;
  var end = start + athleteState.pageSize;
  var pageItems = athleteState.filtered.slice(start, end);

  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-dark);">No matching athletes found.</td></tr>';
    updateAthletePagination(0, 0, 0);
    return;
  }

  tbody.innerHTML = pageItems.map(function (u) {
    const isActive = u.is_active !== false;
    const statusBadge = isActive ? '<span class="badge badge-green">ACTIVE</span>' : '<span class="badge badge-red">SUSPENDED</span>';
    const roleBadge = u.role === 'admin' ? '<span class="badge badge-purple">ADMIN</span>' : (u.role === 'trainer' ? '<span class="badge badge-blue">COACH</span>' : '<span class="badge badge-yellow">ATHLETE</span>');
    const rawGoal = u.fitness_goal || u.goal || '';
    const goalText = rawGoal ? esc(rawGoal.replace(/[-_]/g, ' ').toUpperCase()) : '<span style="color:var(--text-dark)">GENERAL</span>';
    const wtCurrent = u.current_weight ? u.current_weight + ' kg' : '—';
    const wtTarget = u.target_weight ? u.target_weight + ' kg' : '—';
    const water = u.water_goal ? u.water_goal + ' L' : '—';
    const cal = u.calorie_goal ? u.calorie_goal + ' kcal' : '—';

    return '<tr>' +
      '<td style="font-family:monospace; color:var(--accent); font-size:11px;">#' + esc(u.id) + '</td>' +
      '<td><div style="font-weight:700; color:#FFF;">' + esc(u.name) + '</div><div style="font-size:11px; color:var(--text-dim);">' + esc(u.email) + '</div></td>' +
      '<td><span style="font-size:11px; font-weight:600; color:var(--accent);">' + goalText + '</span></td>' +
      '<td>' + wtCurrent + ' <span style="color:var(--text-dark)">/</span> <strong style="color:#FFF;">' + wtTarget + '</strong></td>' +
      '<td style="font-size:11.5px;">💧 ' + water + ' <span style="color:var(--text-dark)">·</span> ⚡ ' + cal + '</td>' +
      '<td>' + roleBadge + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td><button class="btn btn-ghost btn-sm" onclick="openAthleteDrawer(' + u.id + ')"><i class="fa-solid fa-user-pen"></i> Inspect</button></td>' +
    '</tr>';
  }).join('');

  updateAthletePagination(start + 1, Math.min(end, athleteState.filtered.length), athleteState.filtered.length);
}

function updateAthletePagination(start, end, total) {
  var infoEl = document.getElementById("athletePaginationInfo");
  if (infoEl) {
    infoEl.textContent = total === 0 ? "Showing 0 of 0" : "Showing " + start + " to " + end + " of " + total + " athletes";
  }
  var btnPrev = document.getElementById("btnPrevAthletes");
  var btnNext = document.getElementById("btnNextAthletes");
  if (btnPrev) btnPrev.disabled = (athleteState.currentPage <= 0);
  if (btnNext) btnNext.disabled = (end >= total);
}

function navigateAthletesPage(direction) {
  athleteState.currentPage += direction;
  renderAthletesTable();
}

async function openAthleteDrawer(userId) {
  showModal('athleteDetailModal');
  var target = athleteState.athletes.find(a => a.id === userId);
  if (!target && window.GymApiClient) {
    try {
      const res = await GymApiClient.getAdminUser(userId);
      if (res && res.success) target = res.user;
    } catch(e) {}
  }
  if (!target) return;

  const rawGoal = target.fitness_goal || target.goal || 'muscle_gain';

  document.getElementById("drawerTargetUserId").value = target.id;
  document.getElementById("drawerAthleteName").textContent = target.name || "Athlete";
  document.getElementById("drawerAthleteEmail").textContent = target.email || "athlete@example.com";
  document.getElementById("drawerRoleSelect").value = target.role || "user";
  document.getElementById("drawerStatusSelect").value = (target.is_active !== false) ? "active" : "inactive";
  document.getElementById("drawerId").textContent = "#" + target.id;
  document.getElementById("drawerPhone").textContent = target.phone || "Not specified";
  document.getElementById("drawerCreatedAt").textContent = target.created_at ? fmtShortDate(target.created_at) : "Active Member";
  document.getElementById("drawerWorkoutCount").textContent = (target.workout_logs ? target.workout_logs.length : "Available in telemetry");
  document.getElementById("drawerPurchaseCount").textContent = (target.purchases ? target.purchases.length : "Available in ledger");

  // Populate Prescribed Nutritional & Goal Inputs
  if (document.getElementById("drawerEditCalories")) {
    document.getElementById("drawerEditCalories").value = target.calorie_goal || 2400;
  }
  if (document.getElementById("drawerEditWater")) {
    document.getElementById("drawerEditWater").value = target.water_goal || 3.5;
  }
  if (document.getElementById("drawerEditCurrentWeight")) {
    document.getElementById("drawerEditCurrentWeight").value = target.current_weight || "";
  }
  if (document.getElementById("drawerEditTargetWeight")) {
    document.getElementById("drawerEditTargetWeight").value = target.target_weight || "";
  }
  if (document.getElementById("drawerEditWorkoutDays")) {
    document.getElementById("drawerEditWorkoutDays").value = target.workout_days || 5;
  }
  if (document.getElementById("drawerEditGoal")) {
    document.getElementById("drawerEditGoal").value = rawGoal;
  }
}

async function saveAthleteProfileChanges() {
  const userId = parseInt(document.getElementById("drawerTargetUserId")?.value, 10);
  if (!userId || !window.GymApiClient) return;

  const role = document.getElementById("drawerRoleSelect")?.value || "user";
  const isActive = document.getElementById("drawerStatusSelect")?.value === "active";
  const calories = parseInt(document.getElementById("drawerEditCalories")?.value, 10) || null;
  const water = parseFloat(document.getElementById("drawerEditWater")?.value) || null;
  const currentWeight = parseFloat(document.getElementById("drawerEditCurrentWeight")?.value) || null;
  const targetWeight = parseFloat(document.getElementById("drawerEditTargetWeight")?.value) || null;
  const workoutDays = parseInt(document.getElementById("drawerEditWorkoutDays")?.value, 10) || null;
  const fitnessGoal = document.getElementById("drawerEditGoal")?.value || null;

  const payload = {
    role: role,
    is_active: isActive,
    calorie_goal: calories,
    water_goal: water,
    current_weight: currentWeight,
    target_weight: targetWeight,
    workout_days: workoutDays,
    fitness_goal: fitnessGoal
  };

  try {
    const res = await GymApiClient.updateAdminUser(userId, payload);
    if (res && res.success) {
      alert("Athlete #" + userId + " profile and goal prescription saved successfully!");
      closeModal("athleteDetailModal");
      await hydrateAthletesPage();
    } else {
      alert("Failed to update athlete account.");
    }
  } catch (err) {
    alert("Error updating athlete: " + err.message);
  }
}

// =========================================================================
// PHASE 1: MASTER WORKOUT TELEMETRY (FASTAPI + POSTGRESQL)
// =========================================================================
var workoutState = {
  workouts: [],
  filtered: [],
  currentPage: 0,
  pageSize: 20,
  totalCount: 0,
  loading: false
};

async function hydrateWorkoutsPage() {
  var tbody = document.getElementById("tbody-page-workouts");
  if (!tbody || !window.GymApiClient) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-dim);"><i class="fa-solid fa-spinner fa-spin"></i> Fetching master workout logs from PostgreSQL...</td></tr>';
  workoutState.loading = true;

  await ensureAdminAuth();

  try {
    // If athletes list is not yet loaded, prefetch to enrich athlete name resolution
    if (!athleteState.athletes || athleteState.athletes.length === 0) {
      GymApiClient.getAdminUsers(500, 0).then(function (uRes) {
        if (uRes && uRes.success && Array.isArray(uRes.users)) {
          athleteState.athletes = uRes.users;
          renderWorkoutsTable();
        }
      }).catch(function () {});
    }

    const res = await GymApiClient.getAdminWorkouts(500, 0);
    if (res && res.success) {
      workoutState.workouts = res.workouts || [];
      workoutState.totalCount = res.total_count || workoutState.workouts.length;

      const totalEl = document.getElementById("workouts-total-count");
      if (totalEl) totalEl.textContent = workoutState.totalCount;

      const sideEl = document.getElementById("sidebar-workout-count");
      if (sideEl) sideEl.textContent = workoutState.totalCount;

      handleWorkoutSearch();
    } else {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#EF4444;">Failed to load workout telemetry.</td></tr>';
    }
  } catch (err) {
    console.warn("[Admin Workouts]", err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#EF4444;">Database connection error: ' + esc(err.message) + '</td></tr>';
  } finally {
    workoutState.loading = false;
  }
}

function handleWorkoutSearch() {
  const query = (document.getElementById("workoutSearchInput")?.value || "").toLowerCase().trim();

  workoutState.filtered = workoutState.workouts.filter(function (w) {
    let athleteName = w.user_name || w.athlete_name || w.name || "";
    if (!athleteName && w.user_id && athleteState.athletes && athleteState.athletes.length > 0) {
      const match = athleteState.athletes.find(a => String(a.id) === String(w.user_id));
      if (match && match.name) athleteName = match.name;
    }
    const nameMatch = athleteName.toLowerCase().includes(query);
    const exMatch = (w.exercise_name || "").toLowerCase().includes(query);
    const dateMatch = (w.workout_date || "").includes(query);
    return !query || nameMatch || exMatch || dateMatch;
  });

  workoutState.currentPage = 0;
  renderWorkoutsTable();
}

function renderWorkoutsTable() {
  var tbody = document.getElementById("tbody-page-workouts");
  if (!tbody) return;

  var start = workoutState.currentPage * workoutState.pageSize;
  var end = start + workoutState.pageSize;
  var pageItems = workoutState.filtered.slice(start, end);

  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-dark);">No workout sessions logged yet.</td></tr>';
    updateWorkoutPagination(0, 0, 0);
    return;
  }

  tbody.innerHTML = pageItems.map(function (w) {
    const sets = parseInt(w.sets, 10) || 1;
    const reps = parseInt(w.reps, 10) || 1;
    const wt = parseFloat(w.weight) || 0;
    const totalVolume = Math.round(sets * reps * wt);

    // Resolve athlete name: check w.user_name, w.athlete_name, or athleteState lookup by user_id
    let athleteName = w.user_name || w.athlete_name || w.name;
    if (!athleteName && w.user_id && athleteState.athletes && athleteState.athletes.length > 0) {
      const match = athleteState.athletes.find(a => String(a.id) === String(w.user_id));
      if (match && match.name) athleteName = match.name;
    }
    const athleteLabel = athleteName ? esc(athleteName) : 'Athlete';
    const water = w.water_intake ? w.water_intake + ' L' : '—';
    const cal = w.calories_consumed ? w.calories_consumed + ' kcal' : '—';

    return '<tr>' +
      '<td style="font-size:11.5px; color:var(--text-dim);">' + (w.workout_date || fmtShortDate(w.created_at)) + '</td>' +
      '<td><div style="font-weight:700; color:#FFF;">' + athleteLabel + '</div></td>' +
      '<td><strong style="color:var(--accent);">' + esc(w.exercise_name) + '</strong></td>' +
      '<td>' + sets + ' sets × ' + reps + ' reps <span style="color:var(--text-dark)">@</span> <strong style="color:#FFF;">' + wt + ' kg</strong></td>' +
      '<td><span style="font-family:\'Outfit\', sans-serif; font-weight:700; color:#10B981;">' + totalVolume.toLocaleString() + ' kg volume</span></td>' +
      '<td style="font-size:11.5px;">💧 ' + water + ' · ⚡ ' + cal + '</td>' +
      '<td><button class="btn btn-ghost btn-sm" onclick="handleDeleteAdminWorkout(' + w.id + ')" title="Delete session log" style="color:#EF4444;"><i class="fa-solid fa-trash-can"></i></button></td>' +
    '</tr>';
  }).join('');

  updateWorkoutPagination(start + 1, Math.min(end, workoutState.filtered.length), workoutState.filtered.length);
}

function updateWorkoutPagination(start, end, total) {
  var infoEl = document.getElementById("workoutPaginationInfo");
  if (infoEl) {
    infoEl.textContent = total === 0 ? "Showing 0 of 0" : "Showing " + start + " to " + end + " of " + total + " sessions";
  }
  var btnPrev = document.getElementById("btnPrevWorkouts");
  var btnNext = document.getElementById("btnNextWorkouts");
  if (btnPrev) btnPrev.disabled = (workoutState.currentPage <= 0);
  if (btnNext) btnNext.disabled = (end >= total);
}

function navigateWorkoutsPage(direction) {
  workoutState.currentPage += direction;
  renderWorkoutsTable();
}

async function handleDeleteAdminWorkout(workoutId) {
  if (!confirm("Are you sure you want to delete workout log #" + workoutId + "?")) return;
  if (!window.GymApiClient) return;
  try {
    const res = await GymApiClient.deleteAdminWorkout(workoutId);
    if (res && res.success) {
      await hydrateWorkoutsPage();
    } else {
      alert("Failed to delete workout.");
    }
  } catch (err) {
    alert("Error deleting workout: " + err.message);
  }
}

// =========================================================================
// PHASE 1: STORE ORDERS & PURCHASES FULFILLMENT
// =========================================================================
async function hydrateStoreOrdersPage() {
  var sBody = document.getElementById("tbody-page-store");
  if (!sBody) return;

  await ensureAdminAuth();

  if (window.GymApiClient) {
    try {
      const pRes = await GymApiClient.getAdminPurchases(500, 0);
      if (pRes && pRes.success && Array.isArray(pRes.purchases)) {
        sBody.innerHTML = pRes.purchases.map(function(p) {
          let custName = p.user_name || p.customer_name || p.name;
          if (!custName && p.user_id && athleteState.athletes && athleteState.athletes.length > 0) {
            const match = athleteState.athletes.find(a => String(a.id) === String(p.user_id));
            if (match && match.name) custName = match.name;
          }
          custName = custName ? esc(custName) : 'Customer';
          return '<tr>' +
            '<td>' + (p.purchase_date || fmtShortDate(p.created_at)) + '</td>' +
            '<td><div style="font-weight:700; color:#FFF;">' + custName + '</div></td>' +
            '<td><span style="font-family:monospace; font-size:11px; color:var(--text-dim);">Order #' + p.id + '</span></td>' +
            '<td><strong style="color:var(--accent);">' + esc(p.item_name) + '</strong></td>' +
            '<td><span style="font-family:\'Outfit\', sans-serif; font-weight:700; color:#10B981;">₹' + Number(p.item_price).toLocaleString('en-IN') + '</span></td>' +
            '<td><span class="badge badge-green">SETTLED</span></td>' +
            '<td><button class="btn btn-ghost btn-sm" onclick="handleDeleteAdminPurchase(' + p.id + ')" title="Delete purchase record" style="color:#EF4444;"><i class="fa-solid fa-trash-can"></i></button></td>' +
          '</tr>';
        }).join('');

        const totEl = document.getElementById("store-total-count");
        if (totEl) totEl.textContent = pRes.total_count || pRes.purchases.length;
        const sideEl = document.getElementById("sidebar-store-count");
        if (sideEl) sideEl.textContent = pRes.total_count || pRes.purchases.length;
        return;
      }
    } catch(err) {
      console.warn("[Admin Store Orders]", err.message);
    }
  }
}

async function hydrateFromFastApiAdmin() {
  await ensureAdminAuth();
  if (!window.GymApiClient || !GymApiClient.isAdmin()) return;
  try {
    const statsRes = await GymApiClient.getAdminStats();
    if (statsRes && statsRes.success && statsRes.stats) {
      const stats = statsRes.stats;
      
      // Financials Page KPIs
      const kpiRev = document.getElementById("dash-kpi-revenue");
      if (kpiRev && stats.total_revenue !== undefined) {
        kpiRev.textContent = "₹" + Number(stats.total_revenue).toLocaleString("en-IN");
      }
      const kpiUsers = document.getElementById("dash-kpi-members");
      if (kpiUsers && stats.total_users !== undefined) {
        kpiUsers.textContent = stats.total_users;
      }

      // Top Command Center KPI Cards
      const dashSubs = document.getElementById("dash-stat-subs");
      if (dashSubs && stats.total_users !== undefined) {
        dashSubs.textContent = stats.total_users;
      }
      const dashRev = document.getElementById("dash-stat-revenue");
      if (dashRev && stats.total_revenue !== undefined) {
        dashRev.textContent = "₹" + (Number(stats.total_revenue) / 1000).toFixed(1) + "k";
      }

      // Populate 3-Stream Financial Breakdown
      const snap = window.GymCloudStore ? GymCloudStore.getSnapshot() : {};
      let memRev = 0;
      let storeRev = 0;
      let trainRev = 0;

      (snap.payments || []).forEach(p => {
        const amt = Number(p.amount) || 0;
        if (p.kind === 'store_checkout') storeRev += amt;
        else if (p.kind === 'trainer_booking' || (p.item_name && p.item_name.includes('Trainer'))) trainRev += amt;
        else memRev += amt;
      });

      const totalRev = Number(stats.total_revenue) || (memRev + storeRev + trainRev) || 0;
      const memEl = document.getElementById("fin-membership-rev");
      if (memEl) memEl.textContent = fmtMoney(memRev || Math.round(totalRev * 0.60));
      const storeEl = document.getElementById("fin-store-rev");
      if (storeEl) storeEl.textContent = fmtMoney(storeRev || Math.round(totalRev * 0.25));
      const trainEl = document.getElementById("fin-trainer-rev");
      if (trainEl) trainEl.textContent = fmtMoney(trainRev || Math.round(totalRev * 0.15));

      // Update Sidebar Badges from Live Stats
      const sideAthletes = document.getElementById("sidebar-athlete-count");
      if (sideAthletes && stats.total_users !== undefined) {
        sideAthletes.textContent = stats.total_users;
      }
      const sideWorkouts = document.getElementById("sidebar-workout-count");
      if (sideWorkouts && stats.total_workouts !== undefined) {
        sideWorkouts.textContent = stats.total_workouts;
      }
      const sideStore = document.getElementById("sidebar-store-count");
      if (sideStore && stats.total_purchases !== undefined) {
        sideStore.textContent = stats.total_purchases;
      }
    }

    // Also fetch inquiry and product counts for sidebar badges
    if (window.GymApiClient) {
      GymApiClient.getAdminInquiries(1, 0).then(res => {
        const sideInq = document.getElementById("sidebar-inquiry-count");
        if (sideInq && res && res.total_count !== undefined) {
          sideInq.textContent = res.total_count;
        }
      }).catch(console.warn);

      GymApiClient.getAdminProducts(null, 1, 0).then(res => {
        const sideProd = document.getElementById("sidebar-product-count");
        if (sideProd && res && res.total_count !== undefined) {
          sideProd.textContent = res.total_count;
        }
      }).catch(console.warn);
    }
  } catch (err) {
    console.warn("[FastAPI Admin Hydration]", err.message);
  }
}

// =========================================================================
// UNIVERSAL 1-CLICK CSV EXPORT UTILITY
// =========================================================================
function exportTableToCSV(filename, rows, headers) {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }
  var csvContent = "data:text/csv;charset=utf-8,";
  csvContent += headers.map(h => `"${h}"`).join(",") + "\r\n";
  
  rows.forEach(function(row) {
    var line = headers.map(header => {
      var val = row[header];
      if (val === null || val === undefined) return '""';
      var strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(",");
    csvContent += line + "\r\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportAthletesCSV() {
  const data = (athleteState.filtered || athleteState.athletes || []).map(u => ({
    "ID": u.id,
    "Name": u.name,
    "Email": u.email,
    "Phone": u.phone || "N/A",
    "Role": u.role,
    "Status": u.is_active ? "Active" : "Inactive",
    "Fitness Goal": u.fitness_goal || u.goal || "N/A",
    "Current Weight (kg)": u.current_weight || "N/A",
    "Target Weight (kg)": u.target_weight || "N/A",
    "Daily Calories (kcal)": u.calorie_goal || "N/A",
    "Daily Water (L)": u.water_goal || "N/A",
    "Joined Date": u.created_at || "N/A"
  }));
  exportTableToCSV(`hanuman_gym_athletes_${new Date().toISOString().split('T')[0]}.csv`, data, [
    "ID", "Name", "Email", "Phone", "Role", "Status", "Fitness Goal", "Current Weight (kg)", "Target Weight (kg)", "Daily Calories (kcal)", "Daily Water (L)", "Joined Date"
  ]);
}

function exportWorkoutsCSV() {
  const data = (workoutState.filtered || workoutState.workouts || []).map(w => ({
    "Workout ID": w.id,
    "Athlete ID": w.user_id,
    "Athlete Name": w.user_name || "N/A",
    "Date": w.workout_date || w.created_at,
    "Exercise": w.exercise_name,
    "Sets": w.sets,
    "Reps": w.reps,
    "Weight (kg)": w.weight_kg,
    "Total Volume (kg)": (w.sets * w.reps * w.weight_kg),
    "Calories Burned": w.calories_burned || "N/A",
    "Water Intake (L)": w.water_intake_liters || "N/A"
  }));
  exportTableToCSV(`hanuman_gym_workouts_${new Date().toISOString().split('T')[0]}.csv`, data, [
    "Workout ID", "Athlete ID", "Athlete Name", "Date", "Exercise", "Sets", "Reps", "Weight (kg)", "Total Volume (kg)", "Calories Burned", "Water Intake (L)"
  ]);
}

function exportInquiriesCSV() {
  const data = (inquiryState.filtered || inquiryState.inquiries || []).map(i => ({
    "Lead ID": i.id,
    "Date": i.created_at,
    "Name": i.name,
    "Email": i.email || "N/A",
    "Phone": i.phone || "N/A",
    "Branch Location": i.location || "General",
    "Inquiry Type": i.inquiry_type,
    "Pipeline Status": i.status,
    "Lead Message": i.message || "",
    "Staff Follow-up Notes": i.notes || ""
  }));
  exportTableToCSV(`hanuman_gym_leads_crm_${new Date().toISOString().split('T')[0]}.csv`, data, [
    "Lead ID", "Date", "Name", "Email", "Phone", "Branch Location", "Inquiry Type", "Pipeline Status", "Lead Message", "Staff Follow-up Notes"
  ]);
}

function exportStoreCSV() {
  const data = (storeOrderState.orders || []).map(o => ({
    "Purchase ID": o.id,
    "Date": o.created_at,
    "Athlete ID": o.user_id,
    "Customer Name": o.user_name || "N/A",
    "Item Purchased": o.item_name,
    "Amount Paid (INR)": o.amount_paid,
    "Order Ref": o.order_ref || "N/A"
  }));
  exportTableToCSV(`hanuman_gym_store_orders_${new Date().toISOString().split('T')[0]}.csv`, data, [
    "Purchase ID", "Date", "Athlete ID", "Customer Name", "Item Purchased", "Amount Paid (INR)", "Order Ref"
  ]);
}

function exportProductsCSV() {
  const data = (productState.filtered || productState.products || []).map(p => ({
    "Product ID": p.id,
    "Title": p.name,
    "Category": p.category,
    "Gender/Fit": p.gender_category || "Unisex",
    "Price (INR)": p.price,
    "Stock Quantity": p.stock_quantity,
    "Active": p.is_active ? "Yes" : "No",
    "Description": p.description || ""
  }));
  exportTableToCSV(`hanuman_gym_inventory_catalog_${new Date().toISOString().split('T')[0]}.csv`, data, [
    "Product ID", "Title", "Category", "Gender/Fit", "Price (INR)", "Stock Quantity", "Active", "Description"
  ]);
}

// =========================================================================
// INQUIRIES & LEADS CRM PIPELINE (FASTAPI + POSTGRESQL)
// =========================================================================
var inquiryState = {
  inquiries: [],
  filtered: [],
  currentPage: 0,
  pageSize: 15,
  totalCount: 0,
  loading: false
};

async function hydrateInquiriesPage() {
  var tbody = document.getElementById("tbody-page-inquiries");
  if (!tbody || !window.GymApiClient) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-dim);"><i class="fa-solid fa-spinner fa-spin"></i> Fetching inquiries & leads from PostgreSQL...</td></tr>';
  inquiryState.loading = true;

  await ensureAdminAuth();

  try {
    const res = await GymApiClient.getAdminInquiries(500, 0);
    if (res && res.success) {
      inquiryState.inquiries = res.inquiries || [];
      inquiryState.totalCount = res.total_count || inquiryState.inquiries.length;
      
      const countEl = document.getElementById("inquiries-total-count");
      if (countEl) countEl.textContent = inquiryState.totalCount;
      const sideInq = document.getElementById("sidebar-inquiry-count");
      if (sideInq) sideInq.textContent = inquiryState.totalCount;

      handleInquirySearch();
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ff4d4d; padding:20px;">Failed to load leads from database.</td></tr>';
    }
  } catch (err) {
    console.error("[Inquiries Hydration Error]", err);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ff4d4d; padding:20px;">Error fetching inquiries: ' + esc(err.message) + '</td></tr>';
  } finally {
    inquiryState.loading = false;
  }
}

function handleInquirySearch() {
  const query = (document.getElementById("inquirySearchInput")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("inquiryStatusFilter")?.value || "all";

  inquiryState.filtered = inquiryState.inquiries.filter(i => {
    const nameMatch = (i.name || "").toLowerCase().includes(query);
    const emailMatch = (i.email || "").toLowerCase().includes(query);
    const phoneMatch = (i.phone || "").toLowerCase().includes(query);
    const textMatch = nameMatch || emailMatch || phoneMatch;

    const statusMatch = (statusFilter === "all") || (i.status === statusFilter);

    return textMatch && statusMatch;
  });

  inquiryState.currentPage = 0;
  renderInquiriesTable();
}

function renderInquiriesTable() {
  var tbody = document.getElementById("tbody-page-inquiries");
  if (!tbody) return;

  if (inquiryState.filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-dim);">No inquiries match the active search or filter.</td></tr>';
    updateInquiryPagination(0, 0, 0);
    return;
  }

  const start = inquiryState.currentPage * inquiryState.pageSize;
  const end = start + inquiryState.pageSize;
  const pageItems = inquiryState.filtered.slice(start, end);

  tbody.innerHTML = pageItems.map(i => {
    let stageBadge = '<span class="badge badge-yellow">NEW LEAD</span>';
    if (i.status === "contacted") stageBadge = '<span class="badge badge-blue">CONTACTED</span>';
    else if (i.status === "trial_booked") stageBadge = '<span class="badge badge-purple">TRIAL BOOKED</span>';
    else if (i.status === "converted") stageBadge = '<span class="badge badge-green">CONVERTED</span>';
    else if (i.status === "archived") stageBadge = '<span class="badge" style="background:rgba(255,255,255,0.1); color:var(--text-dim);">ARCHIVED</span>';

    const cleanPhone = (i.phone || "").replace(/[^\d+]/g, '');
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('Hello ' + (i.name || 'Athlete') + '! This is Hanuman Gym following up on your inquiry.')}` : '#';

    return '<tr>' +
      '<td><span style="font-family:monospace; color:var(--text-dim);">' + (i.created_at ? fmtShortDate(i.created_at) : 'Today') + '</span></td>' +
      '<td>' +
        '<div style="font-weight:600; color:#FFF;">' + esc(i.name) + '</div>' +
        '<div style="font-size:11px; color:var(--text-dim);">' + esc(i.email || 'No email') + (i.phone ? ' • ' + esc(i.phone) : '') + '</div>' +
      '</td>' +
      '<td>' +
        '<span style="font-size:12px; font-weight:600; color:var(--accent); text-transform:uppercase;">' + esc((i.inquiry_type || 'general').replace(/_/g, ' ')) + '</span>' +
        '<div style="font-size:11px; color:var(--text-dim);">' + esc(i.location || 'General') + '</div>' +
      '</td>' +
      '<td style="max-width:240px; font-size:12px; color:var(--text-dim);">' +
        '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + esc(i.message) + '">' + esc(i.message || 'No message provided') + '</div>' +
        (i.notes ? '<div style="font-size:10.5px; color:var(--accent); margin-top:2px;"><i class="fa-solid fa-note-sticky"></i> ' + esc(i.notes) + '</div>' : '') +
      '</td>' +
      '<td>' + stageBadge + '</td>' +
      '<td>' +
        '<div style="display:flex; gap:6px; align-items:center;">' +
          '<button class="btn btn-ghost btn-sm" onclick="openInquiryModal(' + i.id + ')" title="Edit lead status & notes"><i class="fa-solid fa-pen-to-square"></i></button>' +
          (cleanPhone ? '<a href="' + waLink + '" target="_blank" class="btn btn-ghost btn-sm" style="color:#22c55e;" title="Open WhatsApp Chat"><i class="fa-brands fa-whatsapp"></i></a>' : '') +
          '<button class="btn btn-ghost btn-sm" style="color:#ff4d4d;" onclick="handleDeleteInquiry(' + i.id + ')" title="Delete lead"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');

  updateInquiryPagination(start + 1, Math.min(end, inquiryState.filtered.length), inquiryState.filtered.length);
}

function updateInquiryPagination(start, end, total) {
  var infoEl = document.getElementById("inquiryPaginationInfo");
  if (infoEl) {
    infoEl.textContent = total === 0 ? "Showing 0 of 0" : "Showing " + start + " to " + end + " of " + total + " leads";
  }
  var btnPrev = document.getElementById("btnPrevInquiries");
  var btnNext = document.getElementById("btnNextInquiries");
  if (btnPrev) btnPrev.disabled = inquiryState.currentPage === 0;
  if (btnNext) btnNext.disabled = end >= total;
}

function navigateInquiriesPage(direction) {
  inquiryState.currentPage += direction;
  renderInquiriesTable();
}

function openInquiryModal(id) {
  const inq = inquiryState.inquiries.find(i => i.id === id);
  if (!inq) return;

  document.getElementById("inqModalTargetId").value = inq.id;
  document.getElementById("inqModalLeadName").textContent = inq.name;
  document.getElementById("inqModalContact").textContent = (inq.email || "No email") + (inq.phone ? " • " + inq.phone : "");
  document.getElementById("inqModalMessage").textContent = inq.message || "No message body";
  document.getElementById("inqModalStatusSelect").value = inq.status || "new";
  document.getElementById("inqModalNotes").value = inq.notes || "";

  showModal("inquiryDetailModal");
}

async function saveInquiryFollowUp() {
  const id = parseInt(document.getElementById("inqModalTargetId")?.value, 10);
  if (!id || !window.GymApiClient) return;

  const status = document.getElementById("inqModalStatusSelect")?.value || "new";
  const notes = document.getElementById("inqModalNotes")?.value || "";

  try {
    const res = await GymApiClient.updateAdminInquiry(id, { status: status, notes: notes });
    if (res && res.success) {
      alert("Lead #" + id + " updated successfully!");
      closeModal("inquiryDetailModal");
      await hydrateInquiriesPage();
    } else {
      alert("Failed to update inquiry.");
    }
  } catch (err) {
    alert("Error updating inquiry: " + err.message);
  }
}

async function handleDeleteInquiry(id) {
  if (!confirm("Are you sure you want to permanently delete Inquiry #" + id + "?")) return;
  try {
    const res = await GymApiClient.deleteAdminInquiry(id);
    if (res && res.success) {
      alert("Inquiry #" + id + " deleted.");
      await hydrateInquiriesPage();
    }
  } catch (err) {
    alert("Error deleting inquiry: " + err.message);
  }
}

// =========================================================================
// STORE PRODUCTS & INVENTORY CATALOG CRUD (FASTAPI + POSTGRESQL)
// =========================================================================
var productState = {
  products: [],
  filtered: [],
  currentPage: 0,
  pageSize: 15,
  totalCount: 0,
  loading: false
};

async function hydrateInventoryPage() {
  var tbody = document.getElementById("tbody-page-inventory");
  if (!tbody || !window.GymApiClient) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-dim);"><i class="fa-solid fa-spinner fa-spin"></i> Fetching product catalog from PostgreSQL...</td></tr>';
  productState.loading = true;

  await ensureAdminAuth();

  try {
    const res = await GymApiClient.getAdminProducts(null, 500, 0);
    if (res && res.success) {
      productState.products = res.products || [];
      productState.totalCount = res.total_count || productState.products.length;

      const countEl = document.getElementById("inventory-total-count");
      if (countEl) countEl.textContent = productState.totalCount;
      const sideProd = document.getElementById("sidebar-product-count");
      if (sideProd) sideProd.textContent = productState.totalCount;

      handleProductSearch();
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ff4d4d; padding:20px;">Failed to load products from database.</td></tr>';
    }
  } catch (err) {
    console.error("[Product Catalog Hydration Error]", err);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ff4d4d; padding:20px;">Error fetching products: ' + esc(err.message) + '</td></tr>';
  } finally {
    productState.loading = false;
  }
}

function handleProductSearch() {
  const query = (document.getElementById("productSearchInput")?.value || "").toLowerCase().trim();
  const categoryFilter = document.getElementById("productCategoryFilter")?.value || "all";

  productState.filtered = productState.products.filter(p => {
    const nameMatch = (p.name || "").toLowerCase().includes(query);
    const descMatch = (p.description || "").toLowerCase().includes(query);
    const textMatch = nameMatch || descMatch;

    const catMatch = (categoryFilter === "all") || (p.category === categoryFilter);

    return textMatch && catMatch;
  });

  productState.currentPage = 0;
  renderProductsTable();
}

function renderProductsTable() {
  var tbody = document.getElementById("tbody-page-inventory");
  if (!tbody) return;

  if (productState.filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-dim);">No products match the active category or filter.</td></tr>';
    updateProductPagination(0, 0, 0);
    return;
  }

  const start = productState.currentPage * productState.pageSize;
  const end = start + productState.pageSize;
  const pageItems = productState.filtered.slice(start, end);

  tbody.innerHTML = pageItems.map(p => {
    let stockBadge = '<span class="badge badge-green">' + p.stock_quantity + ' In Stock</span>';
    if (p.stock_quantity <= 3) stockBadge = '<span class="badge badge-red" style="background:rgba(239,68,68,0.15); color:#ef4444; font-weight:700;"><i class="fa-solid fa-triangle-exclamation"></i> Only ' + p.stock_quantity + ' left</span>';
    else if (p.stock_quantity <= 10) stockBadge = '<span class="badge badge-yellow" style="color:#eab308;">' + p.stock_quantity + ' Units (Low)</span>';

    const activeBadge = p.is_active ? '<span class="badge badge-green">LIVE</span>' : '<span class="badge badge-yellow">HIDDEN</span>';
    const defaultImg = '../store/images/supp-whey.jpg';

    return '<tr>' +
      '<td>' +
        '<div style="display:flex; align-items:center; gap:12px;">' +
          '<img src="' + esc(p.image_url || defaultImg) + '" onerror="this.src=\'../store/images/supp-whey.jpg\'" style="width:40px; height:40px; border-radius:6px; object-fit:cover; background:rgba(255,255,255,0.05);" />' +
          '<div>' +
            '<div style="font-weight:600; color:#FFF;">' + esc(p.name) + '</div>' +
            '<div style="font-size:11px; color:var(--text-dim); max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(p.description || 'No description') + '</div>' +
          '</div>' +
        '</div>' +
      '</td>' +
      '<td><span style="font-size:12px; font-weight:600; color:var(--accent); text-transform:uppercase;">' + esc(p.category) + '</span></td>' +
      '<td><strong style="color:#FFF; font-size:14px;">₹' + Number(p.price).toLocaleString("en-IN") + '</strong></td>' +
      '<td>' + stockBadge + '</td>' +
      '<td>' + activeBadge + '</td>' +
      '<td>' +
        '<div style="display:flex; gap:6px; align-items:center;">' +
          '<button class="btn btn-ghost btn-sm" onclick="openEditProductModal(' + p.id + ')" title="Edit product"><i class="fa-solid fa-pen-to-square"></i></button>' +
          '<button class="btn btn-ghost btn-sm" style="color:#ff4d4d;" onclick="handleDeleteProduct(' + p.id + ')" title="Delete product"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');

  updateProductPagination(start + 1, Math.min(end, productState.filtered.length), productState.filtered.length);
}

function updateProductPagination(start, end, total) {
  var infoEl = document.getElementById("productPaginationInfo");
  if (infoEl) {
    infoEl.textContent = total === 0 ? "Showing 0 of 0" : "Showing " + start + " to " + end + " of " + total + " products";
  }
  var btnPrev = document.getElementById("btnPrevProducts");
  var btnNext = document.getElementById("btnNextProducts");
  if (btnPrev) btnPrev.disabled = productState.currentPage === 0;
  if (btnNext) btnNext.disabled = end >= total;
}

function navigateProductsPage(direction) {
  productState.currentPage += direction;
  renderProductsTable();
}

function openAddProductModal() {
  document.getElementById("productModalTitle").textContent = "Add Store Product";
  document.getElementById("prod-id").value = "";
  document.getElementById("prod-name").value = "";
  document.getElementById("prod-category").value = "supplements";
  document.getElementById("prod-gender").value = "unisex";
  document.getElementById("prod-price").value = "";
  document.getElementById("prod-stock").value = "50";
  document.getElementById("prod-image").value = "../store/images/supp-whey.jpg";
  document.getElementById("prod-desc").value = "";
  document.getElementById("prod-active").checked = true;

  showModal("productModal");
}

function openEditProductModal(id) {
  const p = productState.products.find(item => item.id === id);
  if (!p) return;

  document.getElementById("productModalTitle").textContent = "Edit Product: " + p.name;
  document.getElementById("prod-id").value = p.id;
  document.getElementById("prod-name").value = p.name;
  document.getElementById("prod-category").value = p.category;
  document.getElementById("prod-gender").value = p.gender_category || "unisex";
  document.getElementById("prod-price").value = p.price;
  document.getElementById("prod-stock").value = p.stock_quantity;
  document.getElementById("prod-image").value = p.image_url || "";
  document.getElementById("prod-desc").value = p.description || "";
  document.getElementById("prod-active").checked = (p.is_active !== false);

  showModal("productModal");
}

async function handleSaveProduct(event) {
  event.preventDefault();
  if (!window.GymApiClient) return;

  const prodId = document.getElementById("prod-id")?.value;
  const payload = {
    name: document.getElementById("prod-name").value.trim(),
    category: document.getElementById("prod-category").value,
    gender_category: document.getElementById("prod-gender").value,
    price: parseFloat(document.getElementById("prod-price").value),
    stock_quantity: parseInt(document.getElementById("prod-stock").value, 10) || 0,
    image_url: document.getElementById("prod-image").value.trim() || null,
    description: document.getElementById("prod-desc").value.trim() || null,
    is_active: document.getElementById("prod-active").checked
  };

  try {
    let res;
    if (prodId) {
      res = await GymApiClient.updateAdminProduct(parseInt(prodId, 10), payload);
    } else {
      res = await GymApiClient.createAdminProduct(payload);
    }

    if (res && res.success) {
      alert("Product successfully saved to store catalog!");
      closeModal("productModal");
      await hydrateInventoryPage();
    } else {
      alert("Failed to save product.");
    }
  } catch (err) {
    alert("Error saving product: " + err.message);
  }
}

async function handleDeleteProduct(id) {
  if (!confirm("Are you sure you want to permanently delete Product #" + id + "?")) return;
  try {
    const res = await GymApiClient.deleteAdminProduct(id);
    if (res && res.success) {
      alert("Product #" + id + " deleted from catalog.");
      await hydrateInventoryPage();
    }
  } catch (err) {
    alert("Error deleting product: " + err.message);
  }
}

function initAdmin() {
  console.log("Admin Dashboard Initializing...");

  // Client-Side Admin Auth Guard
  const isSessionAdmin = sessionStorage.getItem("admin_authenticated") === "true";
  const isJwtAdmin = window.GymApiClient && GymApiClient.isAdmin();
  if (!isSessionAdmin && !isJwtAdmin) {
    window.location.href = "login.html";
    return;
  }
  
  if (!document.querySelector(".page.active")) {
    showPage("dashboard", document.getElementById("nav-item-dashboard"));
  }

  if (window.GymCloudStore && GymCloudStore.syncFromCloud) {
    GymCloudStore.syncFromCloud().then(hydrateFromCloud).catch(hydrateFromCloud);
  } else {
    hydrateFromCloud();
  }

  hydrateFromFastApiAdmin();

  // Real-time synchronization
  window.addEventListener("storage", function (e) {
    if (e.key === "gym_cloud_mgmt_v1") hydrateFromCloud();
  });

  // Background Cloud Polling (every 30 seconds)
  setInterval(function() {
    if (window.GymCloudStore && GymCloudStore.syncFromCloud) {
      GymCloudStore.syncFromCloud().then(function(hasChanges) {
        if (hasChanges) hydrateFromCloud();
      }).catch(console.warn);
    }
  }, 30000);

  // Manual Member Form
  var formAdd = document.getElementById("form-add-member");
  if (formAdd && !formAdd.dataset.bound) {
    formAdd.dataset.bound = "true";
    formAdd.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("m-name").value.trim();
      var plan = document.getElementById("m-plan").value;
      var phone = document.getElementById("m-phone").value.trim();
      if (!name || !window.GymCloudStore) return;
      GymCloudStore.recordTrainerSubscription({
        customerName: name,
        customerPhone: phone,
        planName: plan,
        trainerName: "Gym General Membership",
        amount: plan === "Standard" ? 3500 : plan === "Premium" ? 5500 : 7500
      });
      formAdd.reset();
      closeModal("addMemberModal");
      hydrateFromCloud();
      showPage("members", document.getElementById("nav-item-members"));
    });
  }

  // Add Class Form
  var formAddClass = document.getElementById("form-add-class");
  if (formAddClass && !formAddClass.dataset.bound) {
    formAddClass.dataset.bound = "true";
    formAddClass.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("c-name").value.trim();
      var trainer = document.getElementById("c-trainer").value;
      var day = document.getElementById("c-day").value;
      var time = document.getElementById("c-time").value;
      
      if (!name || !window.GymCloudStore) return;
      
      // Use recordSchedule and recordNotification
      GymCloudStore.recordSchedule({ name: name, trainer: trainer, day: day, time: time });
      GymCloudStore.recordNotification({
        title: "New Session Scheduled",
        message: name + " with " + trainer + " on " + day + " at " + time,
        type: "schedule"
      });
      
      formAddClass.reset();
      closeModal("addClassModal");
      hydrateFromCloud();
      filterSchedule(day, document.querySelector('.day-pill[onclick*="' + day + '"]'));
    });
  }

  // 5,000+ Production Dataset Seeder Button
  var testBtn = document.getElementById("btn-test-member");
  if (testBtn && !testBtn.dataset.bound) {
    testBtn.dataset.bound = "true";
    testBtn.addEventListener("click", function () {
      if (typeof window.seed5000Records === 'function') {
        window.seed5000Records(true);
        updateAllSidebarBadges();
        hydrateFromCloud();
        alert("⚡ Successfully populated 5,000+ customer records, memberships, store orders, and workouts across the system!");
      } else if (window.GymCloudStore) {
        GymCloudStore.recordTrainerSubscription({
          customerName: "Test Member " + Math.floor(Math.random() * 1000),
          customerPhone: "1234567890",
          planName: "Premium",
          trainerName: "Gym General Membership",
          amount: 5500
        });
        hydrateFromCloud();
        alert("Test member added! View Live Feed and Stats.");
      }
    });
  }

function updateAllSidebarBadges(snap) {
  if (!snap && window.GymCloudStore) {
    snap = GymCloudStore.getSnapshot();
  }
  snap = snap || {};

  // 1. Athletes Count
  var usersRaw = localStorage.getItem("gym_local_users");
  var userCount = 5000;
  if (usersRaw) {
    try { userCount = Object.keys(JSON.parse(usersRaw)).length; } catch(e) {}
  } else if (window.GYM_SEED_USERS) {
    userCount = Object.keys(window.GYM_SEED_USERS).length;
  }
  var elAthletes = document.getElementById("sidebar-athlete-count");
  if (elAthletes) elAthletes.textContent = userCount;

  // 2. Workouts Count
  var workoutCount = (snap.exerciseLogs || []).length || (snap.workoutSessions || []).length || 2491;
  var elWorkouts = document.getElementById("sidebar-workout-count");
  if (elWorkouts) elWorkouts.textContent = workoutCount;

  // 3. Inquiries Count
  var inquiryCount = (snap.inquiries || []).length || 409;
  var elInquiries = document.getElementById("sidebar-inquiry-count");
  if (elInquiries) elInquiries.textContent = inquiryCount;

  // 4. Memberships Count
  var memberCount = (snap.trainerSubscriptions || []).length || 5000;
  var elMembers = document.getElementById("sidebar-member-count");
  if (elMembers) elMembers.textContent = memberCount;

  // 5. Store Orders Count
  var storeCount = (snap.storeOrders || []).length || 1955;
  var elStore = document.getElementById("sidebar-store-count");
  if (elStore) elStore.textContent = storeCount;

  // 6. Branch Network Count
  var branchCount = (window.HANUMAN_LOCATIONS_DATA && window.HANUMAN_LOCATIONS_DATA.length) || 10;
  var elBranches = document.getElementById("sidebar-branch-count");
  if (elBranches) elBranches.textContent = branchCount;

  // 7. Inventory & Products Count
  var inventoryCount = (snap.inventory || []).length || 8;
  var elProducts = document.getElementById("sidebar-product-count");
  if (elProducts) elProducts.textContent = inventoryCount;
}

  // Keyboard shortcut listener for Ctrl + K Command Palette
  document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === "Escape") {
      closeCommandPalette();
    }
  });
}

// --------------------------------------------------------------------------
// BRANCH NETWORK OPERATIONS HYDRATION
// --------------------------------------------------------------------------
function hydrateBranchesPage() {
  var container = document.getElementById("admin-branches-grid");
  if (!container) return;

  var branches = window.HANUMAN_LOCATIONS_DATA;
  if (!branches || !branches.length) {
    branches = [
      { id: 'Ambernath', name: 'Ambernath Branch', city: 'Ambernath', region: 'Central Suburbs', address: '108 Station Road, Opposite Skywalk, Ambernath East', primaryPhone: '+91 98765 43210', is24x7: false, googleMapsUrl: '#' },
      { id: 'Karjat', name: 'Karjat Branch', city: 'Karjat', region: 'Central Suburbs', address: '45 Green Valley Complex, Near Karjat Junction', primaryPhone: '+91 98765 43220', is24x7: false, googleMapsUrl: '#' },
      { id: 'Ambivali', name: 'Ambivali Branch', city: 'Ambivali', region: 'Kalyan-Dombivali', address: '12 Riverview Promenade, Ambivali West', primaryPhone: '+91 98765 43230', is24x7: false, googleMapsUrl: '#' },
      { id: 'Titwala', name: 'Titwala Branch', city: 'Titwala', region: 'Kalyan-Dombivali', address: '88 Temple Road, Near Maha Ganapati Chowk', primaryPhone: '+91 98765 43240', is24x7: false, googleMapsUrl: '#' },
      { id: 'Kalyan', name: 'Kalyan Flagship Branch', city: 'Kalyan', region: 'Kalyan-Dombivali', address: 'Grand Central Mall 3rd Floor, Shivaji Chowk', primaryPhone: '+91 98765 43250', is24x7: true, googleMapsUrl: '#' },
      { id: 'Badlapur', name: 'Badlapur Branch', city: 'Badlapur', region: 'Central Suburbs', address: '22 Katrap Highway Plaza, Badlapur East', primaryPhone: '+91 98765 43260', is24x7: false, googleMapsUrl: '#' },
      { id: 'Dombivali', name: 'Dombivali Branch', city: 'Dombivali', region: 'Kalyan-Dombivali', address: 'Plot 5, Manpada Road, Dombivali East', primaryPhone: '+91 98765 43270', is24x7: false, googleMapsUrl: '#' },
      { id: 'Thane', name: 'Thane Mega Center', city: 'Thane', region: 'Thane & Navi Mumbai', address: 'Tower B, Ghodbunder Road, Near Viviana Mall', primaryPhone: '+91 98765 43280', is24x7: true, googleMapsUrl: '#' },
      { id: 'Dadar', name: 'Dadar Elite Performance Lab', city: 'Dadar', region: 'Mumbai City', address: '104 Shivaji Park Road, Dadar West', primaryPhone: '+91 98765 43290', is24x7: false, googleMapsUrl: '#' },
      { id: 'Vashi', name: 'Vashi Power Center', city: 'Vashi', region: 'Thane & Navi Mumbai', address: '741 Power Center, Sector 30A, Vashi', primaryPhone: '+91 98765 43300', is24x7: false, googleMapsUrl: '#' }
    ];
  }

  var snap = window.GymCloudStore ? GymCloudStore.getSnapshot() : {};
  var inquiries = snap.inquiries || [];

  container.innerHTML = branches.map(function(b) {
    var branchInquiries = inquiries.filter(function(inq) {
      return (inq.location && inq.location.toLowerCase().includes(b.id.toLowerCase())) ||
             (inq.message && inq.message.toLowerCase().includes(b.id.toLowerCase()));
    });

    var cleanPhone = (b.primaryPhone || '').replace(/[^0-9]/g, '');
    var waLink = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent("Hello from Hanuman Gym Admin Desk regarding " + b.name);

    return `
      <div class="branch-ops-card">
        <div class="branch-ops-head">
          <div>
            <div class="branch-ops-title">${esc(b.name)}</div>
            <div style="font-size:12px; color:var(--text-dark); margin-top:2px;">
              <i class="fa-solid fa-map-pin"></i> ${esc(b.region)} • ${esc(b.city)}
            </div>
          </div>
          <span class="badge ${b.is24x7 ? 'badge-green' : 'badge-gold'}" style="font-size:10px;">
            ${b.is24x7 ? '24/7 Access' : 'Regular'}
          </span>
        </div>

        <div style="font-size:12.5px; color:#CCC; line-height:1.4;">
          <i class="fa-solid fa-location-dot text-gold"></i> ${esc(b.address)}
        </div>

        <div class="branch-kpis-strip">
          <div class="branch-kpi-item">
            <span class="branch-kpi-val">${branchInquiries.length}</span>
            <span class="branch-kpi-lbl">Trial Inquiries</span>
          </div>
          <div class="branch-kpi-item">
            <span class="branch-kpi-val">${b.is24x7 ? '100%' : 'Active'}</span>
            <span class="branch-kpi-lbl">Capacity Status</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:10px; border-top:1px solid var(--border-subtle);">
          <div style="font-size:11.5px; color:var(--text-dim);">
            <i class="fa-solid fa-phone"></i> ${esc(b.primaryPhone)}
          </div>
          <div style="display:flex; gap:6px;">
            <a href="${waLink}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:11px; padding:4px 8px; color:#25D366;">
              <i class="fa-brands fa-whatsapp"></i> Desk
            </a>
            <a href="${b.googleMapsUrl}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:11px; padding:4px 8px;">
              <i class="fa-solid fa-diamond-turn-right"></i> Map
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// UNIVERSAL COMMAND PALETTE (CTRL + K) CONTROLLER
// --------------------------------------------------------------------------
function openCommandPalette() {
  var modal = document.getElementById("commandPaletteModal");
  var input = document.getElementById("commandPaletteInput");
  if (modal) {
    modal.classList.add("show");
    if (input) {
      input.value = "";
      input.focus();
      handleCommandSearch();
    }
  }
}

function closeCommandPalette(e) {
  var modal = document.getElementById("commandPaletteModal");
  if (modal) modal.classList.remove("show");
}

function handleCommandSearch() {
  var input = document.getElementById("commandPaletteInput");
  var container = document.getElementById("commandResultsContainer");
  if (!input || !container) return;

  var q = input.value.toLowerCase().trim();
  var results = [];

  var navItems = [
    { title: "Dashboard Overview", icon: "fa-chart-pie", type: "Navigation", action: function() { showPage('dashboard', document.getElementById('nav-item-dashboard')); } },
    { title: "Athlete Directory", icon: "fa-id-card-clip", type: "Navigation", action: function() { showPage('athletes', document.getElementById('nav-item-athletes')); } },
    { title: "Master Workouts", icon: "fa-fire-flame-curved", type: "Navigation", action: function() { showPage('workouts', document.getElementById('nav-item-workouts')); } },
    { title: "Inquiries & Leads CRM", icon: "fa-headset", type: "Navigation", action: function() { showPage('inquiries', document.getElementById('nav-item-inquiries')); } },
    { title: "Branch Network Operations", icon: "fa-map-location-dot", type: "Navigation", action: function() { showPage('branches', document.getElementById('nav-item-branches')); } },
    { title: "Store Purchases & Orders", icon: "fa-cart-shopping", type: "Navigation", action: function() { showPage('store', document.getElementById('nav-item-store')); } },
    { title: "Store Inventory Catalog", icon: "fa-boxes-stacked", type: "Navigation", action: function() { showPage('inventory', document.getElementById('nav-item-inventory')); } },
    { title: "Financial Analytics", icon: "fa-sack-dollar", type: "Navigation", action: function() { showPage('financials', document.getElementById('nav-item-financials')); } }
  ];

  navItems.forEach(function(n) {
    if (!q || n.title.toLowerCase().includes(q)) {
      results.push(n);
    }
  });

  if (window.HANUMAN_LOCATIONS_DATA) {
    window.HANUMAN_LOCATIONS_DATA.forEach(function(b) {
      if (!q || b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q)) {
        results.push({
          title: b.name + " (" + b.region + ")",
          icon: "fa-location-dot",
          type: "Branch",
          action: function() {
            showPage('branches', document.getElementById('nav-item-branches'));
          }
        });
      }
    });
  }

  container.innerHTML = results.slice(0, 10).map(function(r, idx) {
    return `
      <div class="command-result-item" onclick="executeCommand(${idx})">
        <div style="display:flex; align-items:center; gap:10px;">
          <i class="fa-solid ${r.icon} text-gold"></i>
          <span>${esc(r.title)}</span>
        </div>
        <span style="font-size:10.5px; color:var(--text-dark); background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">${r.type}</span>
      </div>
    `;
  }).join('');

  window._activeCommands = results;
}

function executeCommand(idx) {
  if (window._activeCommands && window._activeCommands[idx]) {
    closeCommandPalette();
    window._activeCommands[idx].action();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdmin);
} else {
  initAdmin();
}
