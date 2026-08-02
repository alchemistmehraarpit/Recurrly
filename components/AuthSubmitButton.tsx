import clsx from 'clsx'
import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'

/**
 * The spinner swaps in for the label rather than sitting beside it, so the
 * button keeps its height and the card never jumps mid-submit.
 */
const AuthSubmitButton = ({ label, onPress, disabled = false, isSubmitting = false }: AuthSubmitButtonProps) => {
    const isInactive = disabled || isSubmitting

    return (
        <TouchableOpacity
            className={clsx('auth-button', isInactive && 'auth-button-disabled')}
            onPress={onPress}
            disabled={isInactive}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: isInactive, busy: isSubmitting }}
        >
            {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
            ) : (
                <Text className="auth-button-text">{label}</Text>
            )}
        </TouchableOpacity>
    )
}

export default AuthSubmitButton
