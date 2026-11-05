/**
 * Supabase REST adapter for gym site data (Admin & My Space Cloud Sync).
 * Requires window.GYM_CLOUD_CONFIG = { supabaseUrl, supabaseAnonKey }
 */
(function (global) {
  function getConfig() {
    return global.GYM_CLOUD_CONFIG || null;
  }

  function isConfigured() {
    var c = getConfig();
    if (!c || !c.supabaseUrl || !c.supabaseAnonKey) return false;
    if (String(c.supabaseUrl).indexOf("YOUR_PROJECT") !== -1) return false;
    if (String(c.supabaseAnonKey).indexOf("YOUR_ANON") !== -1) return false;
    return true;
  }

  function headers() {
    var c = getConfig();
    var k = c.supabaseAnonKey;
    return {
      apikey: k,
      Authorization: "Bearer " + k,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };
  }

  function baseUrl() {
    return String(getConfig().supabaseUrl).replace(/\/$/, "");
  }

  /**
   * @param {string} type store_order | trainer_subscription | exercise_log | payment_row | workout_session | profile_sync
   * @param {object} payload full row (must include id)
   */
  function pushEvent(type, payload) {
    if (!isConfigured() || !payload || !payload.id) return Promise.resolve(false);
    var url = baseUrl() + "/rest/v1/gym_cloud_events";
    var row = {
      id: String(payload.id),
      event_type: type,
      payload: payload,
    };
    return fetch(url, {
      method: "POST",
      headers: Object.assign({}, headers(), {
        Prefer: "return=minimal,resolution=merge-duplicates",
      }),
      body: JSON.stringify([row]),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) {
            console.warn("Cloud push failed:", res.status, t);
            return false;
          });
        }
        return true;
      })
      .catch(function (e) {
        console.warn("Cloud push error:", e);
        return false;
      });
  }

  /**
   * @returns {Promise<{storeOrders:object[],trainerSubscriptions:object[],exerciseLogs:object[],payments:object[],workoutSessions:object[]}|null>}
   */
  function fetchSnapshot() {
    if (!isConfigured()) return Promise.resolve(null);
    var url =
      baseUrl() +
      "/rest/v1/gym_cloud_events?select=id,event_type,payload,created_at&order=created_at.asc";
    return fetch(url, {
      headers: Object.assign({}, headers(), { Range: "0-19999" }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) {
            console.warn("Cloud fetch failed:", res.status, t);
            return null;
          });
        }
        return res.json();
      })
      .then(function (rows) {
        if (!rows || !Array.isArray(rows)) return null;
        var snap = {
          storeOrders: [],
          trainerSubscriptions: [],
          exerciseLogs: [],
          payments: [],
          workoutSessions: [],
          inquiries: [],
        };
        rows.forEach(function (r) {
          var p = r.payload;
          if (p == null) return;
          if (typeof p === "string") {
            try {
              p = JSON.parse(p);
            } catch (e) {
              return;
            }
          }
          switch (r.event_type) {
            case "store_order":
              snap.storeOrders.push(p);
              break;
            case "trainer_subscription":
              snap.trainerSubscriptions.push(p);
              break;
            case "exercise_log":
              snap.exerciseLogs.push(p);
              break;
            case "payment_row":
              snap.payments.push(p);
              break;
            case "workout_session":
              snap.workoutSessions.push(p);
              break;
            case "inquiry_item":
              snap.inquiries.push(p);
              break;
            default:
              break;
          }
        });
        return snap;
      })
      .catch(function (e) {
        console.warn("Cloud fetch error:", e);
        return null;
      });
  }

  function sortByCreatedDesc(arr) {
    return (arr || []).slice().sort(function (a, b) {
      var ta = new Date(a.createdAt || 0).getTime();
      var tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });
  }

  /**
   * Workout wizard JSON blob (id = stable client id e.g. localStorage key).
   */
  function saveWorkoutWizardBlob(clientId, payloadObj) {
    if (!isConfigured() || !clientId) return Promise.resolve(false);
    var url = baseUrl() + "/rest/v1/gym_workout_wizard";
    var row = {
      id: String(clientId),
      payload: payloadObj,
      updated_at: new Date().toISOString(),
    };
    return fetch(url, {
      method: "POST",
      headers: Object.assign({}, headers(), {
        Prefer: "resolution=merge-duplicates",
      }),
      body: JSON.stringify([row]),
    })
      .then(function (res) {
        return res.ok;
      })
      .catch(function () {
        return false;
      });
  }

  function loadWorkoutWizardBlob(clientId) {
    if (!isConfigured() || !clientId) return Promise.resolve(null);
    var url =
      baseUrl() +
      "/rest/v1/gym_workout_wizard?id=eq." +
      encodeURIComponent(clientId) +
      "&select=payload";
    return fetch(url, { headers: headers() })
      .then(function (res) {
        return res.json();
      })
      .then(function (rows) {
        if (!rows || !rows[0]) return null;
        return rows[0].payload;
      })
      .catch(function () {
        return null;
      });
  }

  global.GymCloudAdapter = {
    isConfigured: isConfigured,
    pushEvent: pushEvent,
    fetchSnapshot: fetchSnapshot,
    sortByCreatedDesc: sortByCreatedDesc,
    saveWorkoutWizardBlob: saveWorkoutWizardBlob,
    loadWorkoutWizardBlob: loadWorkoutWizardBlob,
  };
})(typeof window !== "undefined" ? window : this);
