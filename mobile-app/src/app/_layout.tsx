import { Stack, usePathname, useRouter, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

const links = [
  { label: 'Inicio', icon: '⌂', route: '/' },
  { label: 'Registrar venta', icon: '↗', route: '/venta' },
  { label: 'Inventario', icon: '▦', route: '/inventario' },
  { label: 'Agregar aceite', icon: '◈', route: '/agregar-aceite' },
  { label: 'Agregar filtro', icon: '◎', route: '/agregar-filtro' },
] as const;

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [panel, setPanel] = useState<'menu' | 'settings' | null>(null);
  const [visible, setVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const panelWidth = Math.min(width * 0.84, 340);

  const open = (side: 'menu' | 'settings') => {
    setPanel(side);
    setVisible(true);
    Animated.timing(progress, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };
  const close = () => {
    Animated.timing(progress, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!visible) return false;
      close();
      return true;
    });
    return () => subscription.remove();
  }, [visible]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AnimatedSplashOverlay />
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir menú" onPress={() => open('menu')} style={styles.headerButton}>
            <Text style={styles.headerIcon}>☰</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Ir al inicio" onPress={() => router.navigate('/')} style={styles.brand}>
            <View style={styles.logo}><Text style={styles.logoText}>A</Text><View style={styles.logoDot} /></View>
            <View><Text style={styles.brandName}>ADRIEL</Text><Text style={styles.brandCaption}>MOFLES Y ACEITES</Text></View>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir ajustes" onPress={() => open('settings')} style={styles.headerButton}>
            <Text style={styles.headerIcon}>⚙</Text>
          </Pressable>
        </View>
      </SafeAreaView>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f5f7f3' } }} />
      {visible && (
        <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#16291db3', opacity: progress }]}>
            <Pressable style={styles.fill} accessibilityLabel="Cerrar panel" onPress={close} />
          </Animated.View>
          <Animated.View style={[styles.drawer, panel === 'settings' ? styles.right : styles.left, {
            width: panelWidth,
            transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [panel === 'settings' ? panelWidth : -panelWidth, 0] }) }],
          }]}>
            <SafeAreaView style={styles.drawerContent}>
              <View style={styles.drawerHeading}>
                <View><Text style={styles.eyebrow}>ADRIEL / {panel === 'menu' ? 'NAVEGACIÓN' : 'CONFIGURACIÓN'}</Text><Text style={styles.drawerTitle}>{panel === 'menu' ? 'Tu espacio' : 'Ajustes'}</Text></View>
                <Pressable accessibilityRole="button" accessibilityLabel="Cerrar panel" onPress={close} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
              </View>
              {panel === 'menu' ? (
                <View style={styles.navList}>
                  {links.map((link) => (
                    <Pressable key={link.route} accessibilityRole="button" onPress={() => { close(); router.navigate(link.route as Href); }} style={[styles.navItem, pathname === link.route && styles.navActive]}>
                      <Text style={styles.navIcon}>{link.icon}</Text><Text style={styles.navText}>{link.label}</Text><Text style={styles.chevron}>›</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.settingsCard}>
                  <Text style={styles.settingsTitle}>Acerca de la aplicación</Text>
                  <Text style={styles.settingsText}>Sistema de ventas e inventario para Mofles y Aceites Adriel.</Text>
                  <View style={styles.divider} />
                  <Text style={styles.settingsLabel}>CONEXIÓN AL SERVIDOR</Text>
                  <Text style={styles.settingsText}>La dirección del servidor se configura en src/services/api.js.</Text>
                </View>
              )}
              <Text style={styles.drawerFooter}>HECHO PARA TU NEGOCIO  ·  ADRIEL</Text>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f7f3' }, fill: { flex: 1 },
  headerSafe: { backgroundColor: '#f8faf6' },
  header: { height: 76, width: '100%', maxWidth: 1100, alignSelf: 'center', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#e9eee8' },
  headerIcon: { color: '#365642', fontSize: 22 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 39, height: 39, borderRadius: 14, backgroundColor: '#365c45', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '800', fontStyle: 'italic' },
  logoDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#eac966', right: 6, bottom: 7 },
  brandName: { color: '#274434', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  brandCaption: { color: '#839388', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  drawer: { position: 'absolute', top: 0, bottom: 0, backgroundColor: '#f8faf6' },
  left: { left: 0, borderTopRightRadius: 28, borderBottomRightRadius: 28 },
  right: { right: 0, borderTopLeftRadius: 28, borderBottomLeftRadius: 28 },
  drawerContent: { flex: 1, padding: 25 },
  drawerHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 32 },
  eyebrow: { color: '#8c9b90', fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  drawerTitle: { color: '#294936', fontSize: 27, fontWeight: '700', marginTop: 6 },
  close: { backgroundColor: '#e8eee8', borderRadius: 14, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#365642', fontSize: 26, lineHeight: 30 },
  navList: { gap: 8 }, navItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, gap: 14 },
  navActive: { backgroundColor: '#e2ebe1' }, navIcon: { color: '#42644d', fontSize: 23, width: 28, textAlign: 'center' },
  navText: { color: '#304a39', fontSize: 15, fontWeight: '600', flex: 1 }, chevron: { color: '#94a699', fontSize: 23 },
  settingsCard: { backgroundColor: '#e8eee8', borderRadius: 20, padding: 20 },
  settingsTitle: { color: '#304e3b', fontSize: 16, fontWeight: '700', marginBottom: 9 },
  settingsText: { color: '#6e8072', fontSize: 13, lineHeight: 20 },
  settingsLabel: { color: '#718979', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#d1ddd1', marginVertical: 18 },
  drawerFooter: { marginTop: 'auto', color: '#9aaba0', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
});
