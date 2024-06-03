import {GraphQLError} from "graphql";
import {ProfilingItems} from "../charts/profile-types";

export type FieldType = string | boolean | number | Record<string, unknown>
export type AnomalyFieldType = {
    __score__: number
    __index__: number
} & FieldType
export type DataType = Record<string, Array<Record<string, FieldType>>>
export type AnomaliesType = Record<string, AnomalyFieldType[]>

export interface GraphQLResponse {
    data: DataType
    errors: GraphQLError[]
    extensions: {
        profiling: Record<string, ProfilingItems>
        actualDatasetSize: Record<string, number>
        anomalies: AnomaliesType
    }
}