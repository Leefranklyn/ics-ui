import React, { useEffect, useRef } from 'react';

interface ChartProps {
  data: { time: string; value: number }[];
}

export default function TemperatureChart({ data }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data for selected range', width / 2, height / 2);
      return;
    }

    const padX = 40;
    const padY = 30;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;
    
    const maxDataY = Math.max(...data.map(d => d.value), 40);
    const minDataY = Math.min(...data.map(d => d.value), 18) - 2;
    const range = maxDataY - minDataY;

    // Grid lines & labels (Y axis)
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    ctx.font = '10px sans-serif';

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
       const y = padY + chartH - (i / steps) * chartH;
       const val = minDataY + (i / steps) * range;
       
       ctx.beginPath();
       ctx.moveTo(padX, y);
       ctx.lineTo(width - padX, y);
       ctx.stroke();
       
       ctx.fillText(Math.round(val).toString() + '°C', padX - 8, y + 4);
    }

    // Threshold line
    const threshVal = 35;
    if (threshVal >= minDataY && threshVal <= maxDataY) {
      const threshY = padY + chartH - ((threshVal - minDataY) / range) * chartH;
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#ef4444';
      ctx.moveTo(padX, threshY);
      ctx.lineTo(width - padX, threshY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'left';
      ctx.fillText('Alert threshold', width - padX + 5, threshY + 4);
    }
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    
    data.forEach((pt, i) => {
      const x = padX + (i / Math.max(1, data.length - 1)) * chartW;
      const y = padY + chartH - ((pt.value - minDataY) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Title
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'left';
    ctx.font = '12px sans-serif';
    ctx.fillText('Temperature Over Time', padX, 15);

  }, [data]);

  return (
    <div className="w-full overflow-hidden bg-surface border border-border rounded-lg p-4">
      <canvas ref={canvasRef} width={800} height={300} className="w-full h-auto" />
    </div>
  );
}
