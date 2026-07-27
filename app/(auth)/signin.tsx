import { Link } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

const signin = () => {
    return (
        <View>
            <Text>Sign In</Text>
            <Link href="/(auth)/signup">Create Account</Link>
        </View>
    )
}

export default signin