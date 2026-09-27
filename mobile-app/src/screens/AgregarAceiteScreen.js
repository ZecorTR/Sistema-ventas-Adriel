import React, { useState, useCallback, useEffect } from 'react';
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

const NUEVO = '__nuevo__';
const ANCHO_DOS_COLUMNAS = 900;

export default function AgregarAceiteScreen() {
  const { width } = useWindowDimensions();
  const esAncho = width >= ANCHO_DOS_COLUMNAS;

  const [marcas, setMarcas] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [viscosidades, setViscosidades] = useState([]);
  const [aceites, setAceites] = useState([]);

  const [marcaId, setMarcaId] = useState('');
  const [presentacionId, setPresentacionId] = useState('');
  const [viscosidadId, setViscosidadId] = useState('');
  const [sku, setSku] = useState('');
  const [precio, setPrecio] = useState('');
  const [costo, setCosto] = useState('');
  const [stock, setStock] = useState('');

  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevaPresEtiqueta, setNuevaPresEtiqueta] = useState('');
  const [nuevaPresLitros, setNuevaPresLitros] = useState('');
  const [nuevaVisc, setNuevaVisc] = useState('');

  const cargarTodo = useCallback(async () => {
    try {
      const [m, p, v, a] = await Promise.all([
        api.getMarcas(),
        api.getPresentaciones(),
        api.getViscosidades(),
        api.getAceites(),
      ]);
      setMarcas(m);
      setPresentaciones(p);
      setViscosidades(v);
      setAceites(a);
    } catch (e) {
      Alert.alert('No se pudo conectar al servidor', e.message);
    }
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    if (pathname === '/agregar-aceite') {
      cargarTodo();
    }
  }, [pathname, cargarTodo]);

  const onCambiaMarca = (valor) => {
    if (valor === NUEVO) {
      setMarcaId(NUEVO);
      return;
    }
    setMarcaId(valor);
  };

  const confirmarNuevaMarca = async () => {
    if (!nuevaMarca.trim()) return;
    const creada = await api.addMarca(nuevaMarca.trim());
    setNuevaMarca('');
    await cargarTodo();
    setMarcaId(String(creada.id));
  };

  const confirmarNuevaPresentacion = async () => {
    if (!nuevaPresEtiqueta.trim() || !nuevaPresLitros) return;
    const creada = await api.addPresentacion(nuevaPresEtiqueta.trim(), Number(nuevaPresLitros));
    setNuevaPresEtiqueta('');
    setNuevaPresLitros('');
    await cargarTodo();
    setPresentacionId(String(creada.id));
  };

  const confirmarNuevaViscosidad = async () => {
    if (!nuevaVisc.trim()) return;
    const creada = await api.addViscosidad(nuevaVisc.trim());
    setNuevaVisc('');
    await cargarTodo();
    setViscosidadId(String(creada.id));
  };

  const guardarAceite = async () => {
    if (!marcaId || marcaId === NUEVO || !presentacionId || presentacionId === NUEVO || !viscosidadId || viscosidadId === NUEVO) {
      Alert.alert('Faltan datos', 'Selecciona marca, presentación y viscosidad.');
      return;
    }
    try {
      await api.addAceite({
        marca_id: Number(marcaId),
        presentacion_id: Number(presentacionId),
        viscosidad_id: Number(viscosidadId),
        sku,
        precio: Number(precio) || 0,
        costo: Number(costo) || 0,
        stock: Number(stock) || 0,
      });
      setSku('');
      setPrecio('');
      setCosto('');
      setStock('');
      await cargarTodo();
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message);
    }
  };

  const eliminarAceite = async (id) => {
    await api.deleteAceite(id);
    await cargarTodo();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.titulo}>Agregar aceite</Text>

        <View style={[styles.layout, esAncho && styles.layoutFila]}>
          {/* Columna izquierda: formulario */}
          <View style={[styles.columna, esAncho && styles.columnaFormulario]}>
            <Text style={styles.etiqueta}>Marca</Text>
            <Picker selectedValue={marcaId} onValueChange={onCambiaMarca} style={styles.picker}>
              <Picker.Item label="Selecciona una marca..." value="" />
              {marcas.map((m) => (
                <Picker.Item key={m.id} label={m.nombre} value={String(m.id)} />
              ))}
              <Picker.Item label="+ Agregar nueva marca" value={NUEVO} />
            </Picker>
            {marcaId === NUEVO && (
              <View style={styles.filaNuevo}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Nombre de la marca"
                  value={nuevaMarca}
                  onChangeText={setNuevaMarca}
                />
                <TouchableOpacity style={styles.botonChico} onPress={confirmarNuevaMarca}>
                  <Text style={styles.botonChicoTexto}>Agregar</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.etiqueta}>Presentación</Text>
            <Picker selectedValue={presentacionId} onValueChange={setPresentacionId} style={styles.picker}>
              <Picker.Item label="Selecciona una presentación..." value="" />
              {presentaciones.map((p) => (
                <Picker.Item key={p.id} label={`${p.etiqueta} (${p.litros} L)`} value={String(p.id)} />
              ))}
              <Picker.Item label="+ Agregar nueva presentación" value={NUEVO} />
            </Picker>
            {presentacionId === NUEVO && (
              <View style={styles.filaNuevo}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Ej. Bote 4L"
                  value={nuevaPresEtiqueta}
                  onChangeText={setNuevaPresEtiqueta}
                />
                <TextInput
                  style={styles.inputChico}
                  placeholder="Litros"
                  keyboardType="numeric"
                  value={nuevaPresLitros}
                  onChangeText={setNuevaPresLitros}
                />
                <TouchableOpacity style={styles.botonChico} onPress={confirmarNuevaPresentacion}>
                  <Text style={styles.botonChicoTexto}>Agregar</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.etiqueta}>Clasificación (viscosidad)</Text>
            <Picker selectedValue={viscosidadId} onValueChange={setViscosidadId} style={styles.picker}>
              <Picker.Item label="Selecciona una clasificación..." value="" />
              {viscosidades.map((v) => (
                <Picker.Item key={v.id} label={v.etiqueta} value={String(v.id)} />
              ))}
              <Picker.Item label="+ Agregar nueva clasificación" value={NUEVO} />
            </Picker>
            {viscosidadId === NUEVO && (
              <View style={styles.filaNuevo}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Ej. 20W-50"
                  value={nuevaVisc}
                  onChangeText={setNuevaVisc}
                />
                <TouchableOpacity style={styles.botonChico} onPress={confirmarNuevaViscosidad}>
                  <Text style={styles.botonChicoTexto}>Agregar</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.etiqueta}>SKU / código (opcional)</Text>
            <TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="Ej. GOH-5W30-5L" />

            <View style={styles.filaTres}>
              <View style={styles.tercio}>
                <Text style={styles.etiqueta}>Precio venta</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={precio} onChangeText={setPrecio} />
              </View>
              <View style={styles.tercio}>
                <Text style={styles.etiqueta}>Costo</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={costo} onChangeText={setCosto} />
              </View>
              <View style={styles.tercio}>
                <Text style={styles.etiqueta}>Stock</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={stock} onChangeText={setStock} />
              </View>
            </View>

            <TouchableOpacity style={styles.botonGuardar} onPress={guardarAceite}>
              <Text style={styles.botonGuardarTexto}>Guardar aceite</Text>
            </TouchableOpacity>
          </View>

          {/* Columna derecha: catálogo actual */}
          <View style={styles.columna}>
            <Text style={[styles.titulo, { fontSize: 18 }]}>Catálogo actual</Text>
            {aceites.map((a) => (
              <View key={a.id} style={styles.filaAceite}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.filaAceiteTitulo}>
                    {a.marca} · {a.viscosidad} · {a.presentacion}
                  </Text>
                  <Text style={styles.filaAceiteDetalle}>
                    {a.sku ? `SKU: ${a.sku} · ` : ''}Precio: ${a.precio} · Stock: {a.stock}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => eliminarAceite(a.id)}>
                  <Text style={styles.eliminar}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
            {aceites.length === 0 && <Text style={styles.vacio}>Aún no hay aceites registrados.</Text>}
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
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 8 : 10,
  },
  picker: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 },
  filaNuevo: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  inputFlex: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputChico: {
    width: 70,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  botonChico: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  botonChicoTexto: { color: '#fff', fontWeight: '600' },
  filaTres: { flexDirection: 'row', gap: 10, marginTop: 4 },
  tercio: { flex: 1 },
  botonGuardar: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botonGuardarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  filaAceite: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
  },
  filaAceiteTitulo: { fontSize: 14, fontWeight: '600', color: '#111827' },
  filaAceiteDetalle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  eliminar: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  vacio: { color: '#6b7280', marginTop: 8 },
});
