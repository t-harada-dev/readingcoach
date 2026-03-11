import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useCallback, useState } from 'react';

import { AppInitProvider } from './src/appInit';
import { NotificationResponseCoordinator } from './src/app/NotificationResponseCoordinator';
import { OnboardingCoordinator } from './src/app/OnboardingCoordinator';
import { SurfaceTriggerCoordinator } from './src/app/SurfaceTriggerCoordinator';
import {
    ScreenCatalogLauncher,
    ScreenCatalogScreen,
    ScreenPlaygroundScreen,
} from './src/dev/screenCatalog';
import { copy } from './src/config/copy';
import { ActiveSessionScreen } from './src/screens/ActiveSessionScreen';
import { AddBookScreen } from './src/screens/AddBookScreen';
import { BookDetailScreen } from './src/screens/BookDetailScreen';
import { CompletionScreen } from './src/screens/CompletionScreen';
import { DueActionSheetScreen } from './src/screens/DueActionSheetScreen';
import { FocusBookPickerScreen } from './src/screens/FocusBookPickerScreen';
import { FocusCoreScreen } from './src/screens/FocusCoreScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { NextFocusNominationScreen } from './src/screens/NextFocusNominationScreen';
import { OnboardingNotificationScreen } from './src/screens/OnboardingNotificationScreen';
import { OnboardingTimeScreen } from './src/screens/OnboardingTimeScreen';
import { ProgressTrackingPromptScreen } from './src/screens/ProgressTrackingPromptScreen';
import { ProgressTrackingSetupScreen } from './src/screens/ProgressTrackingSetupScreen';
import { ReserveScreen } from './src/screens/ReserveScreen';
import { RestartRecoveryScreen } from './src/screens/RestartRecoveryScreen';
import { TimeChangeScreen } from './src/screens/TimeChangeScreen';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

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
    const [activeRouteName, setActiveRouteName] = useState<string | undefined>(undefined);
    const syncRouteName = useCallback(() => {
        if (!navigationRef.isReady()) return;
        setActiveRouteName(navigationRef.getCurrentRoute()?.name);
    }, []);

    const hideCatalogLauncher =
        activeRouteName === 'DevScreenCatalog' || activeRouteName === 'DevScreenPlayground';

    return (
        <View testID="app-root" style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AppInitProvider>
                    <NavigationContainer theme={theme} ref={navigationRef} onReady={syncRouteName} onStateChange={syncRouteName}>
                        <NotificationResponseCoordinator navigationRef={navigationRef} />
                        <SurfaceTriggerCoordinator navigationRef={navigationRef} />
                        <OnboardingCoordinator navigationRef={navigationRef} />
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
                                options={{ title: copy.navigation.focusCoreTitle, headerLargeTitle: false }}
                            />
                            <Stack.Screen
                                name="FocusBookPicker"
                                component={FocusBookPickerScreen}
                                options={{ title: copy.navigation.focusBookPickerTitle }}
                            />
                            <Stack.Screen
                                name="ActiveSession"
                                component={ActiveSessionScreen}
                                options={{ title: copy.navigation.activeSessionTitle }}
                            />
                            <Stack.Screen
                                name="Completion"
                                component={CompletionScreen}
                                options={{ title: copy.navigation.completionTitle }}
                            />
                            <Stack.Screen
                                name="DueActionSheet"
                                component={DueActionSheetScreen}
                                options={{ title: copy.navigation.dueActionTitle, presentation: 'modal' }}
                            />
                            <Stack.Screen
                                name="RestartRecovery"
                                component={RestartRecoveryScreen}
                                options={{ title: copy.navigation.restartRecoveryTitle }}
                            />
                            <Stack.Screen
                                name="TimeChange"
                                component={TimeChangeScreen}
                                options={{ title: copy.navigation.timeChangeTitle }}
                            />
                            <Stack.Screen
                                name="ProgressTrackingPrompt"
                                component={ProgressTrackingPromptScreen}
                                options={{ title: '進捗バー案内', presentation: 'modal' }}
                            />
                            <Stack.Screen
                                name="ProgressTrackingSetup"
                                component={ProgressTrackingSetupScreen}
                                options={{ title: '進捗設定' }}
                            />
                            <Stack.Screen
                                name="NextFocusNomination"
                                component={NextFocusNominationScreen}
                                options={{ title: copy.navigation.nextFocusNominationTitle }}
                            />
                            <Stack.Screen
                                name="Library"
                                component={LibraryScreen}
                                options={{ title: copy.navigation.libraryTitle }}
                            />
                            <Stack.Screen
                                name="BookDetail"
                                component={BookDetailScreen}
                                options={{ title: copy.navigation.bookDetailTitle }}
                            />
                            <Stack.Screen
                                name="Reserve"
                                component={ReserveScreen}
                                options={{ title: copy.navigation.reserveTitle }}
                            />
                            <Stack.Screen
                                name="AddBook"
                                component={AddBookScreen}
                                options={{ title: copy.navigation.addBookTitle }}
                            />
                            <Stack.Screen
                                name="OnboardingAddBook"
                                component={AddBookScreen}
                                options={{ title: copy.navigation.addBookTitle, headerBackVisible: false }}
                                initialParams={{ onboarding: true }}
                            />
                            <Stack.Screen
                                name="OnboardingTime"
                                component={OnboardingTimeScreen}
                                options={{ title: '時刻設定', headerBackVisible: false }}
                            />
                            <Stack.Screen
                                name="OnboardingNotification"
                                component={OnboardingNotificationScreen}
                                options={{ title: '通知案内', headerBackVisible: false }}
                            />
                            {__DEV__ ? (
                                <>
                                    <Stack.Screen
                                        name="DevScreenCatalog"
                                        component={ScreenCatalogScreen}
                                        options={{ title: 'Screen Catalog' }}
                                    />
                                    <Stack.Screen
                                        name="DevScreenPlayground"
                                        component={ScreenPlaygroundScreen}
                                        options={{ title: 'Playground' }}
                                    />
                                </>
                            ) : null}
                        </Stack.Navigator>
                    </NavigationContainer>
                    {__DEV__ && !hideCatalogLauncher ? (
                        <ScreenCatalogLauncher
                            onPress={() => {
                                if (!navigationRef.isReady()) return;
                                navigationRef.navigate('DevScreenCatalog' as never);
                            }}
                        />
                    ) : null}
                    <StatusBar style="dark" />
                </AppInitProvider>
            </SafeAreaProvider>
        </View>
    );
}
