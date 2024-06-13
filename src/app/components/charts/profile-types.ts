import {DocumentNode, GraphQLScalarType} from "graphql";
import {Product} from "../current-product-context/current-product-context";

export interface ProfileDateItem {
    unique: boolean
    counts?: Record<DateCounts,
        YearCount
        | Record<Month, number
        | Record<DayOfWeek, number>
        | Record<DayOfMonth, number
        | Record<HourOfDay, number>>>>
    stats?: ProfileDateStats
}

interface ProfileBooleanItem {
    counts?: {
        'true': number,
        'false': number
    }
}

export interface ProfileNumericItem {
    unique: boolean
    stats: ProfileNumberStats
    deciles: Record<Decile, number>
    quartiles: Record<Quartile, number>
}

type ProfilingItem = ProfileStringItem | ProfileDateItem | ProfileNumericItem | ProfileBooleanItem
export type ProfilingItems = {
    [field: string]: ProfilingItem
}

export interface ProfilerDialogProps {
    open: boolean;
    onClose: () => void;
    product?: Product
    query?: DocumentNode
}

export interface ProfilerOptionsVariables {
    maxSize: number
}

export interface ProfilePanelProps {
    t?: GraphQLScalarType
    item?: ProfilingItem
}

export interface ProfileOptionsProps {
    formVariables?: ProfilerOptionsVariables
    setFormVariables: (props: ProfilerOptionsVariables) => void
}

export interface ProfileNumberStats {
    mean: number
    min: number
    max: number
    average: number
    median: number
    mode: number
    variance: number
    sum: number
}

export interface ProfileDateStats {
    mean: string
    min: string
    max: string
    average: string
    median: string
    mode: string
    variance: string
}

export interface ProfileStringItem {
    unique: boolean
    dups?: {
        [value: string]: number
    }
    stats?: ProfileNumberStats
}

export type Month = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
export type DayOfMonth =
    '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '21'
    | '22'
    | '23'
    | '24'
    | '25'
    | '26'
    | '27'
    | '28'
    | '29'
    | '30'
    | '31'
export type HourOfDay =
    '0'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '21'
    | '22'
    | '23'
    | '24'
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export type Quartile = '1' | '0.75' | '0.5' | '0.25'
export type Decile = '1' | '0.9' | '0.8' | '0.7' | '0.6' | '0.5' | '0.4' | '0.3' | '0.2' | '0.1'
export type DateCounts = 'year' | 'month' | 'dayOfMonth' | 'dayOfWeek' | 'hourOfDay'
export type YearCount = Record<string, number>