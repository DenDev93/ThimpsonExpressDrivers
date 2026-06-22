import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { HomeScreen } from '@/screens/HomeScreen'
import { AsignacionesScreen } from '@/screens/AsignacionesScreen'
import { DetalleAsignacionScreen } from '@/screens/DetalleAsignacionScreen'
import { GananciasScreen } from '@/screens/GananciasScreen'
import { PerfilScreen } from '@/screens/PerfilScreen'
import { LoginScreen } from '@/screens/LoginScreen'
import { RegisterScreen } from '@/screens/RegisterScreen'
import { COLORS } from '@/lib/theme'

const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()
const AssignStack = createNativeStackNavigator()

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="DetalleAsignacion" component={DetalleAsignacionScreen} />
      <HomeStack.Screen name="Login" component={LoginScreen} />
      <HomeStack.Screen name="Register" component={RegisterScreen} />
    </HomeStack.Navigator>
  )
}

function AssignStackNav() {
  return (
    <AssignStack.Navigator screenOptions={{ headerShown: false }}>
      <AssignStack.Screen name="AssignMain" component={AsignacionesScreen} />
      <AssignStack.Screen name="DetalleAsignacion" component={DetalleAsignacionScreen} />
    </AssignStack.Navigator>
  )
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.yellow,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.black,
          borderTopColor: COLORS.gray700,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 56,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNav}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AssignTab"
        component={AssignStackNav}
        options={{
          tabBarLabel: 'Asignaciones',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={GananciasScreen}
        options={{
          tabBarLabel: 'Ganancias',
          tabBarIcon: ({ color, size }) => <Ionicons name="cash" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}
