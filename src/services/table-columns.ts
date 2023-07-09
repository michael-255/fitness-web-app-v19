import type { QTableColumn } from 'quasar'
import { truncateString, getDisplayDate } from '@/utils/common'
import {
  Field,
  MeasurementInput,
  type LogLevel,
  ExerciseInput,
  type PreviousData,
} from '@/types/core'

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
// BASE
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
  ...makeStandardColumn(Field.CREATED_TIMESTAMP),
  label: 'Created Date',
  format: (val: number) => getDisplayDate(val),
}

//
// CORE
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
// SUB
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
// WORKOUT
//

const exerciseIdsColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_IDS),
  label: 'Exercise Ids',
  format: (val: string[]) => `${val?.length ? val.length : 0}`,
}

const exerciseResultIdsColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_RESULT_IDS),
  label: 'Exercise Result Ids',
  format: (val: string[]) => `${val?.length ? val.length : 0}`,
}

const finishedTimestampColumn: QTableColumn = {
  ...makeStandardColumn(Field.FINISHED_TIMESTAMP),
  label: 'Finished Date',
  format: (val: number | undefined) => (val ? getDisplayDate(val) : ''),
}

//
// EXERCISE
//

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

const repsColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.REPS,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.REPS]) {
      return val.map((set) => set[Field.REPS])?.join(', ')
    } else {
      return ''
    }
  },
}

const weightLbsColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.WEIGHT,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.WEIGHT]) {
      return val.map((set) => set[Field.WEIGHT])?.join(', ')
    } else {
      return ''
    }
  },
}

const distanceMilesColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.DISTANCE,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.DISTANCE]) {
      return val.map((set) => set[Field.DISTANCE])?.join(', ')
    } else {
      return ''
    }
  },
}

const durationMinutesColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.DURATION,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.DURATION]) {
      return val.map((set) => set[Field.DURATION])?.join(', ')
    } else {
      return ''
    }
  },
}

const wattsColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.WATTS,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.WATTS]) {
      return val.map((set) => set[Field.WATTS])?.join(', ')
    } else {
      return ''
    }
  },
}

const speedMphColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.SPEED,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.SPEED]) {
      return val.map((set) => set[Field.SPEED])?.join(', ')
    } else {
      return ''
    }
  },
}

const caloriesColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.CALORIES,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.CALORIES]) {
      return val.map((set) => set[Field.CALORIES])?.join(', ')
    } else {
      return ''
    }
  },
}

const resistanceColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.RESISTANCE,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.RESISTANCE]) {
      return val.map((set) => set[Field.RESISTANCE])?.join(', ')
    } else {
      return ''
    }
  },
}

const inclineColumn: QTableColumn = {
  ...makeStandardColumn(Field.EXERCISE_SETS),
  label: ExerciseInput.INCLINE,
  format: (val: { [key in Field]: number | undefined }[]) => {
    if (val?.length > 0 && val[0][Field.INCLINE]) {
      return val.map((set) => set[Field.INCLINE])?.join(', ')
    } else {
      return ''
    }
  },
}

//
// MEASUREMENT
//

const measurementInputColumn: QTableColumn = {
  ...makeStandardColumn(Field.MEASUREMENT_INPUT),
  label: 'Measurement Input',
  format: (val: MeasurementInput) => `${val}`,
}

const bodyWeightColumn: QTableColumn = {
  ...makeStandardColumn(Field.BODY_WEIGHT),
  label: MeasurementInput.BODY_WEIGHT,
  format: (val: number | undefined) => (val ? `${val} lbs` : ''),
}

const percentColumn: QTableColumn = {
  ...makeStandardColumn(Field.PERCENT),
  label: MeasurementInput.PERCENT,
  format: (val: number | undefined) => (val ? `${val}%` : ''),
}

const inchesColumn: QTableColumn = {
  ...makeStandardColumn(Field.INCHES),
  label: MeasurementInput.INCHES,
  format: (val: number | undefined) => (val ? `${val} in` : ''),
}

const lbsColumn: QTableColumn = {
  ...makeStandardColumn(Field.LBS),
  label: MeasurementInput.LBS,
  format: (val: number | undefined) => (val ? `${val} lbs` : ''),
}

const numberColumn: QTableColumn = {
  ...makeStandardColumn(Field.NUMBER),
  label: MeasurementInput.NUMBER,
  format: (val: number | undefined) => (val ? `${val}` : ''),
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
  exerciseResultIdsColumn,
  finishedTimestampColumn,
]

export const exerciseColumns: QTableColumn[] = [
  hiddenIdColumn,
  ...coreColumns,
  exerciseInputsColumn,
  multipleSetsColumn,
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
  inclineColumn,
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
  numberColumn,
]
