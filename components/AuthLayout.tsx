import { styled } from 'nativewind'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'

const SafeAreaView = styled(RNSafeAreaView)

/**
 * Shared shell for every auth screen, so the brand block and card can't drift
 * between sign in, sign up and verification.
 */
const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                className="auth-screen"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    className="auth-scroll"
                    contentContainerClassName="auth-content"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="auth-brand-block">
                        <View className="auth-logo-wrap">
                            <View className="auth-logo-mark">
                                <Text className="auth-logo-mark-text">R</Text>
                            </View>

                            <View>
                                <Text className="auth-wordmark">Recurrly</Text>
                                <Text className="auth-wordmark-sub">Smart Billing</Text>
                            </View>
                        </View>

                        <Text className="auth-title">{title}</Text>
                        <Text className="auth-subtitle">{subtitle}</Text>
                    </View>

                    <View className="auth-card">{children}</View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default AuthLayout
