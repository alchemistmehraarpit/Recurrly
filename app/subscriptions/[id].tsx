import { Link, useLocalSearchParams } from 'expo-router';
import { styled } from "nativewind";
import { Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text>Subscription Details: {id}</Text>
            <Link href="/">Go back</Link>
        </SafeAreaView>
    )
}

export default SubscriptionDetails