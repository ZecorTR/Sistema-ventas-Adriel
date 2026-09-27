import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { api } from '../services/api';

const COLUMNAS_ACEITES = [
  { key: 'marca', label: 'Marca' },
  { key: 'viscosidad', label: 'Viscosidad' },
  { key: 'presentacion', label: 'Presentación' },
  { key: 'stock', label: 'Stock' },
  { key: 'litrosTotales', label: 'Litros totales' },
  { key: 'precio', label: 'Precio' },
  { key: 'costo', label: 'Costo' },
];

const COLUMNAS_FILTROS = [
  { key: 'marca', label: 'Marca' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'stock', label: 'Stock' },
  { key: 'precio', label: 'Precio' },
  { key: 'costo', label: 'Costo' },
];

export default function InventarioScreen() {
  const [categoria, setCategoria] = useState('aceites'); // 'aceites' | 'filtros'

  const [aceites, setAceites] = useState([]);
  const [marcasAceite, setMarcasAceite] = useState([]);
  const [marcaAceiteSel, setMarcaAceiteSel] = useState('Todas');

  const [filtros, setFiltros] = useState([]);
  const [marcasFiltro, setMarcasFiltro] = useState([]);
  const [marcaFiltroSel, setMarcaFiltroSel] = useState('Todas');

  const [ordenCampo, setOrdenCampo] = useState('marca');
  const [ordenAsc, setOrdenAsc] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const [a, ma, f, mf] = await Promise.all([
        api.getAceites(),
        api.getMarcas(),
        api.getFiltros(),
        api.getMarcasFiltro(),
      ]);
      setAceites(a.map((x) => ({ ...x, litrosTotales: x.stock * x.litros })));
      setMarcasAceite(ma);
      setFiltros(f);
      setMarcasFiltro(mf);
    } catch (e) {
      Alert.alert('No se pudo conectar al servidor', e.message);
    }
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    if (pathname === '/inventario') {
      cargar();
    }
  }, [pathname, cargar]);

  const cambiarCategoria = (nueva) => {
    setCategoria(nueva);
    setOrdenCampo('marca');
    setOrdenAsc(true);
  };

  const datosCategoria = categoria === 'aceites' ? aceites : filtros;
  const marcasCategoria = categoria === 'aceites' ? marcasAceite : marcasFiltro;
  const marcaSel = categoria === 'aceites' ? marcaAceiteSel : marcaFiltroSel;
  const setMarcaSel = categoria === 'aceites' ? setMarcaAceiteSel : setMarcaFiltroSel;
  const columnas = categoria === 'aceites' ? COLUMNAS_ACEITES : COLUMNAS_FILTROS;

  const filtrados = useMemo(() => {
    let lista = datosCategoria;
    if (marcaSel !== 'Todas') {
      lista = lista.filter((x) => x.marca === marcaSel);
    }
    const copia = [...lista];
    copia.sort((a, b) => {
      const va = a[ordenCampo];
      const vb = b[ordenCampo];
      if (va === undefined || vb === undefined) return 0;
      if (typeof va === 'string') {
        return ordenAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return ordenAsc ? va - vb : vb - va;
    });
    return copia;
  }, [datosCategoria, marcaSel, ordenCampo, ordenAsc]);

  const resumen = useMemo(() => {
    if (marcaSel === 'Todas' || filtrados.length === 0) return null;
    if (categoria === 'aceites') {
      const porPresentacion = {};
      let litrosTotales = 0;
      filtrados.forEach((a) => {
        porPresentacion[a.presentacion] = (porPresentacion[a.presentacion] || 0) + a.stock;
        litrosTotales += a.stock * a.litros;
      });
      return { grupos: porPresentacion, total: `${litrosTotales} litros` };
    }
    const porTipo = {};
    let unidadesTotales = 0;
    filtrados.forEach((f) => {
      porTipo[f.tipo] = (porTipo[f.tipo] || 0) + f.stock;
      unidadesTotales += f.stock;
    });
    return { grupos: porTipo, total: `${unidadesTotales} unidades` };
  }, [filtrados, marcaSel, categoria]);

  const cambiarOrden = (campo) => {
    if (campo === ordenCampo) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenCampo(campo);
      setOrdenAsc(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.titulo}>Inventario</Text>

        <View style={styles.filaCategoria}>
          <TouchableOpacity
            style={[styles.categoriaBoton, categoria === 'aceites' && styles.categoriaBotonActivo]}
            onPress={() => cambiarCategoria('aceites')}
          >
            <Text style={[styles.categoriaTexto, categoria === 'aceites' && styles.categoriaTextoActivo]}>
              Aceites
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoriaBoton, categoria === 'filtros' && styles.categoriaBotonActivo]}
            onPress={() => cambiarCategoria('filtros')}
          >
            <Text style={[styles.categoriaTexto, categoria === 'filtros' && styles.categoriaTextoActivo]}>
              Filtros
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filaChips}>
          <TouchableOpacity
            style={[styles.chip, marcaSel === 'Todas' && styles.chipActivo]}
            onPress={() => setMarcaSel('Todas')}
          >
            <Text style={[styles.chipTexto, marcaSel === 'Todas' && styles.chipTextoActivo]}>Todas</Text>
          </TouchableOpacity>
          {marcasCategoria.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.chip, marcaSel === m.nombre && styles.chipActivo]}
              onPress={() => setMarcaSel(m.nombre)}
            >
              <Text style={[styles.chipTexto, marcaSel === m.nombre && styles.chipTextoActivo]}>
                {m.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {resumen && (
          <View style={styles.resumen}>
            <Text style={styles.resumenTitulo}>Resumen — {marcaSel}</Text>
            {Object.entries(resumen.grupos).map(([grupo, cantidad]) => (
              <Text key={grupo} style={styles.resumenLinea}>
                {grupo}: {cantidad} unidades
              </Text>
            ))}
            <Text style={[styles.resumenLinea, { fontWeight: '700', marginTop: 4 }]}>
              Total: {resumen.total}
            </Text>
          </View>
        )}

        <ScrollView horizontal>
          <View>
            <View style={styles.filaTabla}>
              {columnas.map((c) => (
                <TouchableOpacity key={c.key} style={styles.celdaHeader} onPress={() => cambiarOrden(c.key)}>
                  <Text style={styles.headerTexto}>
                    {c.label}
                    {ordenCampo === c.key ? (ordenAsc ? ' ▲' : ' ▼') : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {filtrados.map((item) => (
              <View key={item.id} style={styles.filaTabla}>
                {columnas.map((c) => (
                  <Text key={c.key} style={styles.celda}>
                    {c.key === 'precio' || c.key === 'costo' ? `$${item[c.key]}` : item[c.key]}
                  </Text>
                ))}
              </View>
            ))}
            {filtrados.length === 0 && (
              <Text style={styles.vacio}>No hay {categoria} registrados con ese filtro.</Text>
            )}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const CELDA_ANCHO = 110;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#1f2937' },
  filaCategoria: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  categoriaBoton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  categoriaBotonActivo: { backgroundColor: '#111827', borderColor: '#111827' },
  categoriaTexto: { color: '#374151', fontWeight: '700' },
  categoriaTextoActivo: { color: '#fff' },
  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActivo: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipTexto: { color: '#374151', fontSize: 13, fontWeight: '600' },
  chipTextoActivo: { color: '#fff' },
  resumen: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  resumenTitulo: { fontWeight: '700', color: '#111827', marginBottom: 6 },
  resumenLinea: { color: '#374151', fontSize: 14 },
  filaTabla: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  celdaHeader: {
    width: CELDA_ANCHO,
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: '#f9fafb',
  },
  headerTexto: { fontWeight: '700', fontSize: 12, color: '#374151' },
  celda: { width: CELDA_ANCHO, paddingVertical: 10, paddingHorizontal: 6, fontSize: 13, color: '#111827' },
  vacio: { padding: 16, color: '#6b7280' },
});
