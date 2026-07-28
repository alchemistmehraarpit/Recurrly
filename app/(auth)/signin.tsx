import { Link } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

const signin = () => {
    return (
        <View>
            <Text>Sign In</Text>
            <Link href="/(auth)/signup">Create Account</Link>
            <Link href="/" className="mt-4 rounded bg-primary text-white p-4"> Home </Link>
        </View>
    )
}

export default signin