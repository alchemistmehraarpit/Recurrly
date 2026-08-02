import AuthField from '@/components/AuthField'
import AuthLayout from '@/components/AuthLayout'
import AuthSubmitButton from '@/components/AuthSubmitButton'
import SsoButtons from '@/components/SsoButtons'
import { authErrorMessage, globalAuthErrorMessage } from '@/lib/authErrors'
import { validateCode, validateEmail, validatePassword } from '@/lib/validation'
import { useSignIn } from '@clerk/expo'
import { Link } from 'expo-router'
import React, { useRef, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

const SignIn = () => {
    const { signIn, errors, fetchStatus } = useSignIn()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')

    const [fieldErrors, setFieldErrors] = useState<{
        email: string | null
        password: string | null
        code: string | null
    }>({ email: null, password: null, code: null })
    const [formError, setFormError] = useState<string | null>(null)

    // Server-side errors are stale the moment the user starts correcting them,
    // so we only surface them between a submit and the next keystroke.
    const [showServerErrors, setShowServerErrors] = useState(false)

    const passwordRef = useRef<TextInput>(null)
    const isSubmitting = fetchStatus === 'fetching'

    const onFieldChange = (setter: (value: string) => void, key: 'email' | 'password' | 'code', validator: (value: string) => string | null) =>
        (value: string) => {
            setter(value)
            setShowServerErrors(false)
            setFormError(null)
            // Only re-validate a field that is already complaining, so we never
            // scold someone halfway through typing.
            setFieldErrors((current) =>
                current[key] ? { ...current, [key]: validator(value) } : current,
            )
        }

    const handleSubmit = async () => {
        const emailError = validateEmail(emailAddress)
        const passwordError = validatePassword(password)

        setFieldErrors({ email: emailError, password: passwordError, code: null })
        setFormError(null)

        if (emailError || passwordError) return

        const { error } = await signIn.password({
            emailAddress: emailAddress.trim(),
            password,
        })

        setShowServerErrors(true)

        if (error) {
            setFormError(authErrorMessage(error))
            return
        }

        if (signIn.status === 'complete') {
            // The route guard in the root layout takes it from here.
            await signIn.finalize()
            return
        }

        if (signIn.status === 'needs_client_trust') {
            const emailCodeFactor = signIn.supportedSecondFactors?.find(
                (factor) => factor.strategy === 'email_code',
            )
            if (emailCodeFactor) await signIn.mfa.sendEmailCode()
            return
        }

        setFormError('We need another step to sign you in. Try again shortly.')
    }

    const handleVerify = async () => {
        const codeError = validateCode(code)
        setFieldErrors((current) => ({ ...current, code: codeError }))
        setFormError(null)

        if (codeError) return

        const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() })
        setShowServerErrors(true)

        if (error) {
            setFormError(authErrorMessage(error))
            return
        }

        if (signIn.status === 'complete') await signIn.finalize()
    }

    const serverError = (fieldError: { code: string } | null | undefined) =>
        showServerErrors ? authErrorMessage(fieldError) : null

    const displayedFormError =
        formError ?? (showServerErrors ? globalAuthErrorMessage(errors.global) : null)

    if (signIn.status === 'needs_client_trust') {
        return (
            <AuthLayout
                title="Verify it's you"
                subtitle="Enter the 6-digit code we just sent to your email to finish signing in."
            >
                <View className="auth-form">
                    <AuthField
                        label="Verification code"
                        placeholder="123456"
                        value={code}
                        onChangeText={onFieldChange(setCode, 'code', validateCode)}
                        error={fieldErrors.code ?? serverError(errors.fields.code)}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete="one-time-code"
                        maxLength={6}
                        returnKeyType="go"
                        onSubmitEditing={handleVerify}
                    />

                    {displayedFormError ? <Text className="auth-error">{displayedFormError}</Text> : null}

                    <AuthSubmitButton
                        label="Verify"
                        onPress={handleVerify}
                        isSubmitting={isSubmitting}
                    />

                    <TouchableOpacity
                        className="auth-secondary-button"
                        onPress={() => signIn.mfa.sendEmailCode()}
                        disabled={isSubmitting}
                        accessibilityRole="button"
                    >
                        <Text className="auth-secondary-button-text">Send a new code</Text>
                    </TouchableOpacity>
                </View>

                <View className="auth-link-row">
                    <Text className="auth-link-copy">Wrong account?</Text>
                    <TouchableOpacity onPress={() => signIn.reset()} accessibilityRole="button">
                        <Text className="auth-link">Start over</Text>
                    </TouchableOpacity>
                </View>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Welcome"
            subtitle="Sign in to continue managing your subscriptions"
        >
            <View className="auth-form">
                <AuthField
                    label="Email"
                    placeholder="Enter your email"
                    value={emailAddress}
                    onChangeText={onFieldChange(setEmailAddress, 'email', validateEmail)}
                    error={fieldErrors.email ?? serverError(errors.fields.identifier)}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    submitBehavior="submit"
                />

                <AuthField
                    ref={passwordRef}
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={onFieldChange(setPassword, 'password', (value) => validatePassword(value))}
                    error={fieldErrors.password ?? serverError(errors.fields.password)}
                    isPassword
                    textContentType="password"
                    autoComplete="current-password"
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit}
                />

                {displayedFormError ? <Text className="auth-error">{displayedFormError}</Text> : null}

                <AuthSubmitButton
                    label="Sign in"
                    onPress={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </View>

            <SsoButtons disabled={isSubmitting} />

            <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurrly?</Text>
                <Link href="/(auth)/signup" className="auth-link">
                    Create an account
                </Link>
            </View>
        </AuthLayout>
    )
}

export default SignIn
