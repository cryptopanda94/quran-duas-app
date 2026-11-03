package com.cryptopanda94.quranduas;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);   // app -> widgets data
        super.onCreate(savedInstanceState);
    }
}
