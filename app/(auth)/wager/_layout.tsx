import { Stack } from 'expo-router';


const WagerStack = () => {
    return (
        <Stack
        screenOptions={{
            headerShown: true,
            headerStyle: {
                backgroundColor: "#080808", // Correct property for background color
                
            },
            headerBackTitleVisible: false,
            headerTintColor: '#fff'
        }}>
        
            <Stack.Screen
            name="current_wager"
            options={{
                headerTitle: 'goodwager',
            }}/>
            
            <Stack.Screen
            name="create"
            options={{
                title: 'Create Wager'
            }}/>
        </Stack>
    )

}

export default WagerStack;