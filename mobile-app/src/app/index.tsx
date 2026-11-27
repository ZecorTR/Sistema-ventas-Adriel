import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const actions = [
  { title: 'Registrar venta', subtitle: 'Nueva operación', icon: '↗', route: '/venta' },
  { title: 'Inventario', subtitle: 'Consulta tus productos', icon: '▦', route: '/inventario' },
  { title: 'Agregar aceite', subtitle: 'Amplía tu catálogo', icon: '◈', route: '/agregar-aceite' },
  { title: 'Agregar filtro', subtitle: 'Registra un producto', icon: '◎', route: '/agregar-filtro' },
] as const;

export default function Index() {
  const router = useRouter();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <Text style={styles.overline}>TU NEGOCIO, EN UN SOLO LUGAR</Text>
        <Text style={styles.title}>Hola, bienvenido <Text style={styles.wave}>✳</Text></Text>
        <Text style={styles.subtitle}>Todo listo para mantener tu negocio en marcha.</Text>
      </View>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>MOFLES Y ACEITES</Text>
          <Text style={styles.heroTitle}>Tu negocio se mueve contigo.</Text>
          <Text style={styles.heroText}>Ventas e inventario, siempre a la mano.</Text>
        </View>
        <View style={styles.heroMark}><Text style={styles.heroMarkText}>A</Text><View style={styles.heroDot} /></View>
      </View>
      <View style={styles.sectionHeader}>
        <View><Text style={styles.sectionEyebrow}>¿QUÉ VAMOS A HACER?</Text><Text style={styles.sectionTitle}>Accesos rápidos</Text></View>
        <Text style={styles.sectionCount}>04 OPCIONES</Text>
      </View>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <Pressable key={action.route} accessibilityRole="button" onPress={() => router.navigate(action.route as Href)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.cardTop}><View style={[styles.iconBox, index === 0 && styles.iconBoxAccent]}><Text style={styles.cardIcon}>{action.icon}</Text></View><Text style={styles.arrow}>↗</Text></View>
            <Text style={styles.cardTitle}>{action.title}</Text>
            <Text style={styles.cardSubtitle}>{action.subtitle}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.footer}><View style={styles.footerDot} /><Text style={styles.footerText}>TU ESPACIO DE TRABAJO</Text><Text style={styles.footerBrand}>ADRIEL ©</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7f3' },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 35 },
  intro: { paddingTop: 33, paddingBottom: 25 },
  overline: { color: '#809688', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#253f2f', fontSize: 30, fontWeight: '700', letterSpacing: -0.8, marginTop: 9 },
  wave: { color: '#d9b950', fontSize: 25 },
  subtitle: { color: '#819087', fontSize: 14, lineHeight: 21, marginTop: 6 },
  hero: { minHeight: 175, backgroundColor: '#3d6049', borderRadius: 26, padding: 25, flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
  heroCopy: { flex: 1, maxWidth: 430 },
  heroLabel: { color: '#d5e3d5', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '700', lineHeight: 31, marginTop: 12, maxWidth: 300 },
  heroText: { color: '#c4d4c6', fontSize: 13, marginTop: 9, lineHeight: 19 },
  heroMark: { width: 85, height: 85, borderRadius: 30, borderWidth: 1, borderColor: '#779480', backgroundColor: '#54745d', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  heroMarkText: { fontSize: 53, fontWeight: '800', fontStyle: 'italic', color: '#edf5e9' },
  heroDot: { position: 'absolute', right: 13, bottom: 15, width: 10, height: 10, borderRadius: 5, backgroundColor: '#eac966' },
  sectionHeader: { marginTop: 34, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionEyebrow: { color: '#95a49a', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  sectionTitle: { color: '#294534', fontSize: 21, fontWeight: '700', marginTop: 5 },
  sectionCount: { color: '#a3b0a5', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', flexGrow: 1, minHeight: 155, backgroundColor: '#fff', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#edf1ec' },
  pressed: { opacity: 0.75 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 19 },
  iconBox: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#edf3ec', alignItems: 'center', justifyContent: 'center' },
  iconBoxAccent: { backgroundColor: '#f7f1d9' }, cardIcon: { fontSize: 25, color: '#42664c' },
  arrow: { color: '#b4c1b5', fontSize: 18 }, cardTitle: { color: '#2f4b38', fontSize: 15, fontWeight: '700' },
  cardSubtitle: { color: '#98a79b', fontSize: 12, marginTop: 5 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 32, gap: 8 },
  footerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#e2c15c' },
  footerText: { flex: 1, color: '#a3b0a5', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  footerBrand: { color: '#a3b0a5', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
});
