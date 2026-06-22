import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { api, Solicitud } from '@/lib/api'
import { COLORS, FONTS } from '@/lib/theme'

const PASOS = [
  { key: 'asignada', icon: 'checkmark-circle', label: 'Aceptar pedido', color: COLORS.blue },
  { key: 'en_camino', icon: 'navigate', label: 'Recoger pedido', color: COLORS.orange },
  { key: 'completado', icon: 'flag', label: 'Entregar', color: COLORS.green },
]

export function DetalleAsignacionScreen({ route, navigation }: any) {
  const { id } = route.params
  const { perfil } = useAuth()
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [cargando, setCargando] = useState(true)
  const [accionando, setAccionando] = useState(false)

  const cargar = async () => {
    setCargando(true)
    const r = await api.solicitudes.getById(id)
    setSolicitud(r.data)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [id])

  const confirmarAccion = (titulo: string, mensaje: string, onConfirm: () => void) => {
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', style: 'default', onPress: onConfirm },
    ])
  }

  const aceptar = async () => {
    if (!perfil?.id || !solicitud) return
    setAccionando(true)
    const r = await api.solicitudes.aceptar(solicitud.id, perfil.id)
    if (r.data) setSolicitud(r.data)
    else Alert.alert('Error', r.error?.message ?? 'No se pudo aceptar')
    setAccionando(false)
  }

  const actualizarEstado = async (estado: string) => {
    if (!solicitud) return
    setAccionando(true)
    const r = await api.solicitudes.updateEstado(solicitud.id, estado)
    if (r.data) setSolicitud(r.data)
    else Alert.alert('Error', r.error?.message ?? 'Error al actualizar')
    setAccionando(false)
  }

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.yellow} />
      </View>
    )
  }

  if (!solicitud) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.red} />
        <Text style={styles.errorText}>No se encontró la asignación</Text>
      </View>
    )
  }

  const pasoActual = PASOS.findIndex(p => p.key === solicitud.estado)
  const esDisponible = solicitud.estado === 'confirmada' || solicitud.estado === 'pendiente'
  const esAsignadaAMi = solicitud.motorizado_id === perfil?.id

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.code}>{solicitud.codigo}</Text>
          <Text style={styles.service}>{solicitud.tipo_servicio}</Text>
        </View>
        <View style={[styles.badge, {
          backgroundColor: solicitud.estado === 'completado' || solicitud.estado === 'entregada' ? COLORS.green + '30' :
            solicitud.estado === 'cancelado' ? COLORS.red + '30' :
            solicitud.estado === 'asignada' ? COLORS.blue + '30' :
            solicitud.estado === 'en_camino' ? COLORS.orange + '30' : COLORS.gray600
        }]}>
          <Text style={[styles.badgeText, {
            color: solicitud.estado === 'completado' || solicitud.estado === 'entregada' ? COLORS.green :
              solicitud.estado === 'cancelado' ? COLORS.red :
              solicitud.estado === 'asignada' ? COLORS.blue :
              solicitud.estado === 'en_camino' ? COLORS.orange : COLORS.gray400
          }]}>{solicitud.estado.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Dirección de origen</Text>
        <Text style={styles.sectionValue}>{solicitud.origen_direccion}</Text>
      </View>

      {solicitud.destino_direccion && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏁 Dirección de destino</Text>
          <Text style={styles.sectionValue}>{solicitud.destino_direccion}</Text>
        </View>
      )}

      {solicitud.descripcion && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Descripción</Text>
          <Text style={styles.sectionValue}>{solicitud.descripcion}</Text>
        </View>
      )}

      <View style={styles.priceSection}>
        {solicitud.precio_estimado != null && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio estimado</Text>
            <Text style={styles.priceValue}>C${solicitud.precio_estimado.toFixed(2)}</Text>
          </View>
        )}
        {solicitud.precio_final != null && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio final</Text>
            <Text style={[styles.priceValue, styles.priceFinal]}>C${solicitud.precio_final.toFixed(2)}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        {esDisponible && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => confirmarAccion('Aceptar pedido', `¿Aceptar ${solicitud.codigo}?`, aceptar)} disabled={accionando}>
            {accionando ? <ActivityIndicator color={COLORS.black} /> : <Ionicons name="checkmark-circle" size={20} color={COLORS.black} />}
            <Text style={styles.primaryBtnText}>Aceptar pedido</Text>
          </TouchableOpacity>
        )}

        {esAsignadaAMi && solicitud.estado === 'asignada' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => confirmarAccion('En camino', 'Marcar que vas en camino a recoger?', () => actualizarEstado('en_camino'))} disabled={accionando}>
            {accionando ? <ActivityIndicator color={COLORS.black} /> : <Ionicons name="navigate" size={20} color={COLORS.black} />}
            <Text style={styles.primaryBtnText}>Ir a recoger</Text>
          </TouchableOpacity>
        )}

        {esAsignadaAMi && solicitud.estado === 'en_camino' && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => confirmarAccion('Completar', '¿Marcar como entregado?', () => actualizarEstado('completado'))} disabled={accionando}>
              {accionando ? <ActivityIndicator color={COLORS.black} /> : <Ionicons name="flag" size={20} color={COLORS.black} />}
              <Text style={styles.primaryBtnText}>Marcar entregado</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => confirmarAccion('En camino a destino', '¿Ya recogiste el pedido y vas en camino?', () => actualizarEstado('en_camino'))}>
              <Ionicons name="navigate" size={20} color={COLORS.black} />
              <Text style={styles.primaryBtnText}>Ya recogí el pedido</Text>
            </TouchableOpacity>
          </>
        )}

        {esDisponible && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close-circle" size={20} color={COLORS.red} />
            <Text style={styles.secondaryBtnText}>Rechazar</Text>
          </TouchableOpacity>
        )}

        {esAsignadaAMi && (solicitud.estado === 'asignada' || solicitud.estado === 'en_camino') && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => {
            Alert.alert('Rechazar asignación', '¿Estás seguro?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Rechazar', style: 'destructive', onPress: async () => {
                setAccionando(true)
                await api.solicitudes.rechazar(solicitud.id)
                setAccionando(false)
                navigation.goBack()
              }},
            ])
          }} disabled={accionando}>
            <Ionicons name="close-circle" size={20} color={COLORS.red} />
            <Text style={styles.secondaryBtnText}>Liberar pedido</Text>
          </TouchableOpacity>
        )}

        {esAsignadaAMi && (solicitud.estado === 'completado' || solicitud.estado === 'entregada') && (
          <View style={styles.completedBox}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.green} />
            <Text style={styles.completedText}>Entregado</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.black, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...FONTS.regular, fontSize: 15, color: COLORS.gray400, marginTop: 12 },
  header: { backgroundColor: COLORS.black2, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  backBtn: { marginRight: 12 },
  headerInfo: { flex: 1 },
  code: { ...FONTS.black, fontSize: 18, color: COLORS.yellow },
  service: { ...FONTS.regular, fontSize: 13, color: COLORS.gray400, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { ...FONTS.bold, fontSize: 11 },
  section: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  sectionTitle: { ...FONTS.semibold, fontSize: 13, color: COLORS.gray400, marginBottom: 4 },
  sectionValue: { ...FONTS.regular, fontSize: 15, color: COLORS.white },
  priceSection: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  priceLabel: { ...FONTS.regular, fontSize: 13, color: COLORS.gray400 },
  priceValue: { ...FONTS.semibold, fontSize: 15, color: COLORS.white },
  priceFinal: { ...FONTS.bold, fontSize: 18, color: COLORS.yellow },
  actionsSection: { padding: 20, gap: 12 },
  primaryBtn: { backgroundColor: COLORS.yellow, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryBtnText: { ...FONTS.bold, fontSize: 16, color: COLORS.black },
  secondaryBtn: { borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.red + '40' },
  secondaryBtnText: { ...FONTS.semibold, fontSize: 15, color: COLORS.red },
  completedBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  completedText: { ...FONTS.bold, fontSize: 18, color: COLORS.green },
})
