import { Link } from 'expo-router';
import { styled } from "nativewind";
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>subscriptions</Text>
      <Link href="/" className="mt-4 rounded bg-primary text-white p-4"> Home </Link>
    </SafeAreaView>
  )
}

export default subscriptions