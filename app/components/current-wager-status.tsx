import React, { useContext, useState } from 'react';
import { Text, View } from 'react-native';
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
        <View className='flex w-2/3 h-fit justify-center items-center pt-6 pb-6 border-solid border-2 border-zinc-700 rounded-md'>
            <Text className='text-6xl text-gray-100 text-center'>{wager !== null ? `$${wager.amount}` : '$0'}</Text>
            <Text className='text-lg text-gray-500 text-center'>{wager !== null ? `${wager.charity_name}` : "No active wager"}</Text>

            <View className='flex w-full justify-center mt-10'>
                <Text className='text-2xl text-gray-100 text-center'>Status:</Text>
                <View className='flex items-center mt-2'>
                    <View className={`w-12 h-12 rounded-full bg-green-500`}></View>
                </View>
            </View>
        </View>
    );
};

export default CurrentWager;
