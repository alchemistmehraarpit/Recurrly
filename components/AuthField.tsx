import { colors } from '@/constants/theme'
import clsx from 'clsx'
import React, { forwardRef, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

/**
 * Label + input + inline error. `placeholderTextColor` has to come from the JS
 * token mirror because it's a prop rather than a style.
 */
const AuthField = forwardRef<TextInput, AuthFieldProps>(
    ({ label, error, isPassword = false, ...inputProps }, ref) => {
        const [isVisible, setIsVisible] = useState(false)

        return (
            <View className="auth-field">
                <View className="auth-field-row">
                    <Text className="auth-label">{label}</Text>

                    {isPassword ? (
                        <TouchableOpacity
                            onPress={() => setIsVisible((visible) => !visible)}
                            accessibilityRole="button"
                            accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
                            hitSlop={8}
                        >
                            <Text className="auth-link">{isVisible ? 'Hide' : 'Show'}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                <TextInput
                    ref={ref}
                    className={clsx('auth-input', error && 'auth-input-error')}
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={isPassword && !isVisible}
                    accessibilityLabel={label}
                    {...inputProps}
                />

                {error ? <Text className="auth-error">{error}</Text> : null}
            </View>
        )
    },
)

AuthField.displayName = 'AuthField'

export default AuthField
