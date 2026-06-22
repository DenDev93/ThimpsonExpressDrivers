import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { COLORS, FONTS } from '@/lib/theme'

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Nombre, correo y contraseña son obligatorios')
      return
    }
    if (password.length < 6) {
      Alert.alert('Contraseña', 'Debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      await register(email, password, nombre, telefono)
      Alert.alert('Registro exitoso', 'Bienvenido a Thimpson Drivers')
      navigation.goBack()
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrarse</Text>
        <Text style={styles.headerSub}>Unite al equipo de motorizados Thimpson</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Tu nombre" placeholderTextColor={COLORS.gray500} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="motorizado@email.com" placeholderTextColor={COLORS.gray500} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono (opcional)</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="+505 8765 4321" placeholderTextColor={COLORS.gray500} keyboardType="phone-pad" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" placeholderTextColor={COLORS.gray500} secureTextEntry />
        </View>
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.black} /> : <Text style={styles.registerBtnText}>Crear cuenta</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>¿Ya tenés cuenta? Iniciá sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { paddingBottom: 40 },
  header: { backgroundColor: COLORS.black2, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  backBtn: { marginBottom: 12 },
  backText: { ...FONTS.medium, fontSize: 15, color: COLORS.yellow },
  headerTitle: { ...FONTS.bold, fontSize: 24, color: COLORS.white },
  headerSub: { ...FONTS.regular, fontSize: 14, color: COLORS.gray400, marginTop: 4 },
  form: { padding: 24, gap: 20 },
  inputGroup: { gap: 6 },
  label: { ...FONTS.semibold, fontSize: 13, color: COLORS.gray400, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.black2, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.white, fontSize: 15, borderWidth: 1, borderColor: COLORS.gray700 },
  registerBtn: { backgroundColor: COLORS.yellow, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  registerBtnText: { ...FONTS.bold, fontSize: 16, color: COLORS.black },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginText: { ...FONTS.medium, fontSize: 14, color: COLORS.yellow },
})
