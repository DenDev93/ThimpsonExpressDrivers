import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { api, Solicitud } from '@/lib/api'
import { COLORS, FONTS } from '@/lib/theme'

const ESTADOS = ['todas', 'asignada', 'en_camino', 'completado', 'cancelado'] as const

export function AsignacionesScreen({ navigation }: any) {
  const { perfil } = useAuth()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [filtro, setFiltro] = useState<string>('todas')
  const [refreshing, setRefreshing] = useState(false)

  const cargar = async () => {
    if (!perfil?.id) return
    const params: any = {}
    if (filtro !== 'todas') params.estado = filtro
    const r = await api.solicitudes.listAsignadas(perfil.id, params)
    if (r.data) setSolicitudes(r.data)
  }

  useEffect(() => { cargar() }, [perfil, filtro])

  const onRefresh = async () => {
    setRefreshing(true)
    await cargar()
    setRefreshing(false)
  }

  const estadoColor: Record<string, string> = {
    asignada: COLORS.blue,
    en_camino: COLORS.orange,
    completado: COLORS.green,
    entregada: COLORS.green,
    cancelado: COLORS.red,
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis asignaciones</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {ESTADOS.map(e => (
          <TouchableOpacity key={e} onPress={() => setFiltro(e)}
            style={[styles.filterChip, filtro === e && styles.filterChipActive]}>
            <Text style={[styles.filterText, filtro === e && styles.filterTextActive]}>
              {e === 'todas' ? 'Todas' : e.charAt(0).toUpperCase() + e.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {solicitudes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={48} color={COLORS.gray500} />
            <Text style={styles.emptyText}>No hay asignaciones</Text>
          </View>
        ) : solicitudes.map(s => (
          <TouchableOpacity key={s.id} style={styles.card}
            onPress={() => navigation.navigate('DetalleAsignacion', { id: s.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardCode}>{s.codigo}</Text>
              <View style={[styles.statusDot, { backgroundColor: estadoColor[s.estado] ?? COLORS.gray400 }]} />
            </View>
            <Text style={styles.cardService}>{s.tipo_servicio}</Text>
            <Text style={styles.cardAddress} numberOfLines={1}>📍 {s.origen_direccion}</Text>
            {s.destino_direccion && <Text style={styles.cardAddress} numberOfLines={1}>🏁 {s.destino_direccion}</Text>}
            <View style={styles.cardFooter}>
              {s.precio_final != null && <Text style={styles.cardPrice}>C${s.precio_final.toFixed(2)}</Text>}
              <Text style={styles.cardDate}>{new Date(s.creado_en).toLocaleDateString('es-NI', { month: 'short', day: 'numeric' })}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { backgroundColor: COLORS.black2, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  headerTitle: { ...FONTS.bold, fontSize: 22, color: COLORS.white },
  filterRow: { maxHeight: 48, backgroundColor: COLORS.black2 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray700, marginRight: 8 },
  filterChipActive: { backgroundColor: COLORS.yellow },
  filterText: { ...FONTS.medium, fontSize: 13, color: COLORS.gray400 },
  filterTextActive: { color: COLORS.black, ...FONTS.bold },
  list: { flex: 1 },
  listContent: { paddingVertical: 12, paddingBottom: 32 },
  card: { backgroundColor: COLORS.black2, marginHorizontal: 20, marginBottom: 10, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.gray700 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardCode: { ...FONTS.bold, fontSize: 14, color: COLORS.yellow },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardService: { ...FONTS.semibold, fontSize: 15, color: COLORS.white, marginBottom: 4 },
  cardAddress: { ...FONTS.regular, fontSize: 12, color: COLORS.gray400, marginBottom: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardPrice: { ...FONTS.bold, fontSize: 16, color: COLORS.yellow },
  cardDate: { ...FONTS.regular, fontSize: 12, color: COLORS.gray500 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { ...FONTS.regular, fontSize: 15, color: COLORS.gray500, marginTop: 12 },
})
