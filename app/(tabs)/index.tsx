import AvatarPicker from "@/components/AvatarPicker";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
  const { user } = useUser()

  return (
    <SafeAreaView className="flex-1 bg-background p-5">

      <View className="home-header">
        <View className="home-user">
          <AvatarPicker />
          <Text className="home-user-name">{user?.firstName ?? user?.fullName ?? 'there'}</Text>
        </View>

        <Image source={icons.add} className="home-add-icon" />
      </View>

      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <Text className="home-balance-amount">
                {formatCurrency(HOME_BALANCE.amount)}
              </Text>
              <Text className="home-balance-date">
                {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
              </Text>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (<UpcomingSubscriptionCard {...item} />)}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
              />
            </View>

            <ListHeading title="All Subscriptions" />

          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => setExpandedSubscriptionId((currentId) =>
              (currentId === item.id ? null : item.id))}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
        contentContainerClassName="pb-30"
      />

    </SafeAreaView>
  );
}