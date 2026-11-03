package com.cryptopanda94.quranduas;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

import org.json.JSONObject;

/** Home-screen widget: ayah of the day in Arabic and English. */
public class AyahWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) {
        updateAll(ctx, m, ids);
    }

    static void updateAll(Context ctx, AppWidgetManager m, int[] ids) {
        if (ids == null || ids.length == 0) return;
        JSONObject a = WidgetData.todaysAyah(WidgetData.load(ctx));
        for (int id : ids) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_ayah);
            v.setOnClickPendingIntent(R.id.wa_root, WidgetData.openApp(ctx));
            if (a == null) {
                v.setTextViewText(R.id.wa_ref, "AYAH OF THE DAY");
                v.setTextViewText(R.id.wa_ar, "");
                v.setTextViewText(R.id.wa_en, "Open Quran & Duas once to load today's ayah.");
            } else {
                v.setTextViewText(R.id.wa_ref, ("Ayah of the day · " + a.optString("ref")).toUpperCase());
                v.setTextViewText(R.id.wa_ar, a.optString("ar"));
                v.setTextViewText(R.id.wa_en, a.optString("en"));
            }
            m.updateAppWidget(id, v);
        }
    }
}
