import { Stack } from 'expo-router';


const WagerStack = () => {
    return (
        <Stack
        screenOptions={{
            headerShown: false,
            headerStyle: {
                backgroundColor: "rgb(212 212 212)", // Correct property for background color
                
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
                title: 'Create Wager',
            headerShown: true,
            headerStyle: {
                backgroundColor: "#0D0D0D", // Correct property for background color
                
            },
            }}/>
        </Stack>
    )

}

export default WagerStack;