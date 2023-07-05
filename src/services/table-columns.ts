import type { QTableColumn } from 'quasar'
import { truncateString, getDisplayDate } from '@/utils/common'
import {
  type LogLevel,
  type AnyField,
  allFields,
  type MeasurementInput,
  type ExerciseInput,
} from '@/types/core'

function makeStandardColumn(field: AnyField, required: boolean = false) {
  return {
    name: field,
    align: 'left',
    sortable: true,
    required,
    field: (row: any) => row[field],
  } as QTableColumn
}

// For hidden required porperties
function makeHiddenColumn(field: AnyField, name: string) {
  return {
    name,
    label: '',
    align: 'left',
    sortable: false,
    required: true,
    field: (row: any) => row[field],
    format: (val: any) => `${val}`,
    style: 'display: none', // Hide column in QTable
  } as QTableColumn
}

//
// LOG
//

// Access in QTable via props.cols[0]
const hiddenAutoIdColumn: QTableColumn = {
  ...makeHiddenColumn(allFields.Values.autoId, 'hiddenAutoId'),
}

const autoIdColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.autoId),
  label: 'Auto Id',
  format: (val: number) => `${val}`,
}

const logLevelColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.logLevel),
  label: 'Log Level',
  format: (val: LogLevel) => `${val}`,
}

const labelColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.logLabel),
  label: 'Log Label',
  format: (val: string) => truncateString(val, 30, '...'),
}

const detailsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.details),
  label: 'Details',
  format: (val: any) => truncateString(JSON.stringify(val), 30, '...'),
}

const messageColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.errorMessage),
  label: 'Message',
  format: (val: string) => truncateString(val, 30, '...'),
}

const stackColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.stackTrace),
  label: 'Stack',
  format: (val: string) => truncateString(val, 30, '...'),
}

//
// ALL RECORDS
//

// Access in QTable via props.cols[0]
const hiddenIdColumn: QTableColumn = {
  ...makeHiddenColumn(allFields.Values.id, 'hiddenId'),
}

const idColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.id),
  label: 'Id*',
  format: (val: string) => truncateString(val, 8, '*'),
}

const timestampColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.timestamp),
  label: 'Created Date',
  format: (val: number) => getDisplayDate(val),
}

//
// CORE RECORDS
//

const nameColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.name),
  label: 'Name',
  format: (val: string) => truncateString(val, 30, '...'),
}

const descColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.desc),
  label: 'Description',
  format: (val: string) => truncateString(val, 30, '...'),
}

const enabledColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.enabled),
  label: 'Enabled',
  format: (val: boolean) => (val ? 'Yes' : 'No'),
}

const favoritedColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.favorited),
  label: 'Favorited',
  format: (val: boolean) => (val ? 'Yes' : 'No'),
}

//
// SUB RECORDS
//

const coreIdColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.coreId),
  label: 'Core Id*',
  format: (val: string) => truncateString(val, 8, '*'),
}

const noteColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.note),
  label: 'Note',
  format: (val: string) => truncateString(val, 30, '...'),
}

//
// RECORD SPECIFIC
//

const exerciseIdsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.exerciseIds),
  label: 'Exercise Ids',
  format: (val: string[]) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const exerciseResultIdsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.exerciseResultIds),
  label: 'Exercise Result Ids',
  format: (val: string[]) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const finishedTimestampColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.finishedTimestamp),
  label: 'Finished Date',
  format: (val: number | undefined) => (val ? getDisplayDate(val) : ''),
}

const measurementInputColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.measurementInput),
  label: 'Measurement Input',
  format: (val: MeasurementInput) => `${val}`,
}

const exerciseInputsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.exerciseInputs),
  label: 'Exercise Inputs',
  format: (val: ExerciseInput[]) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const activeColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.active),
  label: 'Active',
  format: (val: boolean) => (val ? 'Yes' : 'No'),
}

const multipleSetsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.multipleSets),
  label: 'Multiple Sets',
  format: (val: boolean) => (val ? 'Yes' : 'No'),
}

const bodyWeightColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.bodyWeight),
  label: 'Body Weight',
  format: (val: number | null) => (val ? `${val} lbs` : ''),
}

const percentColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.percent),
  label: 'Percentage',
  format: (val: number | null) => (val ? `${val}%` : ''),
}

const inchesColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.inches),
  label: 'Inches',
  format: (val: number | null) => (val ? `${val} in` : ''),
}

const lbsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.lbs),
  label: 'Lbs',
  format: (val: number | null) => (val ? `${val} lbs` : ''),
}

const repsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.reps),
  label: 'Reps',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const weightLbsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.weightLbs),
  label: 'Weight (lbs)',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const distanceMilesColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.distanceMiles),
  label: 'Distance (miles)',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const durationMinutesColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.durationMinutes),
  label: 'Duration (minutes)',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const wattsColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.watts),
  label: 'Watts',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const speedMphColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.speedMph),
  label: 'Speed (mph)',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const caloriesColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.calories),
  label: 'Calories Burned',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const resistanceColumn: QTableColumn = {
  ...makeStandardColumn(allFields.Values.resistance),
  label: 'Resistance',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

//
// TABLE COLUMNS
//

export const hiddenColumnNames: Readonly<string[]> = [hiddenIdColumn, hiddenAutoIdColumn].map(
  (c) => c.name
)

const baseColumns: Readonly<QTableColumn[]> = [idColumn, timestampColumn]
const coreColumns: Readonly<QTableColumn[]> = [
  ...baseColumns,
  nameColumn,
  descColumn,
  enabledColumn,
  favoritedColumn,
]
const subColumns: Readonly<QTableColumn[]> = [...baseColumns, coreIdColumn, noteColumn]

export const logColumns: QTableColumn[] = [
  hiddenAutoIdColumn,
  autoIdColumn,
  timestampColumn,
  logLevelColumn,
  labelColumn,
  detailsColumn,
  messageColumn,
  stackColumn,
]

export const workoutColumns: QTableColumn[] = [hiddenIdColumn, ...coreColumns, exerciseIdsColumn]
export const workoutResultColumns: QTableColumn[] = [
  hiddenIdColumn,
  ...subColumns,
  activeColumn,
  exerciseResultIdsColumn,
  finishedTimestampColumn,
]

export const exerciseColumns: QTableColumn[] = [
  hiddenIdColumn,
  ...coreColumns,
  multipleSetsColumn,
  exerciseInputsColumn,
]
export const exerciseResultColumns: QTableColumn[] = [
  hiddenIdColumn,
  ...subColumns,
  activeColumn,
  repsColumn,
  weightLbsColumn,
  distanceMilesColumn,
  durationMinutesColumn,
  wattsColumn,
  speedMphColumn,
  caloriesColumn,
  resistanceColumn,
]

export const measurementColumns: QTableColumn[] = [
  hiddenIdColumn,
  ...coreColumns,
  measurementInputColumn,
]
export const measurementResultColumns: QTableColumn[] = [
  hiddenIdColumn,
  ...subColumns,
  bodyWeightColumn,
  percentColumn,
  inchesColumn,
  lbsColumn,
]
