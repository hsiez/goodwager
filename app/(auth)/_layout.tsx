import { Tabs, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

export const LogoutButton = () => {
  const { signOut } = useAuth();

  const doLogout = () => {
    signOut();
  };

  return (
    <Pressable onPress={doLogout} style={{ marginRight: 10 }}>
      <Ionicons name="log-out-outline" size={24} color={'#fff'} />
    </Pressable>
  );
};


const TabsPage = () => {
  const { isSignedIn } = useAuth();
  const segmen = useSegments();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "rgb(23, 23, 23)", borderTopColor: "rgb(163 163 163)" },
      }}>
      <Tabs.Screen
        name="wager"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          tabBarLabel: 'Home',
        }}
        redirect={!isSignedIn}

      />
          

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
          tabBarLabel: 'My Profile',
          headerRight: () => <LogoutButton />,
        }}
        redirect={!isSignedIn}
      />
    </Tabs>
  );
};

export default TabsPage;
