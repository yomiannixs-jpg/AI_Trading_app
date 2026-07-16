class TechnicalIndicators {
    calculateSMA(data, period) {
        const sma = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push({ index: i, value: sum / period });
        }
        return sma;
    }

    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        let sum = data.slice(0, period).reduce((a, b) => a + b, 0);
        ema.push({ index: period - 1, value: sum / period });
        
        for (let i = period; i < data.length; i++) {
            const value = (data[i] - ema[ema.length - 1].value) * multiplier + ema[ema.length - 1].value;
            ema.push({ index: i, value });
        }
        
        return ema;
    }

    calculateMACD(data) {
        const ema12 = this.calculateEMA(data, 12);
        const ema26 = this.calculateEMA(data, 26);
        const macdLine = [];
        const signalLine = [];
        
        for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
            macdLine.push({
                index: ema12[i].index,
                value: ema12[i].value - ema26[i].value
            });
        }
        
        const macdValues = macdLine.map(m => m.value);
        signalLine.push(...this.calculateEMA(macdValues, 9));
        
        const histogram = macdLine.map((m, i) => ({
            index: m.index,
            value: m.value - (signalLine[i] ? signalLine[i].value : 0)
        }));
        
        return { macdLine, signalLine, histogram };
    }

    calculateRSI(data, period) {
        const rsi = [];
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const difference = data[i] - data[i - 1];
            if (difference >= 0) gains += difference;
            else losses -= difference;
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgGain / (avgLoss || 1);
        rsi.push({ index: period, value: 100 - (100 / (1 + rs)) });
        
        for (let i = period + 1; i < data.length; i++) {
            const difference = data[i] - data[i - 1];
            let currentGain = difference >= 0 ? difference : 0;
            let currentLoss = difference < 0 ? -difference : 0;
            
            avgGain = (avgGain * (period - 1) + currentGain) / period;
            avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
            
            rs = avgGain / (avgLoss || 1);
            rsi.push({ index: i, value: 100 - (100 / (1 + rs)) });
        }
        
        return rsi;
    }

    calculateBollingerBands(data, period, stdDev) {
        const bands = [];
        const sma = this.calculateSMA(data, period);
        
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const mean = sma.find(s => s.index === i)?.value || 0;
            const squaredDiffs = slice.map(x => Math.pow(x - mean, 2));
            const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
            const standardDeviation = Math.sqrt(variance);
            
            bands.push({
                index: i,
                upper: mean + (stdDev * standardDeviation),
                middle: mean,
                lower: mean - (stdDev * standardDeviation)
            });
        }
        
        return bands;
    }

    calculateFibonacciLevels(highs, lows) {
        const highest = Math.max(...highs);
        const lowest = Math.min(...lows);
        const diff = highest - lowest;
        
        return {
            level0: highest,
            level236: highest - diff * 0.236,
            level382: highest - diff * 0.382,
            level500: highest - diff * 0.5,
            level618: highest - diff * 0.618,
            level786: highest - diff * 0.786,
            level1000: lowest
        };
    }

    calculateVolumeProfile(data) {
        const priceLevels = {};
        const priceStep = 10;
        
        data.forEach(candle => {
            const priceLevel = Math.floor(candle.close / priceStep) * priceStep;
            if (!priceLevels[priceLevel]) {
                priceLevels[priceLevel] = 0;
            }
            priceLevels[priceLevel] += candle.volume;
        });
        
        return Object.entries(priceLevels).map(([price, volume]) => ({
            price: parseFloat(price),
            volume
        }));
    }

    findSupportResistance(highs, lows, closes) {
        const levels = [];
        const tolerance = 0.02;
        
        for (let i = 2; i < closes.length - 2; i++) {
            if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && 
                highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
                levels.push({
                    price: highs[i],
                    type: 'resistance',
                    strength: this.calculateLevelStrength(highs, i, tolerance)
                });
            }
            
            if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && 
                lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
                levels.push({
                    price: lows[i],
                    type: 'support',
                    strength: this.calculateLevelStrength(lows, i, tolerance)
                });
            }
        }
        
        return levels.sort((a, b) => b.strength - a.strength).slice(0, 10);
    }

    calculateLevelStrength(data, index, tolerance) {
        let touches = 1;
        const price = data[index];
        
        for (let i = 0; i < data.length; i++) {
            if (i === index) continue;
            const diff = Math.abs(data[i] - price) / price;
            if (diff <= tolerance) touches++;
        }
        
        return touches;
    }
}

module.exports = TechnicalIndicators;