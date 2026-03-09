import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context';
import { AppInitProvider } from './src/appInit';
import { FocusCoreScreen } from './src/screens/FocusCoreScreen';
import { FocusBookPickerScreen } from './src/screens/FocusBookPickerScreen';
import { ActiveSessionScreen } from './src/screens/ActiveSessionScreen';
import { ExecutionScreen } from './src/screens/ExecutionScreen';
import { ReserveScreen } from './src/screens/ReserveScreen';
import { AddBookScreen } from './src/screens/AddBookScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D48A3E',
    background: '#FDFCF8',
    card: '#FDFCF8',
    text: '#2C2C2C',
    border: 'rgba(44,44,44,0.10)',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppInitProvider>
          <NavigationContainer theme={theme}>
            <Stack.Navigator
              initialRouteName="FocusCore"
              screenOptions={{
                headerStyle: { backgroundColor: '#FDFCF8' },
                headerTintColor: '#2C2C2C',
                headerTitleStyle: { fontSize: 17 },
                contentStyle: { backgroundColor: '#FDFCF8' },
              }}
            >
              <Stack.Screen
                name="FocusCore"
                component={FocusCoreScreen}
                options={{ title: '今日の1冊', headerLargeTitle: false }}
              />
              <Stack.Screen
                name="FocusBookPicker"
                component={FocusBookPickerScreen}
                options={{ title: '本を切り替える' }}
              />
              <Stack.Screen
                name="ActiveSession"
                component={ActiveSessionScreen}
                options={{ title: '執行' }}
              />
              {/* 旧ホーム（比較・退避用） */}
              <Stack.Screen
                name="Execution"
                component={ExecutionScreen}
                options={{ title: '（旧）執行ホーム', headerLargeTitle: false }}
              />
              <Stack.Screen name="Reserve" component={ReserveScreen} options={{ title: '明日の予約' }} />
              <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: '本を追加' }} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="dark" />
        </AppInitProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
