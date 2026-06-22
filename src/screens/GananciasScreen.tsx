import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { api, Ganancium } from '@/lib/api'
import { COLORS, FONTS } from '@/lib/theme'

export function GananciasScreen() {
  const { perfil } = useAuth()
  const [ganancias, setGanancias] = useState<Ganancium[]>([])
  const [resumen, setResumen] = useState<{ total: number; pendiente: number; pagada: number } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const cargar = async () => {
    if (!perfil?.id) return
    const [g, r] = await Promise.all([
      api.ganancias.list(perfil.id, { limit: 50 }),
      api.ganancias.resumen(perfil.id),
    ])
    if (g.data) setGanancias(g.data)
    if (r.data) setResumen(r.data)
  }

  useEffect(() => { cargar() }, [perfil])

  const onRefresh = async () => {
    setRefreshing(true)
    await cargar()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ganancias</Text>
      </View>

      {resumen && (
        <View style={styles.resumenCard}>
          <View style={styles.resumenRow}>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Total generado</Text>
              <Text style={styles.resumenValue}>C${resumen.total.toFixed(2)}</Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Pagado</Text>
              <Text style={[styles.resumenValue, { color: COLORS.green }]}>C${resumen.pagada.toFixed(2)}</Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Por cobrar</Text>
              <Text style={[styles.resumenValue, { color: COLORS.yellow }]}>C${resumen.pendiente.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {ganancias.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={48} color={COLORS.gray500} />
            <Text style={styles.emptyText}>Aún no tenés ganancias registradas</Text>
          </View>
        ) : ganancias.map(g => (
          <View key={g.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardDesc}>{g.descripcion ?? 'Servicio de delivery'}</Text>
              <Text style={styles.cardDate}>{new Date(g.created_at).toLocaleDateString('es-NI', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
              {g.pagada ? (
                <View style={styles.pagadaBadge}><Text style={styles.pagadaText}>Pagado</Text></View>
              ) : (
                <View style={styles.pendienteBadge}><Text style={styles.pendienteText}>Pendiente</Text></View>
              )}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardMonto}>C${Number(g.monto).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { backgroundColor: COLORS.black2, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  headerTitle: { ...FONTS.bold, fontSize: 22, color: COLORS.white },
  resumenCard: { margin: 20, backgroundColor: COLORS.black2, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: COLORS.gray700 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resumenItem: { alignItems: 'center', flex: 1 },
  resumenLabel: { ...FONTS.regular, fontSize: 11, color: COLORS.gray400, marginBottom: 4, textTransform: 'uppercase' },
  resumenValue: { ...FONTS.bold, fontSize: 18, color: COLORS.white },
  list: { flex: 1 },
  listContent: { paddingBottom: 32 },
  card: { flexDirection: 'row', backgroundColor: COLORS.black2, marginHorizontal: 20, marginBottom: 8, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.gray700 },
  cardLeft: { flex: 1 },
  cardDesc: { ...FONTS.semibold, fontSize: 14, color: COLORS.white, marginBottom: 2 },
  cardDate: { ...FONTS.regular, fontSize: 12, color: COLORS.gray400, marginBottom: 6 },
  pagadaBadge: { backgroundColor: COLORS.green + '30', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  pagadaText: { ...FONTS.semibold, fontSize: 10, color: COLORS.green, textTransform: 'uppercase' },
  pendienteBadge: { backgroundColor: COLORS.yellow + '30', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  pendienteText: { ...FONTS.semibold, fontSize: 10, color: COLORS.yellow, textTransform: 'uppercase' },
  cardRight: { justifyContent: 'center', marginLeft: 12 },
  cardMonto: { ...FONTS.bold, fontSize: 18, color: COLORS.yellow },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { ...FONTS.regular, fontSize: 15, color: COLORS.gray500, marginTop: 12 },
})
