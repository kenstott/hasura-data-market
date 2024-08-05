'use client'
import React from 'react';
import {Box, Container, Grid, Paper, Typography} from '@mui/material';
import {DataGridPro} from '@mui/x-data-grid-pro';
import {Bar, Line} from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
        {
            label: 'Dataset 1',
            data: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
        {
            label: 'Dataset 2',
            data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
        },
    ],
};

const barChartData = {
    labels: ['Page A', 'Page B', 'Page C', 'Page D', 'Page E', 'Page F', 'Page G'],
    datasets: [
        {
            label: 'Dataset 1',
            data: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        },
        {
            label: 'Dataset 2',
            data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        },
    ],
};

const rows = [
    {id: 1, col1: 'Hello', col2: 'World'},
    {id: 2, col1: 'DataGridPro', col2: 'is Awesome'},
    {id: 3, col1: 'Material-UI', col2: 'is Amazing'},
];

const columns = [
    {field: 'id', headerName: 'ID', width: 90},
    {field: 'col1', headerName: 'Column 1', width: 150},
    {field: 'col2', headerName: 'Column 2', width: 150},
];

const Dashboard = () => {
    return (
        <Box sx={{flexGrow: 1, p: 3}}>
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    {/* Line Chart Widget */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 240}}>
                            <Typography variant="h6">Line Chart</Typography>
                            <Line data={lineChartData}/>
                        </Paper>
                    </Grid>
                    {/* Bar Chart Widget */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 240}}>
                            <Typography variant="h6">Bar Chart</Typography>
                            <Bar data={barChartData}/>
                        </Paper>
                    </Grid>
                    {/* Data Grid Widget */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 240}}>
                            <Typography variant="h6">Data Grid</Typography>
                            <DataGridPro rows={rows} columns={columns}/>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Dashboard;
