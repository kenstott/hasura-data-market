import React, {useState} from "react";
import Grid from "@mui/material/Unstable_Grid2";
import {FormControl, FormControlLabel, Radio, RadioGroup, Typography} from "@mui/material";
import {CompactNumericStatsTable} from "./compact-numeric-stats-table";
import {QuantileBarChart} from "./quantile-bar-chart";
import {GraphQLScalarType} from "graphql";
import {DupsBarChart} from "./dups-bar-chart";
import {CompactDateStatsTable} from "./compact-date-stats-table";
import {DateCounts, ProfileDateItem, ProfileNumericItem, ProfilePanelProps, ProfileStringItem} from "./profile-types";

export const ProfilePanel: React.FC<ProfilePanelProps> = ({t, item}) => {
    const [countType, setCountType] = useState<DateCounts>('year')

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
                return (
                    <Grid container alignItems="flex-start" spacing={2}>
                        {i.unique && (<Grid xs={12} style={{backgroundColor: 'blue', color: 'white'}}>
                            <Typography variant={'subtitle2'}>{i.unique ? 'Unique' : 'Not Unique'}</Typography>
                        </Grid>)}
                        <Grid xs={12} md={4}>
                            <CompactDateStatsTable stats={i.stats}/>
                        </Grid>
                        <Grid xs={12} md={8}>
                            <FormControl
                                sx={{
                                    marginBottom: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: {xs: 'column', sm: 'row'}
                                }}>
                                <RadioGroup
                                    row
                                    id={'sampleType'}
                                    aria-labelledby="sample-radio-buttons"
                                    name="row-radio-buttons-group"
                                    value={countType}
                                    onChange={(event) => {
                                        setCountType(event.target.value as DateCounts)
                                    }}
                                >
                                    <FormControlLabel id={'countType'} value="year" control={<Radio/>}
                                                      label="Year"/>
                                    <FormControlLabel id={'countType'} value="month" control={<Radio/>} label="Month"/>
                                    <FormControlLabel id={'countType'} value="dayOfMonth" control={<Radio/>}
                                                      label="Day of Month"/>
                                    <FormControlLabel id={'countType'} value="dayOfWeek" control={<Radio/>}
                                                      label="Day of Week"/>
                                    <FormControlLabel id={'countType'} value="hourOfDay" control={<Radio/>}
                                                      label="Hour of Day"/>
                                </RadioGroup>
                            </FormControl>
                            <DupsBarChart data={i.counts?.[countType] as Record<string, number>}/>
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