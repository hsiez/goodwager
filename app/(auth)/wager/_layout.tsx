import { Stack } from 'expo-router';


const WagerStack = () => {
    return (
        <Stack
        screenOptions={{
            headerShown: true,
            headerStyle: {
                backgroundColor: "rgb(23, 23, 23)", // Correct property for background color
                
            },
            headerBackTitleVisible: false,
            headerTintColor: '#fff'
        }}>
        
            <Stack.Screen
            name="current_wager"
            options={{
                headerTitle: 'Wager',
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