package com.cryptopanda94.quranduas;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/** Reads the data the app saves for the widgets (next prayers + ayah of the day). */
public final class WidgetData {
    static final String PREFS = "quran_widget";
    static final String KEY = "widgetData";
    static final String ACTION_REFRESH = "com.cryptopanda94.quranduas.WIDGET_REFRESH";

    private WidgetData() {}

    static JSONObject load(Context ctx) {
        try {
            String s = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null);
            return s == null ? null : new JSONObject(s);
        } catch (Exception e) {
            return null;
        }
    }

    /** The next prayer after now, or null. Returns {k,n,u,t}. */
    static JSONObject nextPrayer(JSONObject data, long now) {
        if (data == null) return null;
        JSONArray ps = data.optJSONArray("prayers");
        if (ps == null) return null;
        JSONObject best = null;
        for (int i = 0; i < ps.length(); i++) {
            JSONObject p = ps.optJSONObject(i);
            if (p == null) continue;
            long t = (long) p.optDouble("t", 0);
            if (t > now && (best == null || t < (long) best.optDouble("t", 0))) best = p;
        }
        return best;
    }

    /** Today's ayah ({d, ref, ar, en}), falling back to the last one saved. */
    static JSONObject todaysAyah(JSONObject data) {
        if (data == null) return null;
        JSONArray as = data.optJSONArray("ayahs");
        if (as == null || as.length() == 0) return null;
        Calendar c = Calendar.getInstance();
        String key = String.format(Locale.US, "%04d-%02d-%02d",
                c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
        for (int i = 0; i < as.length(); i++) {
            JSONObject a = as.optJSONObject(i);
            if (a != null && key.equals(a.optString("d"))) return a;
        }
        return as.optJSONObject(as.length() - 1);
    }

    static String time(Context ctx, long t) {
        return android.text.format.DateFormat.getTimeFormat(ctx).format(new Date(t));
    }

    /** Redraw both widgets. */
    static void refreshAll(Context ctx) {
        AppWidgetManager m = AppWidgetManager.getInstance(ctx);
        PrayerWidget.updateAll(ctx, m, m.getAppWidgetIds(new ComponentName(ctx, PrayerWidget.class)));
        AyahWidget.updateAll(ctx, m, m.getAppWidgetIds(new ComponentName(ctx, AyahWidget.class)));
    }

    /** Wake up at the next prayer time (or next midnight) to redraw. Inexact is fine for a widget. */
    static void scheduleNextRefresh(Context ctx, long at) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent i = new Intent(ctx, PrayerWidget.class).setAction(ACTION_REFRESH);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        PendingIntent pi = PendingIntent.getBroadcast(ctx, 1001, i, flags);
        am.cancel(pi);
        if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC, at + 1000, pi);
        else am.set(AlarmManager.RTC, at + 1000, pi);
    }

    static long nextMidnight() {
        Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_MONTH, 1);
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 5); c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis();
    }

    static PendingIntent openApp(Context ctx) {
        Intent i = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (i == null) i = new Intent(ctx, MainActivity.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        return PendingIntent.getActivity(ctx, 0, i, flags);
    }
}
