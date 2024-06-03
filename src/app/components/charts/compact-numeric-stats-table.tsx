import React from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {ProfileNumberStats} from "./profile-types";

export const CompactNumericStatsTable: React.FC<{ stats?: ProfileNumberStats }> = ({stats}) => {
    if (stats) {
        return (
            <TableContainer style={{maxWidth: '400px'}} component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Statistic</TableCell>
                            <TableCell align="right">Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Mean</TableCell>
                            <TableCell align="right">{stats.mean}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Min</TableCell>
                            <TableCell align="right">{stats.min}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Max</TableCell>
                            <TableCell align="right">{stats.max}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Average</TableCell>
                            <TableCell align="right">{stats.average}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Median</TableCell>
                            <TableCell align="right">{stats.median}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Mode</TableCell>
                            <TableCell align="right">{stats.mode}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Variance</TableCell>
                            <TableCell align="right">{stats.variance}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Sum</TableCell>
                            <TableCell align="right">{stats.sum}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
};