package com.cryptopanda94.quranduas;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

/** Home-screen widget: next prayer, its time and a live countdown. */
public class PrayerWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) {
        updateAll(ctx, m, ids);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (WidgetData.ACTION_REFRESH.equals(intent.getAction())) WidgetData.refreshAll(ctx);
    }

    static void updateAll(Context ctx, AppWidgetManager m, int[] ids) {
        if (ids == null || ids.length == 0) return;
        long now = System.currentTimeMillis();
        JSONObject data = WidgetData.load(ctx);
        JSONObject next = WidgetData.nextPrayer(data, now);

        for (int id : ids) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_prayer);
            v.setOnClickPendingIntent(R.id.wp_root, WidgetData.openApp(ctx));
            if (next == null) {
                v.setTextViewText(R.id.wp_name, "Quran & Duas");
                v.setTextViewText(R.id.wp_urdu, "");
                v.setTextViewText(R.id.wp_time, "Open the app and choose your city");
                v.setViewVisibility(R.id.wp_countdown, View.GONE);
                v.setTextViewText(R.id.wp_city, "");
            } else {
                long t = (long) next.optDouble("t", 0);
                v.setTextViewText(R.id.wp_name, next.optString("n"));
                v.setTextViewText(R.id.wp_urdu, next.optString("u"));
                v.setTextViewText(R.id.wp_time, WidgetData.time(ctx, t));
                v.setViewVisibility(R.id.wp_countdown, View.VISIBLE);
                // Chronometer counting down to the prayer (ticks by itself, no battery-hungry updates)
                v.setChronometer(R.id.wp_countdown, SystemClock.elapsedRealtime() + (t - now), "in %s", true);
                if (android.os.Build.VERSION.SDK_INT >= 24) v.setChronometerCountDown(R.id.wp_countdown, true);
                v.setTextViewText(R.id.wp_city, data.optString("loc"));
            }
            m.updateAppWidget(id, v);
        }
        if (next != null) WidgetData.scheduleNextRefresh(ctx, (long) next.optDouble("t", 0));
        else WidgetData.scheduleNextRefresh(ctx, WidgetData.nextMidnight());
    }
}
