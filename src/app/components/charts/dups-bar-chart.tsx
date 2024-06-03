import React, {useState} from 'react';
import {BarChart} from '@mui/x-charts';
import {Box, Button} from "@mui/material";
import {DataGrid, GridToolbar} from "@mui/x-data-grid";

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
        let rowCounter = 0
        const gridData = sorted.map(([Value, Count]) => ({Value, Count}))

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
                {all && (<Box style={{height: '50vh'}}>
                    <DataGrid
                        density={'compact'}
                        slots={{toolbar: GridToolbar}}
                        rows={gridData}
                        columns={[{field: 'Value', width: 350}, {field: 'Count'}]}
                        getRowId={() => rowCounter++}
                    />
                </Box>)}</>
        );
    }
    return null
};

export default DupsBarChart;
