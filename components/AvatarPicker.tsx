import { icons } from '@/constants/icons'
import images from '@/constants/images'
import { authErrorMessage, FALLBACK_AUTH_ERROR } from '@/lib/authErrors'
import { useUser } from '@clerk/expo'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Image, TouchableOpacity, View } from 'react-native'

/**
 * Tappable profile photo. Clerk stores the image on the user, so it follows the
 * account rather than the device.
 */
const AvatarPicker = () => {
    const { user } = useUser()
    const [isUploading, setIsUploading] = useState(false)

    const showError = (error: unknown) => {
        Alert.alert('Couldn’t update photo', authErrorMessage(error as { code?: string }) ?? FALLBACK_AUTH_ERROR)
    }

    const pickFromGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert(
                'Photo access needed',
                'Allow Recurrly to access your photos so you can choose a profile picture.',
            )
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            // Square crop, because the avatar renders as a circle.
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
            base64: true,
        })

        if (result.canceled) return

        const asset = result.assets[0]

        if (!asset?.base64) {
            Alert.alert('Couldn’t read that photo', 'Pick a different image and try again.')
            return
        }

        setIsUploading(true)
        try {
            // clerk-js posts a string `file` straight through as an octet-stream
            // body. Passing a Blob would take the browser FormData path, which is
            // unreliable in React Native.
            await user?.setProfileImage({
                file: `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`,
            })
            await user?.reload()
        } catch (error) {
            showError(error)
        } finally {
            setIsUploading(false)
        }
    }

    const removePhoto = async () => {
        setIsUploading(true)
        try {
            await user?.setProfileImage({ file: null })
            await user?.reload()
        } catch (error) {
            showError(error)
        } finally {
            setIsUploading(false)
        }
    }

    const openActionSheet = () => {
        if (isUploading) return

        Alert.alert('Profile photo', undefined, [
            { text: 'Choose from gallery', onPress: pickFromGallery },
            // Nothing to remove until they actually have one.
            ...(user?.hasImage
                ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: removePhoto }]
                : []),
            { text: 'Cancel', style: 'cancel' as const },
        ])
    }

    return (
        <TouchableOpacity
            className="home-avatar-wrap"
            onPress={openActionSheet}
            disabled={isUploading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            accessibilityState={{ busy: isUploading }}
        >
            <Image
                source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                className="home-avatar"
            />

            {isUploading ? (
                <View className="home-avatar-overlay">
                    <ActivityIndicator color="#ffffff" />
                </View>
            ) : null}

            {/* Prompts you to add a photo; once there is one it just covers it up. */}
            {!isUploading && !user?.hasImage ? (
                <View className="home-avatar-badge">
                    <Image source={icons.plus} className="home-avatar-badge-icon" resizeMode="contain" />
                </View>
            ) : null}
        </TouchableOpacity>
    )
}

export default AvatarPicker
