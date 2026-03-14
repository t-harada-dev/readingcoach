import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AppInitProvider } from './src/appInit';
import { NotificationResponseCoordinator } from './src/app/NotificationResponseCoordinator';
import { OnboardingCoordinator } from './src/app/OnboardingCoordinator';
import { SurfaceTriggerCoordinator } from './src/app/SurfaceTriggerCoordinator';
import {
    ScreenCatalogLauncher,
    ScreenCatalogScreen,
    ScreenPlaygroundScreen,
} from './src/dev/screenCatalog';
import { persistenceBridge } from './src/bridge/PersistenceBridge';
import { copy } from './src/config/copy';
import { ActiveSessionScreen } from './src/screens/ActiveSessionScreen';
import { AddBookScreen } from './src/screens/AddBookScreen';
import { OnboardingAddBookScreen } from './src/screens/OnboardingAddBookScreen';
import { BookDetailScreen } from './src/screens/BookDetailScreen';
import { CompletionScreen } from './src/screens/CompletionScreen';
import { DueActionSheetScreen } from './src/screens/DueActionSheetScreen';
import { FocusCoreScreen } from './src/screens/FocusCoreScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { NextFocusNominationScreen } from './src/screens/NextFocusNominationScreen';
import { OnboardingNotificationScreen } from './src/screens/OnboardingNotificationScreen';
import { OnboardingTimeScreen } from './src/screens/OnboardingTimeScreen';
import { ProgressTrackingPromptScreen } from './src/screens/ProgressTrackingPromptScreen';
import { ProgressTrackingSetupScreen } from './src/screens/ProgressTrackingSetupScreen';
import { RestartRecoveryScreen } from './src/screens/RestartRecoveryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { isSurfaceSnapshotId, SurfaceSnapshotScreen } from './src/screens/SurfaceSnapshotScreen';
import type { RootStackParamList, SurfaceSnapshotId } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

function shouldShowHeaderSettings(routeName: keyof RootStackParamList): boolean {
    return routeName !== 'DevScreenCatalog' && routeName !== 'DevScreenPlayground';
}

function parseSurfaceSnapshotId(raw: string | null): SurfaceSnapshotId | null {
    if (!raw) return null;
    const normalized = raw.trim().toUpperCase();
    if (isSurfaceSnapshotId(normalized)) return normalized;
    const compact = normalized.match(/^SF[-_]?0([1-9])$/);
    if (!compact) return null;
    const converted = `SF-0${compact[1]}` as SurfaceSnapshotId;
    return isSurfaceSnapshotId(converted) ? converted : null;
}

function InitialLaunchCoordinator({
    navigationRef,
    navigationReady,
    onCatalogFlags,
}: {
    navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
    navigationReady: boolean;
    onCatalogFlags: (enabled: boolean, autoOpen: boolean) => void;
}) {
    const consumedRef = useRef(false);

    useEffect(() => {
        if (!navigationReady) return;
        if (consumedRef.current) return;

        (async () => {
            if (consumedRef.current) return;
            consumedRef.current = true;

            try {
                const [enabledArg, autoOpenArg, surfaceSnapshot, openScreen] = await Promise.all([
                    persistenceBridge.getLaunchArg('e2e_screen_catalog'),
                    persistenceBridge.getLaunchArg('e2e_screen_catalog_auto_open'),
                    persistenceBridge.getLaunchArg('e2e_surface_snapshot'),
                    persistenceBridge.getLaunchArg('e2e_open_screen'),
                ]);

                const enabled = enabledArg === '1';
                const autoOpen = autoOpenArg === '1';
                const snapshotId = parseSurfaceSnapshotId(surfaceSnapshot);
                onCatalogFlags(enabled, autoOpen);

                if (snapshotId) {
                    requestAnimationFrame(() => {
                        if (!navigationRef.isReady()) return;
                        navigationRef.reset({
                            index: 0,
                            routes: [{ name: 'SurfaceSnapshot', params: { snapshotId } }],
                        });
                    });
                    return;
                }

                if (openScreen === 'settings' || openScreen === 'surface_snapshot') {
                    requestAnimationFrame(() => {
                        if (!navigationRef.isReady()) return;
                        if (openScreen === 'surface_snapshot') {
                            if (!snapshotId) return;
                            navigationRef.reset({
                                index: 0,
                                routes: [{ name: 'SurfaceSnapshot', params: { snapshotId } }],
                            });
                            return;
                        }
                        navigationRef.navigate('Settings');
                    });
                    return;
                }

                if (enabled && autoOpen) {
                    requestAnimationFrame(() => {
                        if (!navigationRef.isReady()) return;
                        navigationRef.navigate('DevScreenCatalog');
                    });
                }
            } catch {
                // e2e launch args are best-effort and must not block app startup.
            }
        })();
    }, [navigationReady, navigationRef, onCatalogFlags]);

    return null;
}

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
    const [e2eCatalogEnabled, setE2eCatalogEnabled] = useState(false);
    const [e2eCatalogAutoOpen, setE2eCatalogAutoOpen] = useState(false);
    const [navigationReady, setNavigationReady] = useState(false);
    const applyCatalogFlags = useCallback((enabled: boolean, autoOpen: boolean) => {
        setE2eCatalogEnabled(enabled);
        setE2eCatalogAutoOpen(autoOpen);
    }, []);
    const syncRouteName = useCallback(() => {
        if (!navigationRef.isReady()) return;
        setActiveRouteName(navigationRef.getCurrentRoute()?.name);
    }, []);

    const showCatalogDevTools = __DEV__ || e2eCatalogEnabled || e2eCatalogAutoOpen;
    const showCatalogLauncher = e2eCatalogEnabled || e2eCatalogAutoOpen;

    const hideCatalogLauncher =
        activeRouteName === 'DevScreenCatalog' || activeRouteName === 'DevScreenPlayground';

    return (
        <View testID="app-root" style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AppInitProvider>
                    <NavigationContainer
                        theme={theme}
                        ref={navigationRef}
                        onReady={() => {
                            setNavigationReady(true);
                            syncRouteName();
                        }}
                        onStateChange={syncRouteName}
                    >
                        <InitialLaunchCoordinator
                            navigationRef={navigationRef}
                            navigationReady={navigationReady}
                            onCatalogFlags={applyCatalogFlags}
                        />
                        <NotificationResponseCoordinator navigationRef={navigationRef} />
                        <SurfaceTriggerCoordinator navigationRef={navigationRef} navigationReady={navigationReady} />
                        <OnboardingCoordinator navigationRef={navigationRef} navigationReady={navigationReady} />
                        <Stack.Navigator
                            initialRouteName="FocusCore"
                            screenOptions={({ route, navigation }) => ({
                                headerStyle: { backgroundColor: '#FDFCF8' },
                                headerTintColor: '#2C2C2C',
                                headerTitleStyle: { fontSize: 17 },
                                contentStyle: { backgroundColor: '#FDFCF8' },
                                headerRight: shouldShowHeaderSettings(route.name)
                                    ? () => (
                                          <TouchableOpacity
                                              testID="header-settings-button"
                                              style={{ paddingHorizontal: 4, paddingVertical: 2 }}
                                              onPress={() => {
                                                  if (route.name === 'Settings') return;
                                                  navigation.navigate('Settings');
                                              }}
                                          >
                                              <Text style={{ color: '#2C2C2C', fontSize: 14, fontWeight: '600' }}>設定</Text>
                                          </TouchableOpacity>
                                      )
                                    : undefined,
                            })}
                        >
                            <Stack.Screen
                                name="FocusCore"
                                component={FocusCoreScreen}
                                options={{ title: copy.navigation.focusCoreTitle, headerLargeTitle: false }}
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
                                name="Settings"
                                component={SettingsScreen}
                                options={{ title: copy.navigation.settingsTitle }}
                            />
                            <Stack.Screen
                                name="ProgressTrackingPrompt"
                                component={ProgressTrackingPromptScreen}
                                options={{ title: '進捗バー案内', presentation: 'modal' }}
                            />
                            <Stack.Screen
                                name="ProgressTrackingSetup"
                                component={ProgressTrackingSetupScreen}
                                options={{ title: '進捗状況の登録' }}
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
                                name="AddBook"
                                component={AddBookScreen}
                                options={{ title: copy.navigation.addBookTitle }}
                            />
                            <Stack.Screen
                                name="OnboardingAddBook"
                                component={OnboardingAddBookScreen}
                                options={{ title: copy.navigation.onboardingAddBookTitle, headerBackVisible: false }}
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
                            <Stack.Screen
                                name="SurfaceSnapshot"
                                component={SurfaceSnapshotScreen}
                                options={{ title: 'Surface Snapshot', headerBackVisible: false }}
                            />
                            {showCatalogDevTools ? (
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
                    {showCatalogLauncher && !hideCatalogLauncher ? (
                        <ScreenCatalogLauncher
                            onPress={() => {
                                if (!navigationRef.isReady()) return;
                                navigationRef.navigate('DevScreenCatalog');
                            }}
                        />
                    ) : null}
                    <StatusBar style="dark" />
                </AppInitProvider>
            </SafeAreaProvider>
        </View>
    );
}
