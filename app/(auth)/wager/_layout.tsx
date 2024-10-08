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
                title: '',
                headerShown: true,
                headerStyle: {
                    backgroundColor: "#090909", // Correct property for background color
                },
                headerBackTitle: 'Cancel',
            }}/>

            <Stack.Screen
            name="donation_proof"
            options={{
                headerShown: true,

                title: '',
                headerStyle: {
                    backgroundColor: "#090909", // Correct property for background color
                },
                headerBackTitle: 'Cancel',
            }}/>
        </Stack>
    )

}

export default WagerStack;