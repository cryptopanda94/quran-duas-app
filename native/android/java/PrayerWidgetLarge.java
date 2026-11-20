package com.cryptopanda94.quranduas;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/** Large home-screen widget: city and Islamic date, the next prayer with a countdown, and the next five prayer times. */
public class PrayerWidgetLarge extends AppWidgetProvider {

    private static final int[] ROW = { R.id.wpl_row1, R.id.wpl_row2, R.id.wpl_row3, R.id.wpl_row4, R.id.wpl_row5 };
    private static final int[] NAME = { R.id.wpl_n1, R.id.wpl_n2, R.id.wpl_n3, R.id.wpl_n4, R.id.wpl_n5 };
    private static final int[] TIME = { R.id.wpl_t1, R.id.wpl_t2, R.id.wpl_t3, R.id.wpl_t4, R.id.wpl_t5 };
    private static final int WHITE = 0xFFFFFFFF, DEEP = 0xFF0F3F68;

    @Override
    public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) {
        updateAll(ctx, m, ids);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager m, int id, Bundle o) {
        updateAll(ctx, m, new int[]{ id });
    }

    static void updateAll(Context ctx, AppWidgetManager m, int[] ids) {
        if (ids == null || ids.length == 0) return;
        long now = System.currentTimeMillis();
        JSONObject data = WidgetData.load(ctx);
        JSONObject next = WidgetData.nextPrayer(data, now);

        for (int id : ids) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_prayer_large);
            v.setOnClickPendingIntent(R.id.wpl_root, WidgetData.openApp(ctx));
            if (next == null) {
                v.setTextViewText(R.id.wpl_city, "");
                v.setTextViewText(R.id.wpl_hijri, "");
                v.setTextViewText(R.id.wpl_name, "Quran & Duas");
                v.setTextViewText(R.id.wpl_urdu, "");
                v.setTextViewText(R.id.wpl_time, "Open the app and choose your city");
                v.setViewVisibility(R.id.wpl_countdown, View.GONE);
                for (int r : ROW) v.setViewVisibility(r, View.INVISIBLE);
            } else {
                long t = (long) next.optDouble("t", 0);
                v.setTextViewText(R.id.wpl_city, data.optString("loc"));
                v.setTextViewText(R.id.wpl_hijri, data.optString("hijri"));
                v.setTextViewText(R.id.wpl_name, next.optString("n"));
                v.setTextViewText(R.id.wpl_urdu, next.optString("u"));
                v.setTextViewText(R.id.wpl_time, WidgetData.time(ctx, t));
                v.setViewVisibility(R.id.wpl_countdown, View.VISIBLE);
                v.setChronometer(R.id.wpl_countdown, SystemClock.elapsedRealtime() + (t - now), "in %s", true);
                if (android.os.Build.VERSION.SDK_INT >= 24) v.setChronometerCountDown(R.id.wpl_countdown, true);

                // the next five prayers, soonest first; the first row is the next prayer
                JSONArray a = data.optJSONArray("prayers");
                int n = 0;
                for (int i = 0; a != null && i < a.length() && n < ROW.length; i++) {
                    JSONObject p = a.optJSONObject(i);
                    if (p == null) continue;
                    long pt = (long) p.optDouble("t", 0);
                    if (pt <= now) continue;
                    boolean first = n == 0;
                    v.setViewVisibility(ROW[n], View.VISIBLE);
                    v.setInt(ROW[n], "setBackgroundResource", first ? R.drawable.widget_row_next : R.drawable.widget_row);
                    v.setTextViewText(NAME[n], p.optString("n"));
                    v.setTextViewText(TIME[n], WidgetData.time(ctx, pt));
                    v.setTextColor(NAME[n], first ? DEEP : WHITE);
                    v.setTextColor(TIME[n], first ? DEEP : WHITE);
                    n++;
                }
                for (; n < ROW.length; n++) v.setViewVisibility(ROW[n], View.INVISIBLE);
            }
            m.updateAppWidget(id, v);
        }
    }
}
