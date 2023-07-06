import type { QTableColumn } from 'quasar'
import { truncateString, getDisplayDate } from '@/utils/common'
import { type LogLevel, Field, type MeasurementInput, type ExerciseInput } from '@/types/core'

function makeStandardColumn(field: Field, required: boolean = false) {
  return {
    name: field,
    align: 'left',
    sortable: true,
    required,
    field: (row: any) => row[field],
  } as QTableColumn
}

// For hidden required porperties
function makeHiddenColumn(field: Field, name: string) {
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
  ...makeHiddenColumn(Field.AUTO_ID, 'hiddenAutoId'),
}

const autoIdColumn: QTableColumn = {
  ...makeStandardColumn(Field.AUTO_ID),
  label: 'Auto Id',
  format: (val: number) => `${val}`,
}

const logLevelColumn: QTableColumn = {
  ...makeStandardColumn(Field.LOG_LEVEL),
  label: 'Log Level',
  format: (val: LogLevel) => `${val}`,
}

const labelColumn: QTableColumn = {
  ...makeStandardColumn(Field.LOG_LABEL),
  label: 'Log Label',
  format: (val: string) => truncateString(val, 30, '...'),
}

const detailsColumn: QTableColumn = {
  ...makeStandardColumn(Field.DETAILS),
  label: 'Details',
  format: (val: any) => truncateString(JSON.stringify(val), 30, '...'),
}

const messageColumn: QTableColumn = {
  ...makeStandardColumn(Field.ERROR_MESSAGE),
  label: 'Message',
  format: (val: string) => truncateString(val, 30, '...'),
}

const stackColumn: QTableColumn = {
  ...makeStandardColumn(Field.STACK_TRACE),
  label: 'Stack',
  format: (val: string) => truncateString(val, 30, '...'),
}

//
// ALL RECORDS
//

// Access in QTable via props.cols[0]
const hiddenIdColumn: QTableColumn = {
  ...makeHiddenColumn(Field.ID, 'hiddenId'),
}

const idColumn: QTableColumn = {
  ...makeStandardColumn(Field.ID),
  label: 'Id*',
  format: (val: string) => truncateString(val, 8, '*'),
}

const timestampColumn: QTableColumn = {
  ...makeStandardColumn(Field.TIMESTAMP),
  label: 'Created Date',
  format: (val: number) => getDisplayDate(val),
}

//
// CORE RECORDS
//

const nameColumn: QTableColumn = {
  ...makeStandardColumn(Field.NAME),
  label: 'Name',
  format: (val: string) => truncateString(val, 30, '...'),
}

const descColumn: QTableColumn = {
  ...makeStandardColumn(Field.DESC),
  label: 'Description',
  format: (val: string) => truncateString(val, 30, '...'),
}

const enabledColumn: QTableColumn = {
  ...makeStandardColumn(Field.ENABLED),
  label: 'Enabled',
  format: (val: boolean) => (val ? 'Yes' : 'No'),
}

const favoritedColumn: QTableColumn = {
  ...makeStandardColumn(Field.FAVORITED),
  label: 'Favorited',
  format: (val: boolean) => (val ? 'Yes' : 'No'),
}

//
// SUB RECORDS
//

const coreIdColumn: QTableColumn = {
  ...makeStandardColumn(Field.CORE_ID),
  label: 'Core Id*',
  format: (val: string) => truncateString(val, 8, '*'),
}

const noteColumn: QTableColumn = {
  ...makeStandardColumn(Field.NOTE),
  label: 'Note',
  format: (val: string) => truncateString(val, 30, '...'),
}

//
// RECORD SPECIFIC
//

const exerciseIdsColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_IDS),
  label: 'Exercise Ids',
  format: (val: string[]) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const exerciseResultIdsColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_RESULT_IDS),
  label: 'Exercise Result Ids',
  format: (val: string[]) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const finishedTimestampColumn: QTableColumn = {
  ...makeStandardColumn(Field.FINISHED_TIMESTAMP),
  label: 'Finished Date',
  format: (val: number | undefined) => (val ? getDisplayDate(val) : ''),
}

const measurementInputColumn: QTableColumn = {
  ...makeStandardColumn(Field.MEASUREMENT_INPUT),
  label: 'Measurement Input',
  format: (val: MeasurementInput) => `${val}`,
}

const exerciseInputsColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_INPUTS),
  label: 'Exercise Inputs',
  format: (val: ExerciseInput[]) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const multipleSetsColumn: QTableColumn = {
  ...makeStandardColumn(Field.MULTIPLE_SETS),
  label: 'Multiple Sets',
  format: (val: boolean) => (val ? 'Yes' : 'No'),
}

const bodyWeightColumn: QTableColumn = {
  ...makeStandardColumn(Field.BODY_WEIGHT),
  label: 'Body Weight',
  format: (val: number | null) => (val ? `${val} lbs` : ''),
}

const percentColumn: QTableColumn = {
  ...makeStandardColumn(Field.PERCENT),
  label: 'Percentage',
  format: (val: number | null) => (val ? `${val}%` : ''),
}

const inchesColumn: QTableColumn = {
  ...makeStandardColumn(Field.INCHES),
  label: 'Inches',
  format: (val: number | null) => (val ? `${val} in` : ''),
}

const lbsColumn: QTableColumn = {
  ...makeStandardColumn(Field.LBS),
  label: 'Lbs',
  format: (val: number | null) => (val ? `${val} lbs` : ''),
}

const repsColumn: QTableColumn = {
  ...makeStandardColumn(Field.REPS),
  label: 'Reps',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const weightLbsColumn: QTableColumn = {
  ...makeStandardColumn(Field.WEIGHT_LBS),
  label: 'Weight (lbs)',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const distanceMilesColumn: QTableColumn = {
  ...makeStandardColumn(Field.DISTANCE_MILES),
  label: 'Distance (miles)',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const durationMinutesColumn: QTableColumn = {
  ...makeStandardColumn(Field.DURATION_MINUTES),
  label: 'Duration (minutes)',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const wattsColumn: QTableColumn = {
  ...makeStandardColumn(Field.WATTS),
  label: 'Watts',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const speedMphColumn: QTableColumn = {
  ...makeStandardColumn(Field.SPEED_MPH),
  label: 'Speed (mph)',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const caloriesColumn: QTableColumn = {
  ...makeStandardColumn(Field.CALORIES),
  label: 'Calories Burned',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

const resistanceColumn: QTableColumn = {
  ...makeStandardColumn(Field.RESISTANCE),
  label: 'Resistance',
  format: (val: number[] | null) => truncateString(val ? val?.join(', ') : '', 30, '...'),
}

//
// TABLE COLUMNS
//

/**
 * Active is NOT shown in the data tables because active records are restricted
 */

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
