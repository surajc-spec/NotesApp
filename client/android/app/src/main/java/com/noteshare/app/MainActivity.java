package com.noteshare.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.view.WindowManager;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );

        super.onCreate(savedInstanceState);

        WebView webView = bridge.getWebView();
        if (webView != null) {
            webView.getSettings().setSupportZoom(true);
            webView.getSettings().setBuiltInZoomControls(true);
            webView.getSettings().setDisplayZoomControls(false);
        }

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                handleBackButton();
            }
        });
    }

    private void handleBackButton() {
        if (bridge == null || bridge.getWebView() == null) {
            finish();
            return;
        }

        WebView webView = bridge.getWebView();
        webView.evaluateJavascript(
            "(function(){try{var res = window.__noteshareHandleAndroidBack ? window.__noteshareHandleAndroidBack() : false; return res === true ? 'true' : (res === 'exit' ? 'exit' : 'false');}catch(e){return 'error';}})();",
            handled -> {
                if ("\"true\"".equals(handled) || "true".equals(handled)) return;
                if ("\"exit\"".equals(handled) || "exit".equals(handled)) {
                    finish();
                    return;
                }

                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        );
    }
}
