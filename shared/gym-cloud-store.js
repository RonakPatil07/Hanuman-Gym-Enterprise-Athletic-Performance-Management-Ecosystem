/**
 * Gym Cloud Store — localStorage + Supabase cross-device sync.
 * Supports Store, Trainers, Exercise Logs, Workouts, and My Space.
 */
(function (global) {
  var STORAGE_KEY = "gym_cloud_mgmt_v1";

  function nowIso() {
    return new Date().toISOString();
  }

  function uid() {
    return (
      "gc_" +
      Math.random().toString(36).slice(2, 10) +
      "_" +
      Date.now().toString(36)
    );
  }

  function getDefault() {
    if (global.GYM_SEED_DATABASE) {
      try {
        return JSON.parse(JSON.stringify(global.GYM_SEED_DATABASE));
      } catch (e) {}
    }
    return {
      meta: {
        schemaVersion: 2,
        lastUpdated: null,
        cloudLabel: "localStorage + Supabase Active",
        note: "Automatic 2-way cloud synchronization for store orders, trainers, workouts, and members.",
      },
      storeOrders: [],
      trainerSubscriptions: [],
      payments: [],
      exerciseLogs: [],
      workoutSessions: [],
      schedules: [],
      notifications: [],
      inquiries: [],
    };
  }

  function read() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefault();
      var data = JSON.parse(raw);
      var base = getDefault();
      base.meta = Object.assign({}, base.meta, data.meta || {});
      base.storeOrders = Array.isArray(data.storeOrders) ? data.storeOrders : [];
      base.trainerSubscriptions = Array.isArray(data.trainerSubscriptions)
        ? data.trainerSubscriptions
        : [];
      base.payments = Array.isArray(data.payments) ? data.payments : [];
      base.exerciseLogs = Array.isArray(data.exerciseLogs) ? data.exerciseLogs : [];
      base.workoutSessions = Array.isArray(data.workoutSessions) ? data.workoutSessions : [];
      base.schedules = Array.isArray(data.schedules) ? data.schedules : [];
      base.notifications = Array.isArray(data.notifications) ? data.notifications : [];
      base.inquiries = Array.isArray(data.inquiries) ? data.inquiries : [];
      return base;
    } catch (e) {
      return getDefault();
    }
  }

  function write(state) {
    state.meta = state.meta || {};
    state.meta.lastUpdated = nowIso();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function mergeArraysById(localArr, remoteArr) {
    var map = new Map();
    (localArr || []).forEach(function (item) {
      if (item && item.id) map.set(item.id, item);
    });
    (remoteArr || []).forEach(function (item) {
      if (item && item.id) map.set(item.id, item);
    });
    var adapter = global.GymCloudAdapter;
    var list = Array.from(map.values());
    if (adapter && adapter.sortByCreatedDesc) {
      return adapter.sortByCreatedDesc(list);
    }
    return list.sort(function (a, b) {
      return (
        new Date(b.createdAt || b.workout_date || 0).getTime() -
        new Date(a.createdAt || a.workout_date || 0).getTime()
      );
    });
  }

  function pushToCloud(type, payload) {
    var adapter = global.GymCloudAdapter;
    if (!adapter || !adapter.isConfigured || !adapter.isConfigured()) return;
    if (adapter.pushEvent) {
      adapter.pushEvent(type, payload);
    }
  }

  var GymCloudStore = {
    getSnapshot: function () {
      return read();
    },

    /**
     * Merge Supabase rows into localStorage.
     * @returns {Promise<boolean>}
     */
    syncFromCloud: function () {
      var adapter = global.GymCloudAdapter;
      if (!adapter || !adapter.isConfigured || !adapter.isConfigured()) {
        return Promise.resolve(false);
      }
      if (!adapter.fetchSnapshot) return Promise.resolve(false);
      return adapter.fetchSnapshot().then(function (remote) {
        if (!remote) return false;
        var local = read();
        var merged = {
          meta: Object.assign({}, local.meta, {
            lastUpdated: nowIso(),
            cloudLabel: "localStorage + Supabase Active",
          }),
          storeOrders: mergeArraysById(local.storeOrders, remote.storeOrders),
          trainerSubscriptions: mergeArraysById(
            local.trainerSubscriptions,
            remote.trainerSubscriptions
          ),
          exerciseLogs: mergeArraysById(local.exerciseLogs, remote.exerciseLogs),
          workoutSessions: mergeArraysById(local.workoutSessions, remote.workoutSessions),
          payments: mergeArraysById(local.payments, remote.payments),
          schedules: mergeArraysById(local.schedules, remote.schedules),
          notifications: mergeArraysById(local.notifications, remote.notifications),
          inquiries: mergeArraysById(local.inquiries, remote.inquiries),
        };
        write(merged);
        return true;
      });
    },

    /**
     * Push every row in this browser to Supabase.
     */
    pushAllLocalToSupabase: function () {
      var adapter = global.GymCloudAdapter;
      if (!adapter || !adapter.isConfigured || !adapter.isConfigured()) {
        return Promise.resolve({ ok: false, reason: "not_configured" });
      }
      if (!adapter.pushEvent) {
        return Promise.resolve({ ok: false, reason: "no_adapter" });
      }
      var state = read();
      var tasks = [];
      function enqueue(type, row) {
        if (row && row.id) tasks.push(adapter.pushEvent(type, row));
      }
      (state.storeOrders || []).forEach(function (r) {
        enqueue("store_order", r);
      });
      (state.trainerSubscriptions || []).forEach(function (r) {
        enqueue("trainer_subscription", r);
      });
      (state.payments || []).forEach(function (r) {
        enqueue("payment_row", r);
      });
      (state.exerciseLogs || []).forEach(function (r) {
        enqueue("exercise_log", r);
      });
      (state.workoutSessions || []).forEach(function (r) {
        enqueue("workout_session", r);
      });
      (state.schedules || []).forEach(function (r) {
        enqueue("schedule_item", r);
      });
      (state.notifications || []).forEach(function (r) {
        enqueue("notification_item", r);
      });
      (state.inquiries || []).forEach(function (r) {
        enqueue("inquiry_item", r);
      });
      if (tasks.length === 0) {
        return Promise.resolve({ ok: true, pushed: 0, total: 0 });
      }
      return Promise.all(tasks).then(function (results) {
        var pushed = results.filter(function (x) {
          return x === true;
        }).length;
        return { ok: true, pushed: pushed, total: tasks.length };
      });
    },

    recordStorePurchase: function (entry) {
      var state = read();
      var row = Object.assign(
        { id: uid(), source: "store", createdAt: nowIso() },
        entry
      );
      var paymentRow = {
        id: uid(),
        kind: "store_checkout",
        amount: entry.amount,
        method: entry.method || "—",
        customerName: entry.customerName || "—",
        reference: row.id,
        createdAt: row.createdAt,
        detail: entry.productName || "Store order",
      };
      state.storeOrders.unshift(row);
      state.payments.unshift(paymentRow);
      write(state);
      pushToCloud("store_order", row);
      pushToCloud("payment_row", paymentRow);
      return row;
    },

    recordTrainerSubscription: function (entry) {
      var state = read();
      var providedId = entry.id;
      var row = Object.assign(
        { id: providedId || uid(), source: "trainer", createdAt: nowIso() },
        entry
      );
      var paymentRow = {
        id: providedId ? "p_" + providedId : uid(),
        kind: "trainer_subscription",
        amount: entry.amount,
        method: "Membership",
        customerName: entry.customerName || "—",
        reference: row.id,
        createdAt: row.createdAt,
        detail:
          (entry.planName || "Plan") +
          (entry.trainerName ? " — " + entry.trainerName : ""),
      };
      state.trainerSubscriptions.unshift(row);
      state.payments.unshift(paymentRow);
      write(state);
      pushToCloud("trainer_subscription", row);
      pushToCloud("payment_row", paymentRow);
      return row;
    },

    recordExerciseLog: function (entry) {
      var state = read();
      var row = Object.assign({ id: uid(), createdAt: nowIso() }, entry);
      state.exerciseLogs.unshift(row);
      write(state);
      pushToCloud("exercise_log", row);
      return row;
    },

    recordWorkoutSession: function (entry) {
      var state = read();
      var row = Object.assign(
        { id: entry.id || uid(), createdAt: nowIso() },
        entry
      );
      state.workoutSessions.unshift(row);
      write(state);
      pushToCloud("workout_session", row);
      return row;
    },

    recordSchedule: function (entry) {
      var state = read();
      var row = Object.assign({ id: uid(), createdAt: nowIso() }, entry);
      state.schedules.unshift(row);
      write(state);
      pushToCloud("schedule_item", row);
      return row;
    },

    recordInquiry: function (entry) {
      var state = read();
      var row = Object.assign({ id: uid(), createdAt: nowIso() }, entry);
      state.inquiries.unshift(row);
      write(state);
      pushToCloud("inquiry_item", row);
      return row;
    },

    recordNotification: function (entry) {
      var state = read();
      var row = Object.assign({ id: uid(), createdAt: nowIso(), seen: false }, entry);
      state.notifications.unshift(row);
      if (state.notifications.length > 20) state.notifications = state.notifications.slice(0, 20);
      write(state);
      pushToCloud("notification_item", row);
      return row;
    },

    exportJson: function () {
      return JSON.stringify(read(), null, 2);
    },

    importJson: function (jsonStr) {
      var parsed = JSON.parse(jsonStr);
      write(parsed);
    },

    generateUid: function () {
      return uid();
    },

    clearAll: function () {
      localStorage.removeItem(STORAGE_KEY);
    },
  };

  global.GymCloudStore = GymCloudStore;
})(typeof window !== "undefined" ? window : this);
