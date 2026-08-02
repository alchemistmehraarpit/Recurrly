import '@/global.css';
import { Stack } from "expo-router";

// `(auth)` has no index route, so name the screen the guard should fall back to
// when a signed-out user lands on `/`.
export const unstable_settings = {
    anchor: 'signin',
};

export default function AuthLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
