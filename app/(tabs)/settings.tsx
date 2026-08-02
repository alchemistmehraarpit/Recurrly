import { useClerk, useUser } from '@clerk/expo'
import { styled } from "nativewind"
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)

const Settings = () => {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // The route guard in the root layout sends us back to sign in.
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title">Settings</Text>

      <View className="auth-card">
        <Text className="auth-label">Signed in as</Text>
        <Text className="auth-helper">
          {user?.primaryEmailAddress?.emailAddress ?? '—'}
        </Text>
      </View>

      <View className="mt-5">
        <TouchableOpacity
          className="auth-button"
          onPress={handleSignOut}
          disabled={isSigningOut}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text className="auth-button-text">
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Settings
