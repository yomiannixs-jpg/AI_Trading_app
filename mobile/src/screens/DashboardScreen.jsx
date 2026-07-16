import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import {
    Text,
    Card,
    Title,
    Paragraph,
    Button,
    FAB,
    Searchbar,
    Chip,
    Avatar,
    Badge
} from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [marketData, setMarketData] = useState({
        stocks: [],
        forex: [],
        portfolio: null
    });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMarketData = useCallback(async () => {
        try {
            const response = await axios.get('/api/trading/market-overview', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setMarketData(response.data);
        } catch (error) {
            console.error('Error fetching market data:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchMarketData();
    }, [fetchMarketData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchMarketData();
        setRefreshing(false);
    }, [fetchMarketData]);

    const topGainers = marketData.stocks
        ?.filter(stock => stock.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, 5) || [];

    const topLosers = marketData.stocks
        ?.filter(stock => stock.change < 0)
        .sort((a, b) => a.change - b.change)
        .slice(0, 5) || [];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Hello, {user?.firstName} 👋
                    </Text>
                    <Text style={styles.subtitle}>
                        Welcome back to your trading dashboard
                    </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Avatar.Text 
                        size={40} 
                        label={user?.firstName?.[0]} 
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Portfolio Overview */}
                <Card style={styles.portfolioCard}>
                    <Card.Content>
                        <View style={styles.portfolioHeader}>
                            <Title>Portfolio Value</Title>
                            <Chip icon="eye" onPress={() => {}}>Show</Chip>
                        </View>
                        <Text style={styles.portfolioValue}>
                            ₦{marketData.portfolio?.totalValue?.toFixed(2) || '0.00'}
                        </Text>
                        <View style={styles.portfolioChange}>
                            <Icon 
                                name={marketData.portfolio?.change >= 0 ? 'arrow-up' : 'arrow-down'} 
                                size={20} 
                                color={marketData.portfolio?.change >= 0 ? '#26a69a' : '#ef5350'} 
                            />
                            <Text style={[
                                styles.changeText,
                                { color: marketData.portfolio?.change >= 0 ? '#26a69a' : '#ef5350' }
                            ]}>
                                {marketData.portfolio?.change || 0}% Today
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Trading')}
                    >
                        <Icon name="bank-transfer" size={24} color="#2196F3" />
                        <Text style={styles.actionText}>Deposit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Trading')}
                    >
                        <Icon name="cash" size={24} color="#4CAF50" />
                        <Text style={styles.actionText}>Withdraw</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Trading', { action: 'buy' })}
                    >
                        <Icon name="cart" size={24} color="#FF9800" />
                        <Text style={styles.actionText}>Buy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Trading', { action: 'sell' })}
                    >
                        <Icon name="tag" size={24} color="#F44336" />
                        <Text style={styles.actionText}>Sell</Text>
                    </TouchableOpacity>
                </View>

                {/* Market Overview Chart */}
                <Card style={styles.chartCard}>
                    <Card.Content>
                        <Title>Market Overview</Title>
                        <LineChart
                            data={{
                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                                datasets: [{
                                    data: [
                                        Math.random() * 100,
                                        Math.random() * 100,
                                        Math.random() * 100,
                                        Math.random() * 100,
                                        Math.random() * 100
                                    ]
                                }]
                            }}
                            width={width - 60}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#1a1a2e',
                                backgroundGradientFrom: '#1a1a2e',
                                backgroundGradientTo: '#16213e',
                                decimalCount: 2,
                                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                }
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </Card.Content>
                </Card>

                {/* Top Gainers */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Title>Top Gainers 🚀</Title>
                            <Button mode="text" onPress={() => {}}>See All</Button>
                        </View>
                        {topGainers.map((stock, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.marketItem}
                                onPress={() => navigation.navigate('Chart', { symbol: stock.symbol })}
                            >
                                <View style={styles.marketInfo}>
                                    <Text style={styles.symbol}>{stock.symbol}</Text>
                                    <Text style={styles.companyName}>{stock.name}</Text>
                                </View>
                                <View style={styles.priceInfo}>
                                    <Text style={styles.price}>₦{stock.price}</Text>
                                    <Chip 
                                        style={[styles.changeChip, { backgroundColor: '#26a69a' }]}
                                        textStyle={styles.chipText}
                                    >
                                        +{stock.change}%
                                    </Chip>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </Card.Content>
                </Card>

                {/* Top Losers */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Title>Top Losers 📉</Title>
                            <Button mode="text" onPress={() => {}}>See All</Button>
                        </View>
                        {topLosers.map((stock, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.marketItem}
                                onPress={() => navigation.navigate('Chart', { symbol: stock.symbol })}
                            >
                                <View style={styles.marketInfo}>
                                    <Text style={styles.symbol}>{stock.symbol}</Text>
                                    <Text style={styles.companyName}>{stock.name}</Text>
                                </View>
                                <View style={styles.priceInfo}>
                                    <Text style={styles.price}>₦{stock.price}</Text>
                                    <Chip 
                                        style={[styles.changeChip, { backgroundColor: '#ef5350' }]}
                                        textStyle={styles.chipText}
                                    >
                                        {stock.change}%
                                    </Chip>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </Card.Content>
                </Card>

                {/* AI Recommendations */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Title>AI Recommendations 🤖</Title>
                            <Badge size={20}>3</Badge>
                        </View>
                        <View style={styles.recommendationItem}>
                            <Icon name="lightbulb-on" size={24} color="#FFD700" />
                            <View style={styles.recommendationContent}>
                                <Text style={styles.recommendationTitle}>Buy Signal: DANGCEM</Text>
                                <Text style={styles.recommendationText}>
                                    Strong bullish pattern detected with 85% confidence
                                </Text>
                            </View>
                        </View>
                        <View style={styles.recommendationItem}>
                            <Icon name="alert" size={24} color="#FF9800" />
                            <View style={styles.recommendationContent}>
                                <Text style={styles.recommendationTitle}>Sell Signal: MTNN</Text>
                                <Text style={styles.recommendationText}>
                                    Bearish divergence on RSI, consider taking profits
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Social Feed Preview */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Title>Community Insights 💬</Title>
                            <Button 
                                mode="text" 
                                onPress={() => navigation.navigate('Social')}
                            >
                                View All
                            </Button>
                        </View>
                        <View style={styles.socialItem}>
                            <Avatar.Text size={30} label="JD" />
                            <View style={styles.socialContent}>
                                <Text style={styles.socialTitle}>
                                    John Doe just bought ZENITHBANK
                                </Text>
                                <Text style={styles.socialText}>
                                    "Strong fundamentals, buying the dip"
                                </Text>
                            </View>
                            <Text style={styles.socialTime}>2m ago</Text>
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>

            {/* FAB for Quick Trade */}
            <FAB
                style={styles.fab}
                icon="chart-line"
                label="Trade Now"
                onPress={() => navigation.navigate('Trading')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#2196F3',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5,
    },
    avatar: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    portfolioCard: {
        margin: 15,
        elevation: 4,
    },
    portfolioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    portfolioValue: {
        fontSize: 36,
        fontWeight: 'bold',
        marginTop: 10,
    },
    portfolioChange: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    changeText: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionText: {
        marginTop: 5,
        fontSize: 12,
    },
    chartCard: {
        margin: 15,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    sectionCard: {
        margin: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    marketItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    marketInfo: {
        flex: 1,
    },
    symbol: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    companyName: {
        fontSize: 12,
        color: '#666',
    },
    priceInfo: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    changeChip: {
        height: 25,
    },
    chipText: {
        color: 'white',
        fontSize: 12,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    recommendationContent: {
        marginLeft: 10,
        flex: 1,
    },
    recommendationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    recommendationText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    socialItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    socialContent: {
        marginLeft: 10,
        flex: 1,
    },
    socialTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    socialText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    socialTime: {
        fontSize: 10,
        color: '#999',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#2196F3',
    },
});

export default DashboardScreen;