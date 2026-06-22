import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { COLORS, FONTS } from '@/lib/theme'

export function LoginScreen({ navigation }: any) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Completá todos los campos')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigation.goBack()
    } catch (err: any) {
      Alert.alert('Error', err.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iniciar sesión</Text>
        <Text style={styles.headerSub}>Motorizados Thimpson</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="motorizado@email.com" placeholderTextColor={COLORS.gray500} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••" placeholderTextColor={COLORS.gray500} secureTextEntry />
        </View>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.black} /> : <Text style={styles.loginBtnText}>Ingresar</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>¿No tenés cuenta? Registrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { backgroundColor: COLORS.black2, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray700 },
  backBtn: { marginBottom: 12 },
  backText: { ...FONTS.medium, fontSize: 15, color: COLORS.yellow },
  headerTitle: { ...FONTS.bold, fontSize: 24, color: COLORS.white },
  headerSub: { ...FONTS.regular, fontSize: 14, color: COLORS.gray400, marginTop: 4 },
  form: { padding: 24, gap: 20 },
  inputGroup: { gap: 6 },
  label: { ...FONTS.semibold, fontSize: 13, color: COLORS.gray400, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.black2, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.white, fontSize: 15, borderWidth: 1, borderColor: COLORS.gray700 },
  loginBtn: { backgroundColor: COLORS.yellow, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  loginBtnText: { ...FONTS.bold, fontSize: 16, color: COLORS.black },
  registerLink: { alignItems: 'center', paddingVertical: 8 },
  registerText: { ...FONTS.medium, fontSize: 14, color: COLORS.yellow },
})
