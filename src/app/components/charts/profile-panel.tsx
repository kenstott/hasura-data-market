import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import {Typography} from "@mui/material";
import {CompactNumericStatsTable} from "./compact-numeric-stats-table";
import {QuantileBarChart} from "./quantile-bar-chart";
import {
    ProfileDateItem,
    ProfileNumericItem,
    ProfilePanelProps,
    ProfileStringItem
} from "../profiler-dialog/profiler-dialog";
import {GraphQLScalarType} from "graphql";
import {DupsBarChart} from "./dups-bar-chart";
import {CompactDateStatsTable} from "./compact-date-stats-table";

export const ProfilePanel: React.FC<ProfilePanelProps> = ({t, item}) => {
    if (t && item) {
        switch (panelType(t)) {
            case 'numeric': {
                const i = item as ProfileNumericItem
                return (<Grid container alignItems="flex-start" spacing={2}>
                        {i.unique && (<Grid xs={12} style={{backgroundColor: 'blue', color: 'white'}}>
                            <Typography variant={'subtitle2'}>{i.unique ? 'Unique' : 'Not Unique'}</Typography>
                        </Grid>)}
                        <Grid xs={12} md={6}>
                            <CompactNumericStatsTable stats={i.stats}/>
                        </Grid>
                        <Grid>
                            <Grid xs={12} md={6}>
                                <QuantileBarChart data={i.quartiles}/>
                            </Grid>
                            <Grid xs={12} md={6}>
                                <QuantileBarChart data={i.deciles}/>
                            </Grid>
                        </Grid>
                    </Grid>
                )
            }
            case 'string': {
                const i = item as ProfileStringItem
                return (<Grid container alignItems="flex-start" spacing={2}>
                        {i.unique && (<Grid xs={12} style={{backgroundColor: 'blue', color: 'white'}}>
                            <Typography variant={'subtitle2'}>{i.unique ? 'Unique' : 'Not Unique'}</Typography>
                        </Grid>)}
                        <Grid xs={12} md={6}>
                            <CompactNumericStatsTable stats={i.stats}/>
                        </Grid>
                        <Grid>
                            <DupsBarChart data={i.dups}/>
                        </Grid>
                    </Grid>
                )
            }
            case 'date': {
                const i = item as ProfileDateItem
                return (<Grid container alignItems="flex-start" spacing={2}>
                        {i.unique && (<Grid xs={12} style={{backgroundColor: 'blue', color: 'white'}}>
                            <Typography variant={'subtitle2'}>{i.unique ? 'Unique' : 'Not Unique'}</Typography>
                        </Grid>)}
                        <Grid xs={12} md={6}>
                            <CompactDateStatsTable stats={i.stats}/>
                        </Grid>
                    </Grid>
                )
            }
            case 'boolean':
                return (<div>Boolean</div>)
            default:
                return null
        }
    }
    return null
}
const panelType = (t?: GraphQLScalarType) => {
    if (t) {
        if (t.name.match(/time|date/i)) {
            return 'date'
        }
        if (t.name.match(/int|float/i)) {
            return 'numeric'
        }
        if (t.name === 'String') {
            return 'string'
        }
        if (t.name === 'Boolean') {
            return 'boolean'
        }
    }
    return undefined
}