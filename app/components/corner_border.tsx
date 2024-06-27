import React from 'react';
import { View, ViewStyle } from 'react-native';

type CornerBorderProps = {
  children: React.ReactNode;

};

const CornerBorder: React.FC<CornerBorderProps> = ({ children }) => {
  return (
    <View style={[{ position: 'relative', width: '100%', height: '100%' }]}>
      <View style={{ position: 'absolute', height: "25%", width: "8%", top: 0, left: 0, borderColor: "#a3a3a3", borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 }}></View>
      <View style={{ position: 'absolute', height: "25%", width: "8%", top: 0, right: 0, borderColor: "#a3a3a3", borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 }}></View>
      <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </View>
      <View style={{ position: 'absolute', height: "25%", width: "8%", bottom: 0, left: 0, borderColor: "#a3a3a3", borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 }}></View>
      <View style={{ position: 'absolute', height: "25%", width: "8%", bottom: 0, right: 0, borderColor: "#a3a3a3", borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 }}></View>
    </View>
  );
};

export default CornerBorder;

