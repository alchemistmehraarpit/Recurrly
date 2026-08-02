import { colors } from '@/constants/theme'
import { useAuth, useClerk } from '@clerk/expo'
import { Redirect, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

/**
 * Landing point for the Google/Apple redirect. The browser hands control back to
 * the app at this path, so it needs a real route — otherwise expo-router renders
 * "Unmatched Route" even though the session was created successfully.
 *
 * Navigating here unmounts the sign-in screen, and with it the `SsoButtons` that
 * kicked the flow off, so the in-flight `startSSOFlow` promise can be dropped
 * before it activates the session. Clerk puts the new session id in the callback
 * URL, so we finish the job here instead of depending on that component
 * surviving. It also means a cold start via the redirect still works.
 *
 * Both redirects below must target a route that is currently reachable. Sending
 * everyone to `/` and letting the guard sort it out looks tidier but blanks the
 * screen: while the session is inactive, `(tabs)` is guarded off, so `/` resolves
 * to an excluded route and nothing renders.
 */
export default function SsoCallback() {
    const { isLoaded, isSignedIn } = useAuth()
    const clerk = useClerk()
    const { created_session_id: createdSessionId } = useLocalSearchParams<{
        created_session_id?: string
    }>()

    const [isSettled, setIsSettled] = useState(false)

    useEffect(() => {
        if (!isLoaded) return

        // Already signed in, or nothing handed back to activate.
        if (isSignedIn || !createdSessionId) {
            setIsSettled(true)
            return
        }

        let isCancelled = false

        clerk
            .setActive({ session: createdSessionId })
            .catch(() => {
                // Fall through to the redirect below, which sends the user back
                // to sign in so they can try again.
            })
            .finally(() => {
                if (!isCancelled) setIsSettled(true)
            })

        return () => {
            isCancelled = true
        }
    }, [isLoaded, isSignedIn, createdSessionId, clerk])

    if (!isLoaded || !isSettled) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator color={colors.accent} />
            </View>
        )
    }

    return <Redirect href={isSignedIn ? '/' : '/(auth)/signin'} />
}
