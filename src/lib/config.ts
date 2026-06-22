import Constants from 'expo-constants'

interface Extra {
  supabaseUrl: string
  supabaseAnonKey: string
  apiUrl: string
}

export const extra: Extra = {
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl as string ?? 'https://osofadrsdjsusjbtuavs.supabase.co',
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey as string ?? '',
  apiUrl: Constants.expoConfig?.extra?.apiUrl as string ?? 'http://192.168.0.100:3000',
}
