import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Chart = ({
  type = 'line',
  data,
  options = {},
  className = '',
  height = 400,
}) => {
  const chartRef = useRef(null);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const chartOptions = {
    ...defaultOptions,
    ...options,
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={data} options={chartOptions} />;
      case 'bar':
        return <Bar ref={chartRef} data={data} options={chartOptions} />;
      case 'pie':
        return <Pie ref={chartRef} data={data} options={chartOptions} />;
      default:
        return <Line ref={chartRef} data={data} options={chartOptions} />;
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {renderChart()}
    </div>
  );
};

export default Chart; 