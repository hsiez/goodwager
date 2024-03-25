import { Tabs, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';

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
    <>
    <StatusBar style="light" />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#090909" },
        tabBarActiveTintColor: 'rgb(212 212 212)',
        tabBarInactiveTintColor: 'rgb(115 115 115)',
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

      <Tabs.Screen
        name="followers"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          tabBarLabel: 'Friends',
          headerShown: false,
          headerStyle: {
            backgroundColor: "#090909", // Correct property for background color
            borderColor: "#090909",
          },
          headerTintColor: '#fff'
        }}
        redirect={!isSignedIn}
      />
    </Tabs>
    </>
  );
};

export default TabsPage;
