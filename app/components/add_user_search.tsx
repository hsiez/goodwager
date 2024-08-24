import SearchBar from './search_bar';
import { Modal, Pressable, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const AddUserModal = () => {
    const [modalAddFriendVisible, setModalAddFriendVisible] = useState(false);
    return (
        <View className="flex-row w-fill h-full">
            <Pressable onPress={async ()=>{setModalAddFriendVisible(true)}} className='flex-row'>
                <Ionicons name="search" size={20} color="#e5e5e5" />
            </Pressable>
            
            {/* Confirmation modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalAddFriendVisible}
                onRequestClose={() => setModalAddFriendVisible(false)}>
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, .95)'}}>
                    <KeyboardAvoidingView  style={{ 
                        flex: .5,
                        width: '90%',
                        height: '40%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 15, // Optional: for rounded corners
                        shadowColor: "#050505", // Optional: for shadow
                        shadowOffset: {
                            width: 2,
                            height: 2
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,

                    }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                    <View className="flex-col w-full h-full justify-center items-center space-y-1">
                        <SearchBar />
                        <View className="flex-row w-full h-1/5 justify-end items-center">
                            <Pressable onPress={() => setModalAddFriendVisible(false)} className='flex-row  justify-center items-center px-2 py-2 rounded-md'>
                                <Text style={{fontSize: 12}} className="text-neutral-400 font-semibold">Done</Text>
                            </Pressable>
                        </View>
                    </View>
                    </KeyboardAvoidingView >

                </View>
            </Modal>
        </View>
    );
}

export default AddUserModal;