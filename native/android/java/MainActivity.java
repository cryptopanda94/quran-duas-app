package com.cryptopanda94.quranduas;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);   // app -> widgets data
        createAzanChannels();
        super.onCreate(savedInstanceState);
    }

    /**
     * Azan channels use the ALARM audio stream, so the azan plays even when the phone is on silent / vibrate
     * (like an alarm clock). Created here first, so the JS side (same ids) can't create them as normal
     * notification sounds. Android never changes a channel's sound after it is made.
     */
    private void createAzanChannels() {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null) return;
        String[][] sounds = { {"azan", "Azan", "azan_short"}, {"azan_mecca", "Azan (Mecca)", "azan_mecca_short"}, {"azan_medina", "Azan (Medina)", "azan_medina_short"}, {"azan_moazenzadeh", "Azan (Moazenzadeh)", "azan_moazenzadeh_short"}, {"azan_kazemzadeh", "Azan (Kazemzadeh)", "azan_kazemzadeh_short"}, {"azan_aghati_1", "Azan (Aghati (1))", "azan_aghati_1_short"}, {"azan_aghati_2", "Azan (Aghati (2))", "azan_aghati_2_short"}, {"azan_moazenzadeh_2", "Azan (Moazenzadeh 2)", "azan_moazenzadeh_2_short"}, {"azan_rezaeian", "Azan (Rezaeian)", "azan_rezaeian_short"}, {"azan_abdulbasit", "Azan (Abdul Basit)", "azan_abdulbasit_short"} };
        AudioAttributes aa = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        for (String[] s : sounds) for (int v = 1; v >= 0; v--) {
            String id = s[0] + "_v" + v;
            if (nm.getNotificationChannel(id) != null) continue;
            NotificationChannel ch = new NotificationChannel(id, s[1] + (v == 1 ? "" : " · no vibration"), NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("Prayer time alerts");
            ch.setSound(Uri.parse("android.resource://" + getPackageName() + "/raw/" + s[2]), aa);
            ch.enableVibration(v == 1);
            if (v == 1) ch.setVibrationPattern(new long[]{0, 600, 300, 600});
            ch.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
        }
    }
}
