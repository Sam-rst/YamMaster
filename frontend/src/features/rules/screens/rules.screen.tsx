import React from 'react';
import { View, StyleSheet } from 'react-native';
import RulesContent from '../components/rules-content/rules-content.component';
import { colors } from '@/shared/theme/colors';

const RulesScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <RulesContent />
        </View>
    );
};

export default RulesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
