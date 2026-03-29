const React = require('react');

const View = ({ children, style, testID, ...props }) =>
    React.createElement('View', { style, 'data-testid': testID, ...props }, children);

const Text = ({ children, style, testID, ...props }) =>
    React.createElement('Text', { style, 'data-testid': testID, ...props }, children);

const TouchableOpacity = ({ children, onPress, disabled, style, testID, ...props }) =>
    React.createElement('TouchableOpacity', { onClick: disabled ? undefined : onPress, 'data-testid': testID, style, ...props }, children);

const Button = ({ title, onPress, disabled, testID, ...props }) =>
    React.createElement('TouchableOpacity', { onClick: disabled ? undefined : onPress, testID, ...props },
        React.createElement('Text', {}, title)
    );

const TextInput = ({ value, onChangeText, placeholder, style, testID, ...props }) =>
    React.createElement('input', {
        value,
        onChange: (e) => onChangeText && onChangeText(e.target.value),
        placeholder,
        style,
        testID,
        ...props,
    });

const ScrollView = ({ children, contentContainerStyle, style, testID, ...props }) =>
    React.createElement('div', { style: contentContainerStyle || style, testID, ...props }, children);

const ActivityIndicator = ({ size, color, style, testID, ...props }) =>
    React.createElement('View', { testID: testID || 'activity-indicator', style, ...props });

function Modal({ children, visible, ...props }) {
    if (!visible) return null;
    return React.createElement('div', { 'data-testid': 'modal', ...props }, children);
}

const LogBox = {
    ignoreAllLogs: () => {},
};

const StyleSheet = {
    create: (styles) => styles,
};

const Platform = {
    OS: 'web',
    select: (specifics) => specifics.web || specifics.default,
};

module.exports = {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Button,
    ScrollView,
    ActivityIndicator,
    Modal,
    StyleSheet,
    Platform,
    LogBox,
};
