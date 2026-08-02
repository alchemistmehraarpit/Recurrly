import type { ImageSourcePropType, TextInputProps } from "react-native";
import type { ReactNode } from "react";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        renewalDate?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> { }

    interface ListHeadingProps {
        title: string;
    }

    interface AuthLayoutProps {
        title: string;
        subtitle: string;
        children: ReactNode;
    }

    interface AuthFieldProps extends TextInputProps {
        label: string;
        error?: string | null;
        /** Renders a Show/Hide toggle and masks the value by default. */
        isPassword?: boolean;
    }

    interface AuthSubmitButtonProps {
        label: string;
        onPress: () => void;
        disabled?: boolean;
        isSubmitting?: boolean;
    }

    interface SsoButtonsProps {
        /** Disables the providers while an email/password submit is in flight. */
        disabled?: boolean;
    }
}

export { };
