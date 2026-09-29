import { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import gameHtml from './game/gameHtml';

const HAPTICS = {
  place: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  kick: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
  pick: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  boom: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  die: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  win: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

// Forwards errors and a "started" signal from the game page to the Metro terminal
const LOG_BRIDGE = `
  (function () {
    var send = function (type, text) {
      try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, text: String(text) })); } catch (e) {}
    };
    window.addEventListener('error', function (e) { send('error', (e.message || e) + ' @' + (e.lineno || '?') + ':' + (e.colno || '?')); });
    window.addEventListener('unhandledrejection', function (e) { send('error', 'promise: ' + (e.reason && e.reason.message || e.reason)); });
    document.addEventListener('DOMContentLoaded', function () { send('log', 'sayfa hazır, ekran ' + innerWidth + 'x' + innerHeight); });
  })();
  true;
`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const webRef = useRef(null);
  // Start-up runs in visible steps so a crash shows exactly where it happened
  const [step, setStep] = useState('1/3 Uygulama başladı');
  const [showWeb, setShowWeb] = useState(false);

  useEffect(() => {
    let alive = true;
    const log = (text) => { console.log('[açılış]', text); if (alive) setStep(text); };
    (async () => {
      log('1/3 Uygulama başladı');
      await wait(700);
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        log('2/3 Ekran yataya çevrildi');
      } catch (e) {
        log('2/3 Ekran çevrilemedi (sorun değil): ' + e?.message);
      }
      await wait(900);
      log('3/3 Oyun ekranı ekleniyor');
      if (alive) setShowWeb(true);
    })();
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') webRef.current?.injectJavaScript('window.__fusePause && window.__fusePause(); true;');
    });
    return () => {
      alive = false;
      sub.remove();
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  const onMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'haptic') HAPTICS[msg.kind]?.().catch(() => {});
      if (msg.type === 'log') console.log('[oyun]', msg.text);
      if (msg.type === 'error') console.error('[oyun hatası]', msg.text);
    } catch {
      // ignore anything that is not ours
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {showWeb ? (
        <WebView
          ref={webRef}
          style={styles.web}
          originWhitelist={['*']}
          source={{ html: gameHtml, baseUrl: 'https://localhost/' }}
          onMessage={onMessage}
          injectedJavaScriptBeforeContentLoaded={LOG_BRIDGE}
          onLoadStart={() => console.log('[webview] yükleniyor')}
          onLoadEnd={() => console.log('[webview] yüklendi')}
          onError={(e) => console.error('[webview hatası]', e.nativeEvent.description)}
          onHttpError={(e) => console.error('[webview http]', e.nativeEvent.statusCode, e.nativeEvent.url)}
          onRenderProcessGone={(e) => console.error('[webview çöktü] didCrash=', e.nativeEvent.didCrash)}
          onContentProcessDidTerminate={() => console.error('[webview içerik süreci kapandı]')}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      ) : (
        <View style={styles.boot}>
          <Text style={styles.title}>FUSE ARENA</Text>
          <Text style={styles.step}>{step}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#12102a' },
  web: { flex: 1, backgroundColor: '#12102a' },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { color: '#ffb23f', fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  step: { color: '#efeeff', fontSize: 16 },
});
