import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { api } from '../services/api';

const NUEVO = '__nuevo__';
const ANCHO_DOS_COLUMNAS = 900;

export default function AgregarFiltroScreen() {
  const { width } = useWindowDimensions();
  const esAncho = width >= ANCHO_DOS_COLUMNAS;

  const [marcas, setMarcas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [filtros, setFiltros] = useState([]);

  const [marcaId, setMarcaId] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [modelo, setModelo] = useState('');
  const [precio, setPrecio] = useState('');
  const [costo, setCosto] = useState('');
  const [stock, setStock] = useState('');

  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('');

  const cargarTodo = useCallback(async () => {
    try {
      const [m, t, f] = await Promise.all([api.getMarcasFiltro(), api.getTiposFiltro(), api.getFiltros()]);
      setMarcas(m);
      setTipos(t);
      setFiltros(f);
    } catch (e) {
      Alert.alert('No se pudo conectar al servidor', e.message);
    }
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    if (pathname === '/agregar-filtro') {
      cargarTodo();
    }
  }, [pathname, cargarTodo]);

  const confirmarNuevaMarca = async () => {
    if (!nuevaMarca.trim()) return;
    const creada = await api.addMarcaFiltro(nuevaMarca.trim());
    setNuevaMarca('');
    await cargarTodo();
    setMarcaId(String(creada.id));
  };

  const confirmarNuevoTipo = async () => {
    if (!nuevoTipo.trim()) return;
    const creado = await api.addTipoFiltro(nuevoTipo.trim());
    setNuevoTipo('');
    await cargarTodo();
    setTipoId(String(creado.id));
  };

  const guardarFiltro = async () => {
    if (!marcaId || marcaId === NUEVO || !tipoId || tipoId === NUEVO || !modelo.trim()) {
      Alert.alert('Faltan datos', 'Selecciona marca, tipo y escribe el modelo/número de parte.');
      return;
    }
    try {
      await api.addFiltro({
        marca_id: Number(marcaId),
        tipo_id: Number(tipoId),
        modelo: modelo.trim(),
        precio: Number(precio) || 0,
        costo: Number(costo) || 0,
        stock: Number(stock) || 0,
      });
      setModelo('');
      setPrecio('');
      setCosto('');
      setStock('');
      await cargarTodo();
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message);
    }
  };

  const eliminarFiltro = async (id) => {
    await api.deleteFiltro(id);
    await cargarTodo();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.titulo}>Agregar filtro</Text>

        <View style={[styles.layout, esAncho && styles.layoutFila]}>
          {/* Columna izquierda: formulario */}
          <View style={[styles.columna, esAncho && styles.columnaFormulario]}>
            <Text style={styles.etiqueta}>Marca</Text>
            <Picker selectedValue={marcaId} onValueChange={setMarcaId} style={styles.picker}>
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

            <Text style={styles.etiqueta}>Tipo de filtro</Text>
            <Picker selectedValue={tipoId} onValueChange={setTipoId} style={styles.picker}>
              <Picker.Item label="Selecciona un tipo..." value="" />
              {tipos.map((t) => (
                <Picker.Item key={t.id} label={t.etiqueta} value={String(t.id)} />
              ))}
              <Picker.Item label="+ Agregar nuevo tipo" value={NUEVO} />
            </Picker>
            {tipoId === NUEVO && (
              <View style={styles.filaNuevo}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Ej. Filtro de aire"
                  value={nuevoTipo}
                  onChangeText={setNuevoTipo}
                />
                <TouchableOpacity style={styles.botonChico} onPress={confirmarNuevoTipo}>
                  <Text style={styles.botonChicoTexto}>Agregar</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.etiqueta}>Modelo / número de parte</Text>
            <TextInput style={styles.input} value={modelo} onChangeText={setModelo} placeholder="Ej. PH8A" />

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

            <TouchableOpacity style={styles.botonGuardar} onPress={guardarFiltro}>
              <Text style={styles.botonGuardarTexto}>Guardar filtro</Text>
            </TouchableOpacity>
          </View>

          {/* Columna derecha: catálogo actual */}
          <View style={styles.columna}>
            <Text style={[styles.titulo, { fontSize: 18 }]}>Catálogo actual</Text>
            {filtros.map((f) => (
              <View key={f.id} style={styles.filaFiltro}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.filaFiltroTitulo}>
                    {f.marca} · {f.tipo} · {f.modelo}
                  </Text>
                  <Text style={styles.filaFiltroDetalle}>
                    Precio: ${f.precio} · Stock: {f.stock}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => eliminarFiltro(f.id)}>
                  <Text style={styles.eliminar}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
            {filtros.length === 0 && <Text style={styles.vacio}>Aún no hay filtros registrados.</Text>}
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
    paddingVertical: 10,
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
  filaFiltro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
  },
  filaFiltroTitulo: { fontSize: 14, fontWeight: '600', color: '#111827' },
  filaFiltroDetalle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  eliminar: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  vacio: { color: '#6b7280', marginTop: 8 },
});
