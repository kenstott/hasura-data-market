import styles from './decile-bar-chart.module.scss';
import React, {useState} from 'react';
import {BarChart} from '@mui/x-charts';
import {Decile, Quartile} from "../profiler-dialog/profiler-dialog";
import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";

export interface DupsBarChartProps {
    data?: Record<string, number>
}

export const DupsBarChart: React.FC<DupsBarChartProps> = ({data}) => {
    const [all, setAll] = useState(false)
    if (data) {
        const sorted = Object.entries(data)
            .sort(([_label1, value1], [_label2, value2]) => value1 - value2)
        const top = sorted.slice(0, 20)
        const labels = top.map(([label, _]) => label);
        const values = top.map(([_, value]) => value);

        return (
            <>
                <BarChart
                    xAxis={[{scaleType: 'band', data: labels}]}
                    series={[{data: values}]}
                    width={400}
                    height={150}
                    borderRadius={5}
                    margin={{top: 10}}
                    yAxis={[{max: Math.max(...values) * 1.1}]}/>
                <Button onClick={() => setAll(!all)}>View All</Button>
                {all && (<Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Value</TableCell>
                            <TableCell>Count</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map(([label, value]) => {
                            return (
                                <TableRow>
                                    <TableCell>{label}</TableCell>
                                    <TableCell>{value}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>)}</>
        );
    }
    return null
};

export default DupsBarChart;
