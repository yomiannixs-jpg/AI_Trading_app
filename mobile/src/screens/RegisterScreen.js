import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep1 = () => {
        const { firstName, lastName, email, phone } = formData;
        if (!firstName || !lastName || !email || !phone) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const { password, confirmPassword } = formData;
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
            return;
        }

        if (step === 2 && !validateStep2()) {
            return;
        }

        setLoading(true);
        try {
            await register(formData);
        } catch (error) {
            Alert.alert('Error', error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Icon name="account-plus" size={60} color="#2196F3" />
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join our trading community</Text>
                    
                    <View style={styles.stepIndicator}>
                        <View style={[styles.step, step >= 1 && styles.activeStep]}>
                            <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>1</Text>
                            <Text style={styles.stepLabel}>Info</Text>
                        </View>
                        <View style={styles.stepLine} />
                        <View style={[styles.step, step >= 2 && styles.activeStep]}>
                            <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>2</Text>
                            <Text style={styles.stepLabel}>Security</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.form}>
                    {step === 1 ? (
                        <>
                            <View style={styles.row}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChangeText={(text) => updateField('firstName', text)}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                <View style={[styles.inputContainer, { flex: 1 }]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChangeText={(text) => updateField('lastName', text)}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChangeText={(text) => updateField('email', text)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChangeText={(text) => updateField('phone', text)}
                                    keyboardType="phone-pad"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChangeText={(text) => updateField('password', text)}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => updateField('confirmPassword', text)}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </>
                    )}

                    <View style={styles.buttonRow}>
                        {step === 2 && (
                            <TouchableOpacity 
                                style={[styles.button, styles.backButton]}
                                onPress={() => setStep(1)}
                            >
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Processing...' : step === 1 ? 'Continue' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.signInText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a2e' },
    scrollContent: { flexGrow: 1, padding: 20 },
    header: { alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 10 },
    subtitle: { fontSize: 14, color: '#999', marginTop: 5 },
    stepIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    step: { alignItems: 'center' },
    stepNumber: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#2b2b43', color: '#999',
        textAlign: 'center', lineHeight: 30, fontWeight: 'bold'
    },
    activeStep: {},
    activeStepNumber: { backgroundColor: '#2196F3', color: '#fff' },
    stepLabel: { color: '#999', fontSize: 12, marginTop: 5 },
    stepLine: { width: 40, height: 2, backgroundColor: '#2b2b43', marginHorizontal: 10 },
    form: { backgroundColor: '#16213e', borderRadius: 20, padding: 25 },
    row: { flexDirection: 'row' },
    inputContainer: {
        backgroundColor: '#1a1a2e', borderRadius: 12,
        paddingHorizontal: 15, marginBottom: 15,
        borderWidth: 1, borderColor: '#2b2b43',
        flexDirection: 'row', alignItems: 'center'
    },
    input: { flex: 1, paddingVertical: 15, color: '#fff', fontSize: 16 },
    buttonRow: { flexDirection: 'row', gap: 10 },
    button: {
        flex: 1, backgroundColor: '#2196F3', borderRadius: 12,
        padding: 16, alignItems: 'center'
    },
    backButton: { backgroundColor: '#2b2b43' },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#999', fontSize: 14 },
    signInText: { color: '#2196F3', fontSize: 14, fontWeight: 'bold' },
});

export default RegisterScreen;