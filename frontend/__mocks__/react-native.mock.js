const React = require('react');

const View = ({ children, style, testID, ...props }) =>
    React.createElement('View', { style, testID, ...props }, children);

const Text = ({ children, style, testID, ...props }) =>
    React.createElement('Text', { style, testID, ...props }, children);

const TouchableOpacity = ({ children, onPress, disabled, style, testID, ...props }) =>
    React.createElement('TouchableOpacity', { onClick: disabled ? undefined : onPress, testID, style, ...props }, children);

const Button = ({ title, onPress, disabled, testID, ...props }) =>
    React.createElement('TouchableOpacity', { onClick: disabled ? undefined : onPress, testID, ...props },
        React.createElement('Text', {}, title)
    );

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
    TouchableOpacity,
    Button,
    StyleSheet,
    Platform,
};
