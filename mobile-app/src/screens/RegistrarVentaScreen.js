import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { api } from '../services/api';

const ANCHO_DOS_COLUMNAS = 900;

export default function RegistrarVentaScreen() {
  const { width } = useWindowDimensions();
  const esAncho = width >= ANCHO_DOS_COLUMNAS;

  const [aceites, setAceites] = useState([]);
  const [aceiteId, setAceiteId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [ultimasVentas, setUltimasVentas] = useState([]);

  const cargar = useCallback(async () => {
    try {
      const [a, v] = await Promise.all([api.getAceites(), api.getVentas()]);
      setAceites(a);
      setUltimasVentas(v.slice(0, 8));
    } catch (e) {
      Alert.alert('No se pudo conectar al servidor', e.message);
    }
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    if (pathname === '/') {
      cargar();
    }
  }, [pathname, cargar]);

  const aceiteSeleccionado = useMemo(
    () => aceites.find((a) => String(a.id) === aceiteId),
    [aceites, aceiteId]
  );

  const registrarVenta = async () => {
    const cant = Number(cantidad);
    if (!aceiteId) {
      Alert.alert('Falta el aceite', 'Selecciona qué aceite vendiste.');
      return;
    }
    if (!cant || cant <= 0) {
      Alert.alert('Cantidad inválida', 'Escribe cuántas unidades vendiste.');
      return;
    }
    try {
      await api.addVenta(Number(aceiteId), cant);
      setCantidad('');
      await cargar();
      Alert.alert('Listo', 'Venta registrada y stock actualizado.');
    } catch (e) {
      Alert.alert('No se pudo registrar', e.message);
    }
  };

  const cancelarVenta = async (venta) => {
    const mensaje = `¿Cancelar la venta de ${venta.cantidad} unidades de ${venta.marca} ${venta.viscosidad} ${venta.presentacion}? Se le regresará esa cantidad al stock.`;

    const confirmar = () => {
      if (Platform.OS === 'web') {
        // Alert.alert con botones no dispara onPress en web, así que ahí usamos
        // la confirmación nativa del navegador.
        return Promise.resolve(window.confirm(mensaje));
      }
      return new Promise((resolve) => {
        Alert.alert('Cancelar venta', mensaje, [
          { text: 'No', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Sí, cancelar', style: 'destructive', onPress: () => resolve(true) },
        ]);
      });
    };

    const confirmado = await confirmar();
    if (!confirmado) return;

    try {
      await api.cancelarVenta(venta.id);
      await cargar();
    } catch (e) {
      Alert.alert('No se pudo cancelar', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.titulo}>Registrar venta</Text>

        <View style={[styles.layout, esAncho && styles.layoutFila]}>
          {/* Columna izquierda: formulario de venta */}
          <View style={[styles.columna, esAncho && styles.columnaFormulario]}>
            <Text style={styles.etiqueta}>¿Qué vendiste?</Text>
            <Picker selectedValue={aceiteId} onValueChange={setAceiteId} style={styles.picker}>
              <Picker.Item label="Selecciona un aceite..." value="" />
              {aceites.map((a) => (
                <Picker.Item
                  key={a.id}
                  label={`${a.marca} - ${a.presentacion} - ${a.viscosidad} (stock: ${a.stock})`}
                  value={String(a.id)}
                />
              ))}
            </Picker>

            {aceiteSeleccionado && (
              <Text style={styles.disponible}>
                Disponible: {aceiteSeleccionado.stock} unidades · Precio: ${aceiteSeleccionado.precio}
              </Text>
            )}

            <Text style={styles.etiqueta}>Cantidad vendida</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cantidad}
              onChangeText={setCantidad}
              placeholder="Ej. 2"
            />

            <TouchableOpacity style={styles.boton} onPress={registrarVenta}>
              <Text style={styles.botonTexto}>Registrar venta y descontar stock</Text>
            </TouchableOpacity>
          </View>

          {/* Columna derecha: últimas ventas */}
          <View style={styles.columna}>
            <Text style={[styles.titulo, { fontSize: 18 }]}>Últimas ventas</Text>
            {ultimasVentas.map((v) => (
              <View key={v.id} style={styles.filaVenta}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.filaVentaTitulo}>
                    {v.marca} · {v.viscosidad} · {v.presentacion}
                  </Text>
                  <Text style={styles.filaVentaDetalle}>
                    {v.cantidad} unidades · ${v.total} · {new Date(v.fecha).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => cancelarVenta(v)}>
                  <Text style={styles.cancelar}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ))}
            {ultimasVentas.length === 0 && <Text style={styles.vacio}>Aún no hay ventas registradas.</Text>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', width: '100%', maxWidth: 1100, alignSelf: 'center' },
  titulo: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#1f2937' },
  layout: { flexDirection: 'column' },
  layoutFila: { flexDirection: 'row', gap: 40, alignItems: 'flex-start' },
  columna: { flex: 1 },
  columnaFormulario: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    paddingRight: 40,
  },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 14, marginBottom: 4 },
  picker: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 },
  disponible: { marginTop: 6, color: '#6b7280', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  boton: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  filaVenta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
  },
  filaVentaTitulo: { fontSize: 14, fontWeight: '600', color: '#111827' },
  filaVentaDetalle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cancelar: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  vacio: { color: '#6b7280', marginTop: 8 },
});
