import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { api, Solicitud, Ganancium } from '@/lib/api'
import { COLORS, FONTS } from '@/lib/theme'

export function HomeScreen({ navigation }: any) {
  const { perfil } = useAuth()
  const [disponibles, setDisponibles] = useState<Solicitud[]>([])
  const [activas, setActivas] = useState<Solicitud[]>([])
  const [resumen, setResumen] = useState<{ total: number; pendiente: number; pagada: number } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const cargar = async () => {
    const [disp, act, res] = await Promise.all([
      api.solicitudes.listDisponibles({ limit: 5 }),
      perfil?.id ? api.solicitudes.listAsignadas(perfil.id, { estado: 'asignada', limit: 5 }) : Promise.resolve({ data: null, error: null }),
      perfil?.id ? api.ganancias.resumen(perfil.id) : Promise.resolve({ data: null, error: null }),
    ])
    if (disp.data) setDisponibles(disp.data)
    if (act.data) setActivas(act.data)
    if (res.data) setResumen(res.data)
  }

  useEffect(() => { cargar() }, [perfil])

  const onRefresh = async () => {
    setRefreshing(true)
    await cargar()
    setRefreshing(false)
  }

  if (!perfil) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thimpson Drivers</Text>
        </View>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginIcon}>🏍️</Text>
          <Text style={styles.loginTitle}>App de motorizados</Text>
          <Text style={styles.loginSub}>Iniciá sesión para recibir asignaciones</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>🏍️ {perfil.nombre_completo?.split(' ')[0] ?? 'Motorizado'}</Text>
          <Text style={styles.subtitle}>{disponibles.length} pedidos disponibles</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('PerfilTab')}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>{perfil.nombre_completo?.charAt(0)?.toUpperCase() ?? 'M'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {resumen && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>C${resumen.pendiente.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Por cobrar</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>C${resumen.pagada.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Pagado</Text>
          </View>
        </View>
      )}

      {activas.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bicycle" size={18} color={COLORS.yellow} /> Activas ({activas.length})
          </Text>
          {activas.slice(0, 3).map(s => (
            <TouchableOpacity key={s.id} style={styles.orderCard}
              onPress={() => navigation.navigate('DetalleAsignacion', { id: s.id })}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderCode}>{s.codigo}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{s.estado}</Text>
                </View>
              </View>
              <Text style={styles.orderType}>{s.tipo_servicio}</Text>
              <Text style={styles.orderAddress} numberOfLines={1}>📍 {s.origen_direccion}</Text>
              {s.destino_direccion && <Text style={styles.orderAddress} numberOfLines={1}>🏁 {s.destino_direccion}</Text>}
              {s.precio_final != null && <Text style={styles.orderPrice}>C${s.precio_final.toFixed(2)}</Text>}
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={styles.sectionTitle}>
        <Ionicons name="list" size={18} color={COLORS.yellow} /> Disponibles
      </Text>
      {disponibles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🕐</Text>
          <Text style={styles.emptyText}>No hay pedidos disponibles ahora</Text>
          <Text style={styles.emptySub}>Deslizá para actualizar</Text>
        </View>
      ) : (
        disponibles.map(s => (
          <TouchableOpacity key={s.id} style={styles.orderCard}
            onPress={() => navigation.navigate('DetalleAsignacion', { id: s.id })}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderCode}>{s.codigo}</Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Disponible</Text>
              </View>
            </View>
            <Text style={styles.orderType}>{s.tipo_servicio}</Text>
            <Text style={styles.orderAddress} numberOfLines={1}>📍 {s.origen_direccion}</Text>
            {s.destino_direccion && <Text style={styles.orderAddress} numberOfLines={1}>🏁 {s.destino_direccion}</Text>}
            <View style={styles.orderFooter}>
              {s.precio_estimado != null && <Text style={styles.orderPrice}>C${s.precio_estimado.toFixed(2)}</Text>}
              <Text style={styles.orderTime}>{new Date(s.creado_en).toLocaleString('es-NI', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { paddingBottom: 32 },
  header: { backgroundColor: COLORS.black2, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  headerTitle: { ...FONTS.bold, fontSize: 22, color: COLORS.yellow },
  greeting: { ...FONTS.bold, fontSize: 20, color: COLORS.white },
  subtitle: { ...FONTS.regular, fontSize: 13, color: COLORS.gray400, marginTop: 2 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.yellow, justifyContent: 'center', alignItems: 'center' },
  avatarText: { ...FONTS.black, fontSize: 18, color: COLORS.black },
  loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 80 },
  loginIcon: { fontSize: 64, marginBottom: 16 },
  loginTitle: { ...FONTS.bold, fontSize: 22, color: COLORS.white, textAlign: 'center' },
  loginSub: { ...FONTS.regular, fontSize: 14, color: COLORS.gray400, textAlign: 'center', marginTop: 8 },
  loginBtn: { backgroundColor: COLORS.yellow, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, marginTop: 24 },
  loginBtnText: { ...FONTS.bold, fontSize: 16, color: COLORS.black },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.black2, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.gray700 },
  statNum: { ...FONTS.black, fontSize: 20, color: COLORS.yellow },
  statLabel: { ...FONTS.regular, fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  sectionTitle: { ...FONTS.semibold, fontSize: 16, color: COLORS.white, paddingHorizontal: 20, marginTop: 24, marginBottom: 10 },
  orderCard: { backgroundColor: COLORS.black2, marginHorizontal: 20, marginBottom: 10, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.gray700 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderCode: { ...FONTS.bold, fontSize: 14, color: COLORS.yellow },
  statusBadge: { backgroundColor: COLORS.blue + '30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { ...FONTS.semibold, fontSize: 11, color: COLORS.blue, textTransform: 'uppercase' },
  availableBadge: { backgroundColor: COLORS.green + '30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  availableText: { ...FONTS.semibold, fontSize: 11, color: COLORS.green, textTransform: 'uppercase' },
  orderType: { ...FONTS.semibold, fontSize: 15, color: COLORS.white, marginBottom: 4 },
  orderAddress: { ...FONTS.regular, fontSize: 12, color: COLORS.gray400, marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  orderPrice: { ...FONTS.bold, fontSize: 16, color: COLORS.yellow, marginTop: 4 },
  orderTime: { ...FONTS.regular, fontSize: 11, color: COLORS.gray500 },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...FONTS.semibold, fontSize: 16, color: COLORS.gray400, textAlign: 'center' },
  emptySub: { ...FONTS.regular, fontSize: 13, color: COLORS.gray500, marginTop: 4, textAlign: 'center' },
})
