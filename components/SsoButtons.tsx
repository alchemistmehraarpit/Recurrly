import { authErrorMessage } from '@/lib/authErrors'
// The Core 3 flow (`signIn.password()` / `finalize()`) pairs with the experimental
// SSO hook: it works on future resources and activates the session for us.
import { useSSO } from '@clerk/expo/experimental'
import type { OAuthStrategy } from '@clerk/expo/types'
import clsx from 'clsx'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import React, { useEffect, useState } from 'react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

const PROVIDERS: { strategy: OAuthStrategy; label: string }[] = [
    { strategy: 'oauth_google', label: 'Continue with Google' },
    { strategy: 'oauth_apple', label: 'Continue with Apple' },
]

/** Pre-warming the custom tab makes the Android hand-off noticeably faster. */
const useWarmUpBrowser = () => {
    useEffect(() => {
        if (Platform.OS !== 'android') return
        void WebBrowser.warmUpAsync()
        return () => {
            void WebBrowser.coolDownAsync()
        }
    }, [])
}

const SsoButtons = ({ disabled = false }: SsoButtonsProps) => {
    useWarmUpBrowser()

    const { startSSOFlow } = useSSO()
    const [pendingStrategy, setPendingStrategy] = useState<OAuthStrategy | null>(null)
    const [error, setError] = useState<string | null>(null)

    const onProviderPress = async (strategy: OAuthStrategy) => {
        setPendingStrategy(strategy)
        setError(null)

        try {
            const { createdSessionId, authSessionResult } = await startSSOFlow({
                strategy,
                redirectUrl: AuthSession.makeRedirectUri({
                    scheme: 'recurrly',
                    path: 'sso-callback',
                }),
            })

            // Backing out of the browser is a deliberate choice, not a failure.
            if (authSessionResult?.type !== 'success') return

            // A completed session is activated for us, and the route guard in the
            // root layout moves the user. Anything else means Clerk still needs
            // more from them than this screen can collect.
            if (!createdSessionId) {
                setError("We couldn't finish signing you in. Try email instead.")
            }
        } catch (err) {
            setError(authErrorMessage(err as { code?: string }))
        } finally {
            setPendingStrategy(null)
        }
    }

    const isBusy = disabled || pendingStrategy !== null

    return (
        <View>
            <View className="auth-divider-row">
                <View className="auth-divider-line" />
                <Text className="auth-divider-text">or</Text>
                <View className="auth-divider-line" />
            </View>

            <View className="auth-form">
                {PROVIDERS.map(({ strategy, label }) => (
                    <TouchableOpacity
                        key={strategy}
                        className={clsx('auth-secondary-button', isBusy && 'opacity-50')}
                        onPress={() => onProviderPress(strategy)}
                        disabled={isBusy}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel={label}
                        accessibilityState={{ disabled: isBusy, busy: pendingStrategy === strategy }}
                    >
                        <Text className="auth-secondary-button-text">
                            {pendingStrategy === strategy ? 'Opening…' : label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {error ? <Text className="auth-error mt-3">{error}</Text> : null}
        </View>
    )
}

export default SsoButtons
