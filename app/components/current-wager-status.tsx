import React, { useContext, useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import HealthKitContext from './HealthkitContext';

type CurrentWagerProps = {
    wager: {
        wager_id: string;
        id: number;
        userId: string;
        amount: number;
        charity_name: string;
        start_date: string;
        end_date: string;
        token: string;
        status: string;
        ongoing: boolean;
    } | null;
};

const CurrentWager: React.FC<CurrentWagerProps> = ({ wager }) => {
    let status = wager !== null ? wager.status : 'noWager';
    let statusColor = 'black';
    let statusText = 'No Wager';

    switch (status) {
        case 'live':
            statusColor = 'green';
            statusText = 'Live';
            break;
        case 'inProgress':
            statusColor = 'orange';
            statusText = 'In Progress';
            break;
        case 'lost':
            statusColor = 'red';
            statusText = 'Lost';
            break;
        case 'noWager':
            statusColor = 'black';
            statusText = 'No Wager';
            break;
        default:
            break;
    }

    return (
        <View className="flex-col w-full justify-between items-start">
            <View className="flex-row w-full mb-2 justify-between items-center">
                <Text className="text-2xl text-white text-center">Today's Status</Text>
                <View className='h-8 w-8 rounded-full border-2 border-neutral-500' />
            </View>
            <View className='flex-col items-start w-full'>
                <Text className="text-md text-white">No workout detected</Text>
                <Pressable className='flex w-28 h-6 items-start'>
                    <Text className='text-rose-500 font-bold text-sm text-center'>Use Rest Day</Text>
                </Pressable>
            </View>         
        </View>
    );
};

export default CurrentWager;
