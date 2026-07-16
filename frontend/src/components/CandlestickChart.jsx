import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const CandlestickChart = ({ candles, height = 470 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !candles?.length) return undefined;
    const chart = createChart(containerRef.current, {
      height,
      width: containerRef.current.clientWidth,
      layout: { background: { type: ColorType.Solid, color: '#0f172a' }, textColor: '#cbd5e1' },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      rightPriceScale: { borderColor: '#334155' },
      timeScale: { borderColor: '#334155', timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: '#64748b' }, horzLine: { color: '#64748b' } }
    });
    const series = chart.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#22c55e', wickDownColor: '#ef4444'
    });
    series.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
    chart.timeScale().fitContent();
    const resize = () => chart.applyOptions({ width: containerRef.current?.clientWidth || 700 });
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); chart.remove(); };
  }, [candles, height]);

  return <div className="candlestick-chart" ref={containerRef} />;
};
export default CandlestickChart;
