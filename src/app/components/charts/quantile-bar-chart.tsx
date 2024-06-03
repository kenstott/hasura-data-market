import React from 'react';
import {BarChart} from '@mui/x-charts';
import {Decile, Quartile} from "./profile-types";


export interface QuantileBarChartProps {
    data: Record<Decile, number> | Record<Quartile, number>
}

export const QuantileBarChart: React.FC<QuantileBarChartProps> = ({data}) => {
    if (data) {
        const sorted = Object.entries(data)
            .sort(([label1, _value1], [label2, _value2]) => label1.localeCompare(label2))
        const deciles = sorted.map(([label, _]) => label)
        const values = sorted.map(([_, value]) => value)

        return (
            <BarChart
                xAxis={[{scaleType: 'band', data: deciles}]}
                series={[{data: values}]}
                width={400}
                height={150}
                borderRadius={5}
                margin={{top: 10, bottom: 20}}
                yAxis={[{max: Math.max(...values) * 1.1}]}
            />
        );
    }
    return null
};

export default QuantileBarChart;
