import React from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

import {ProfileDateStats} from "./profile-types";

export const CompactDateStatsTable: React.FC<{ stats?: ProfileDateStats }> = ({stats}) => {
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
                            <TableCell align="right">{new Date(stats.mean).toUTCString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Min</TableCell>
                            <TableCell align="right">{new Date(stats.min).toUTCString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Max</TableCell>
                            <TableCell align="right">{new Date(stats.max).toUTCString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Average</TableCell>
                            <TableCell align="right">{new Date(stats.average).toUTCString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Median</TableCell>
                            <TableCell align="right">{new Date(stats.median).toUTCString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Mode</TableCell>
                            <TableCell align="right">{new Date(stats.mode).toUTCString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
};