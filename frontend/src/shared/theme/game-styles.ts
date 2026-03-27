import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { fontDisplay, fontSans } from './fonts';

export const DICE_SIZE_PLAYER = 52;
export const DICE_SIZE_OPPONENT = 36;
export const DICE_BORDER_RADIUS = 10;

export const diceStyles = StyleSheet.create({
    player: {
        width: DICE_SIZE_PLAYER,
        height: DICE_SIZE_PLAYER,
        backgroundColor: colors.white,
        borderRadius: DICE_BORDER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    opponent: {
        width: DICE_SIZE_OPPONENT,
        height: DICE_SIZE_OPPONENT,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    locked: {
        borderWidth: 3,
        borderColor: colors.gold,
    },
});

export const gridCellStyles = StyleSheet.create({
    base: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.glass,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    playerOwned: {
        backgroundColor: colors.cellPlayerOwned,
        borderColor: colors.cellPlayerOwnedBorder,
    },
    opponentOwned: {
        backgroundColor: colors.cellOpponentOwned,
        borderColor: colors.cellOpponentOwnedBorder,
    },
    highlight: {
        backgroundColor: colors.cellHighlight,
        borderColor: colors.cellHighlightBorder,
    },
    predatorTarget: {
        backgroundColor: colors.cellPredatorTarget,
        borderColor: colors.primary,
        borderWidth: 2,
    },
});

export const tokenStyles = StyleSheet.create({
    player: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.playerToken,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    opponent: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.opponentToken,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});

export const scoreTextStyles = StyleSheet.create({
    label: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    value: {
        fontFamily: fontDisplay,
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
    },
});
