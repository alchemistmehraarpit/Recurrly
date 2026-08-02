import AuthField from '@/components/AuthField'
import AuthLayout from '@/components/AuthLayout'
import AuthSubmitButton from '@/components/AuthSubmitButton'
import SsoButtons from '@/components/SsoButtons'
import { authErrorMessage, globalAuthErrorMessage } from '@/lib/authErrors'
import { MIN_PASSWORD_LENGTH, validateCode, validateEmail, validateName, validatePassword } from '@/lib/validation'
import { useAuth, useSignUp } from '@clerk/expo'
import { Link } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

const RESEND_COOLDOWN_SECONDS = 30

const SignUp = () => {
    const { signUp, errors, fetchStatus } = useSignUp()
    const { isSignedIn } = useAuth()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')

    const [fieldErrors, setFieldErrors] = useState<{
        firstName: string | null
        lastName: string | null
        email: string | null
        password: string | null
        code: string | null
    }>({ firstName: null, lastName: null, email: null, password: null, code: null })
    const [formError, setFormError] = useState<string | null>(null)

    // Server-side errors are stale the moment the user starts correcting them,
    // so we only surface them between a submit and the next keystroke.
    const [showServerErrors, setShowServerErrors] = useState(false)
    const [resendIn, setResendIn] = useState(0)

    const lastNameRef = useRef<TextInput>(null)
    const emailRef = useRef<TextInput>(null)
    const passwordRef = useRef<TextInput>(null)
    const isSubmitting = fetchStatus === 'fetching'

    useEffect(() => {
        if (resendIn <= 0) return
        const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendIn])

    const onFieldChange = (setter: (value: string) => void, key: 'firstName' | 'lastName' | 'email' | 'password' | 'code', validator: (value: string) => string | null) =>
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

    const sendCode = async () => {
        const { error } = await signUp.verifications.sendEmailCode()
        setShowServerErrors(true)

        if (error) {
            setFormError(authErrorMessage(error))
            return
        }

        setResendIn(RESEND_COOLDOWN_SECONDS)
    }

    const handleSubmit = async () => {
        const firstNameError = validateName(firstName, 'first name')
        const lastNameError = validateName(lastName, 'last name')
        const emailError = validateEmail(emailAddress)
        const passwordError = validatePassword(password, { isSignUp: true })

        setFieldErrors({
            firstName: firstNameError,
            lastName: lastNameError,
            email: emailError,
            password: passwordError,
            code: null,
        })
        setFormError(null)

        if (firstNameError || lastNameError || emailError || passwordError) return

        const { error } = await signUp.password({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            emailAddress: emailAddress.trim(),
            password,
        })

        setShowServerErrors(true)

        if (error) {
            setFormError(authErrorMessage(error))
            return
        }

        await sendCode()
    }

    const handleVerify = async () => {
        const codeError = validateCode(code)
        setFieldErrors((current) => ({ ...current, code: codeError }))
        setFormError(null)

        if (codeError) return

        const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() })
        setShowServerErrors(true)

        if (error) {
            setFormError(authErrorMessage(error))
            return
        }

        if (signUp.status === 'complete') {
            // The route guard in the root layout takes it from here.
            await signUp.finalize()
        }
    }

    const startOver = async () => {
        await signUp.reset()
        setCode('')
        setFieldErrors({ firstName: null, lastName: null, email: null, password: null, code: null })
        setFormError(null)
        setShowServerErrors(false)
        setResendIn(0)
    }

    const serverError = (fieldError: { code: string } | null | undefined) =>
        showServerErrors ? authErrorMessage(fieldError) : null

    const displayedFormError =
        formError ?? (showServerErrors ? globalAuthErrorMessage(errors.global) : null)

    if (signUp.status === 'complete' || isSignedIn) return null

    const needsEmailVerification =
        signUp.status === 'missing_requirements' &&
        signUp.unverifiedFields.includes('email_address') &&
        signUp.missingFields.length === 0

    if (needsEmailVerification) {
        return (
            <AuthLayout
                title="Check your email"
                subtitle={`We sent a 6-digit code to ${emailAddress.trim() || 'your inbox'}. Enter it below to finish setting up.`}
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
                        label="Verify email"
                        onPress={handleVerify}
                        isSubmitting={isSubmitting}
                    />

                    <TouchableOpacity
                        className="auth-secondary-button"
                        onPress={sendCode}
                        disabled={isSubmitting || resendIn > 0}
                        accessibilityRole="button"
                    >
                        <Text className="auth-secondary-button-text">
                            {resendIn > 0 ? `Send a new code in ${resendIn}s` : 'Send a new code'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="auth-link-row">
                    <Text className="auth-link-copy">Wrong email?</Text>
                    <TouchableOpacity onPress={startOver} accessibilityRole="button">
                        <Text className="auth-link">Start over</Text>
                    </TouchableOpacity>
                </View>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start tracking every subscription in one place"
        >
            <View className="auth-form">
                <AuthField
                    label="First name"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChangeText={onFieldChange(setFirstName, 'firstName', (value) =>
                        validateName(value, 'first name'),
                    )}
                    error={fieldErrors.firstName ?? serverError(errors.fields.firstName)}
                    autoCapitalize="words"
                    textContentType="givenName"
                    autoComplete="given-name"
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    submitBehavior="submit"
                />

                <AuthField
                    ref={lastNameRef}
                    label="Last name"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChangeText={onFieldChange(setLastName, 'lastName', (value) =>
                        validateName(value, 'last name'),
                    )}
                    error={fieldErrors.lastName ?? serverError(errors.fields.lastName)}
                    autoCapitalize="words"
                    textContentType="familyName"
                    autoComplete="family-name"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    submitBehavior="submit"
                />

                <AuthField
                    ref={emailRef}
                    label="Email"
                    placeholder="Enter your email"
                    value={emailAddress}
                    onChangeText={onFieldChange(setEmailAddress, 'email', validateEmail)}
                    error={fieldErrors.email ?? serverError(errors.fields.emailAddress)}
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
                    placeholder="Create a password"
                    value={password}
                    onChangeText={onFieldChange(setPassword, 'password', (value) =>
                        validatePassword(value, { isSignUp: true }),
                    )}
                    error={fieldErrors.password ?? serverError(errors.fields.password)}
                    isPassword
                    textContentType="newPassword"
                    autoComplete="new-password"
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit}
                />

                <Text className="auth-helper">At least {MIN_PASSWORD_LENGTH} characters.</Text>

                {displayedFormError ? <Text className="auth-error">{displayedFormError}</Text> : null}

                <AuthSubmitButton
                    label="Create account"
                    onPress={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </View>

            <SsoButtons disabled={isSubmitting} />

            <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/signin" className="auth-link">
                    Sign in
                </Link>
            </View>

            {/* Required for sign-up on Expo web; Clerk skips it on iOS and Android. */}
            <View nativeID="clerk-captcha" />
        </AuthLayout>
    )
}

export default SignUp
