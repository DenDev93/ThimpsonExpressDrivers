import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { COLORS, FONTS } from '@/lib/theme'

export function PerfilScreen({ navigation }: any) {
  const { perfil, logout } = useAuth()
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(perfil?.nombre_completo ?? '')
  const [telefono, setTelefono] = useState(perfil?.telefono ?? '')
  const [guardando, setGuardando] = useState(false)

  const cerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ])
  }

  const guardar = async () => {
    setGuardando(true)
    await api.perfil.update({ nombre_completo: nombre, telefono: telefono || null })
    setGuardando(false)
    setEditando(false)
    Alert.alert('Listo', 'Perfil actualizado')
  }

  if (!perfil) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi cuenta</Text>
        </View>
        <View style={styles.loginCard}>
          <View style={styles.loginAvatar}><Text style={styles.loginAvatarText}>🏍️</Text></View>
          <Text style={styles.loginTitle}>Iniciá sesión como motorizado</Text>
          <Text style={styles.loginSub}>Para recibir asignaciones y ver tus ganancias</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerBtnText}>Registrarme</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi perfil</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{perfil.nombre_completo?.charAt(0)?.toUpperCase() ?? 'M'}</Text>
        </View>
        <Text style={styles.name}>{perfil.nombre_completo ?? 'Motorizado'}</Text>
        <Text style={styles.role}>Motorizado</Text>
        {perfil.email && <Text style={styles.email}>{perfil.email}</Text>}
      </View>

      {editando ? (
        <View style={styles.editCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Tu nombre" placeholderTextColor={COLORS.gray500} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="+505 8765 4321" placeholderTextColor={COLORS.gray500} keyboardType="phone-pad" />
          </View>
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveBtn} onPress={guardar} disabled={guardando}>
              <Text style={styles.saveBtnText}>{guardando ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditando(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setEditando(true)}>
            <Ionicons name="person-outline" size={20} color={COLORS.gray400} />
            <Text style={styles.menuText}>Editar perfil</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray500} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.gray400} />
            <Text style={styles.menuText}>Acerca de</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray500} />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { paddingBottom: 40 },
  header: { backgroundColor: COLORS.black2, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  headerTitle: { ...FONTS.bold, fontSize: 22, color: COLORS.white },
  loginCard: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 40, marginTop: 40 },
  loginAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.yellow, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loginAvatarText: { fontSize: 32 },
  loginTitle: { ...FONTS.bold, fontSize: 20, color: COLORS.white, textAlign: 'center' },
  loginSub: { ...FONTS.regular, fontSize: 14, color: COLORS.gray400, textAlign: 'center', marginTop: 8 },
  loginBtn: { backgroundColor: COLORS.yellow, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 40, marginTop: 24 },
  loginBtnText: { ...FONTS.bold, fontSize: 15, color: COLORS.black },
  registerBtn: { borderWidth: 2, borderColor: COLORS.yellow, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 40, marginTop: 12 },
  registerBtnText: { ...FONTS.semibold, fontSize: 15, color: COLORS.yellow },
  profileCard: { alignItems: 'center', paddingVertical: 28, marginHorizontal: 20, marginTop: 20, backgroundColor: COLORS.black2, borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray700 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.yellow, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { ...FONTS.black, fontSize: 32, color: COLORS.black },
  name: { ...FONTS.bold, fontSize: 20, color: COLORS.white },
  role: { ...FONTS.semibold, fontSize: 13, color: COLORS.yellow, marginTop: 2 },
  email: { ...FONTS.regular, fontSize: 14, color: COLORS.gray400, marginTop: 4 },
  editCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: COLORS.black2, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: COLORS.gray700 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { ...FONTS.semibold, fontSize: 12, color: COLORS.gray400, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.black, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.white, fontSize: 15, borderWidth: 1, borderColor: COLORS.gray700 },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: COLORS.yellow, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { ...FONTS.bold, fontSize: 15, color: COLORS.black },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.gray600, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { ...FONTS.semibold, fontSize: 15, color: COLORS.gray400 },
  menu: { marginHorizontal: 20, marginTop: 24, backgroundColor: COLORS.black2, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray700 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray700, gap: 12 },
  menuText: { flex: 1, fontSize: 15, color: COLORS.gray300, ...FONTS.medium },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 32, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.black2, gap: 8, borderWidth: 1, borderColor: COLORS.red + '30' },
  logoutText: { ...FONTS.semibold, fontSize: 15, color: COLORS.red },
})
