import { Limit, Icon } from '@/types//general'
import type { QTableColumn } from 'quasar'
import type { defineAsyncComponent } from 'vue'
import type { EventBusKey } from '@vueuse/core'
import { z } from 'zod'

//
// EVENT BUS KEYS
//

export const coreIdBusKey: EventBusKey<string> = Symbol('core-id-changed-event')

//
// DATABASE TYPES
//

// URL friendly slugs
export enum RecordType {
  WORKOUT = 'workout',
  EXERCISE = 'exercise',
  MEASUREMENT = 'measurement',
}
export const recordTypeSchema = z.nativeEnum(RecordType)

// URL friendly slug
export enum RecordGroup {
  CORE = 'core',
  SUB = 'sub',
}
export const recordGroupSchema = z.nativeEnum(RecordGroup)

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum SettingKey {
  USER_HEIGHT_INCHES = 'user-height-inches',
  WELCOME_OVERLAY = 'welcome-overlay',
  DASHBOARD_DESCRIPTIONS = 'dashboard-descriptions',
  DARK_MODE = 'dark-mode',
  CONSOLE_LOGS = 'console-logs',
  INFO_MESSAGES = 'info-messages',
  LOG_RETENTION_DURATION = 'log-retention-duration',
}

export enum MeasurementInput {
  BODY_WEIGHT = 'Body Weight (lbs)',
  PERCENT = 'Percentage',
  INCHES = 'Inches',
  LBS = 'Lbs',
  NUMBER = 'Number',
}
export const measurementInputSchema = z.nativeEnum(MeasurementInput)

export enum ExerciseInput {
  REPS = 'Reps',
  WEIGHT = 'Weight (lbs)',
  DISTANCE = 'Distance (miles)',
  DURATION = 'Duration (minutes)',
  WATTS = 'Watts',
  SPEED = 'Speed (mph)',
  RESISTANCE = 'Resistance',
  INCLINE = 'Incline',
  CALORIES = 'Calories Burned',
}
export const exerciseInputSchema = z.nativeEnum(ExerciseInput)
export const exerciseInputsSchema = z.array(exerciseInputSchema)

export enum Field {
  // Setting
  KEY = 'key',
  VALUE = 'value',

  // Log
  AUTO_ID = 'autoId',
  LOG_LEVEL = 'logLevel',
  LOG_LABEL = 'logLabel',
  DETAILS = 'details',
  ERROR_MESSAGE = 'errorMessage',
  STACK_TRACE = 'stackTrace',

  // Shared
  CREATED_TIMESTAMP = 'createdTimestamp',
  ACTIVE = 'active',

  // Base
  TYPE = 'type',
  ID = 'id',

  // Sub
  CORE_ID = 'coreId',
  NOTE = 'note',

  // Core
  NAME = 'name',
  DESC = 'desc',
  ENABLED = 'enabled',
  FAVORITED = 'favorited',
  LAST_SUB = 'lastSub',
  PREVIOUS = 'previous',

  // Workout Result
  FINISHED_TIMESTAMP = 'finishedTimestamp',
  EXERCISE_RESULT_IDS = 'exerciseResultIds',

  // Workout
  EXERCISE_IDS = 'exerciseIds',

  // Exercise Result
  REPS = 'reps',
  WEIGHT = 'weightLbs',
  DISTANCE = 'distanceMiles',
  DURATION = 'durationMinutes',
  WATTS = 'watts',
  SPEED = 'speedMph',
  RESISTANCE = 'resistance',
  INCLINE = 'incline',
  CALORIES = 'calories',

  // Exercise
  EXERCISE_INPUTS = 'exerciseInputs',
  MULTIPLE_SETS = 'multipleSets',

  // Measurement Result
  BODY_WEIGHT = 'bodyWeight',
  PERCENT = 'percent',
  INCHES = 'inches',
  LBS = 'lbs',
  NUMBER = 'number',

  // Measurement
  MEASUREMENT_INPUT = 'measurementInput',

  // Previous
  WORKOUT_DURATION = 'workoutDuration',

  // Active Workout
  PREVIOUS_NOTE = 'previousNote',
  EXERCISES = 'exercises',
  PREVIOUS_REPS = 'previousReps',
  PREVIOUS_WEIGHT = 'previousWeight',
  PREVIOUS_DISTANCE = 'previousDistance',
  PREVIOUS_DURATION = 'previousDuration',
  PREVIOUS_WATTS = 'previousWatts',
  PREVIOUS_SPEED = 'previousSpeed',
  PREVIOUS_RESISTANCE = 'previousResistance',
  PREVIOUS_INCLINE = 'previousIncline',
  PREVIOUS_CALORIES = 'previousCalories',
}

export const exerciseDataFields = [
  Field.REPS,
  Field.WEIGHT,
  Field.DISTANCE,
  Field.DURATION,
  Field.WATTS,
  Field.SPEED,
  Field.RESISTANCE,
  Field.INCLINE,
  Field.CALORIES,
]

export const measurementDataFields = [
  Field.BODY_WEIGHT,
  Field.PERCENT,
  Field.INCHES,
  Field.LBS,
  Field.NUMBER,
]

export const detailsSchema = z.record(z.any()).optional()
export type Details = z.infer<typeof detailsSchema>

export const timestampSchema = z.number().int()
export const idSchema = z.string().uuid()
export const nameSchema = z.string().min(Limit.MIN_NAME).max(Limit.MAX_NAME).trim()
export const textAreaSchema = z.string().max(Limit.MAX_TEXT_AREA).trim()
export const booleanSchema = z.boolean()
export const finishedTimestampSchema = timestampSchema.optional()
export const exerciseIdsSchema = z.array(idSchema).min(1) // Workout must have at least 1 exercise
export const exerciseResultIdsSchema = z.array(idSchema) // May not have any exercise results
export const heightSchema = z.number().positive().min(1).max(120).optional()
export const numberSchema = z.number().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER)
export const bodyWeightSchema = z.number().min(1).max(1000)
export const percentSchema = z.number().min(0).max(100)
export const setsSchema = z.array(numberSchema)

const settingSchema = z.object({
  [Field.KEY]: z.nativeEnum(SettingKey),
  [Field.VALUE]: z.boolean().or(z.string()).or(z.number()).optional(),
})

export type Log = z.infer<typeof logSchema>

const logSchema = z.object({
  [Field.AUTO_ID]: z.number().int().positive().optional(), // Handled by Dexie
  [Field.CREATED_TIMESTAMP]: z.number().int(),
  [Field.LOG_LEVEL]: z.nativeEnum(LogLevel),
  [Field.LOG_LABEL]: z.string().trim(),
  [Field.DETAILS]: detailsSchema,
  [Field.ERROR_MESSAGE]: z.string().trim().optional(),
  [Field.STACK_TRACE]: z.string().trim().optional(),
})

export type Setting = z.infer<typeof settingSchema>

const baseSchema = z.object({
  [Field.TYPE]: recordTypeSchema,
  [Field.ID]: idSchema,
  [Field.CREATED_TIMESTAMP]: timestampSchema,
})

const subSchema = baseSchema.extend({
  [Field.CORE_ID]: idSchema,
  [Field.NOTE]: textAreaSchema,
})

const previousSchema = z
  .object({
    [Field.CREATED_TIMESTAMP]: timestampSchema.optional(),
    [Field.NOTE]: textAreaSchema.optional(),
    // Workout
    [Field.WORKOUT_DURATION]: z.string().optional(),
    // Exercise
    [Field.REPS]: z.string().optional(),
    [Field.WEIGHT]: z.string().optional(),
    [Field.DISTANCE]: z.string().optional(),
    [Field.DURATION]: z.string().optional(),
    [Field.WATTS]: z.string().optional(),
    [Field.SPEED]: z.string().optional(),
    [Field.RESISTANCE]: z.string().optional(),
    [Field.INCLINE]: z.string().optional(),
    [Field.CALORIES]: z.string().optional(),
    // Measurement
    [Field.BODY_WEIGHT]: z.string().optional(),
    [Field.PERCENT]: z.string().optional(),
    [Field.INCHES]: z.string().optional(),
    [Field.LBS]: z.string().optional(),
    [Field.NUMBER]: z.string().optional(),
  })
  .optional()

export type PreviousData = z.infer<typeof previousSchema>

const coreSchema = baseSchema.extend({
  [Field.NAME]: nameSchema,
  [Field.DESC]: textAreaSchema,
  [Field.ENABLED]: booleanSchema,
  [Field.FAVORITED]: booleanSchema,
  [Field.PREVIOUS]: previousSchema,
})

// Workout Result
export const workoutResultSchema = subSchema.extend({
  [Field.TYPE]: z.literal(RecordType.WORKOUT),
  [Field.FINISHED_TIMESTAMP]: finishedTimestampSchema,
  [Field.EXERCISE_RESULT_IDS]: exerciseResultIdsSchema,
  [Field.ACTIVE]: booleanSchema,
})

export type WorkoutResultRecord = z.infer<typeof workoutResultSchema>

// Workout
export const workoutSchema = coreSchema.extend({
  [Field.TYPE]: z.literal(RecordType.WORKOUT),
  [Field.EXERCISE_IDS]: exerciseIdsSchema,
  [Field.ACTIVE]: booleanSchema,
})

export type WorkoutRecord = z.infer<typeof workoutSchema>

// Exercise Result
export const exerciseResultSchema = subSchema
  .extend({
    [Field.TYPE]: z.literal(RecordType.EXERCISE),
    [Field.ACTIVE]: booleanSchema,
    [Field.REPS]: setsSchema.optional(),
    [Field.WEIGHT]: setsSchema.optional(),
    [Field.DISTANCE]: setsSchema.optional(),
    [Field.DURATION]: setsSchema.optional(),
    [Field.WATTS]: setsSchema.optional(),
    [Field.SPEED]: setsSchema.optional(),
    [Field.RESISTANCE]: setsSchema.optional(),
    [Field.INCLINE]: setsSchema.optional(),
    [Field.CALORIES]: setsSchema.optional(),
  })
  .refine(
    (obj) => {
      const fieldArray = Object.keys(obj).filter((f) => exerciseDataFields.includes(f as Field))
      const noUndefined = fieldArray.every((val) => val !== undefined)
      const noEmptySets = fieldArray.every((val) => val?.length !== 0)
      const noMissingData = fieldArray.length > 0
      return noUndefined && noEmptySets && noMissingData
    },
    {
      message: 'Must have valid entries in exercise result data fields',
      path: exerciseDataFields,
    }
  )

export type ExerciseResultRecord = z.infer<typeof exerciseResultSchema>

// Exercise
export const exerciseSchema = coreSchema.extend({
  [Field.TYPE]: z.literal(RecordType.EXERCISE),
  [Field.EXERCISE_INPUTS]: exerciseInputsSchema,
  [Field.MULTIPLE_SETS]: booleanSchema,
  [Field.ACTIVE]: booleanSchema,
})

export type ExerciseRecord = z.infer<typeof exerciseSchema>

// Measurement Result
export const measurementResultSchema = subSchema
  .extend({
    [Field.TYPE]: z.literal(RecordType.MEASUREMENT),
    [Field.BODY_WEIGHT]: bodyWeightSchema.optional(),
    [Field.PERCENT]: percentSchema.optional(),
    [Field.INCHES]: numberSchema.optional(),
    [Field.LBS]: numberSchema.optional(),
    [Field.NUMBER]: numberSchema.optional(),
  })
  .refine(
    (obj) => {
      const fieldArray = Object.keys(obj).filter((f) => measurementDataFields.includes(f as Field))
      const noUndefined = fieldArray.every((val) => val !== undefined)
      const noWrongCount = fieldArray.length === 1
      return noUndefined && noWrongCount
    },
    {
      message: 'Must have exactly one valid measurement result data field',
      path: measurementDataFields,
    }
  )

export type MeasurementResultRecord = z.infer<typeof measurementResultSchema>

// Measurement
export const measurementSchema = coreSchema.extend({
  [Field.TYPE]: z.literal(RecordType.MEASUREMENT),
  [Field.MEASUREMENT_INPUT]: measurementInputSchema,
})

export type MeasurementRecord = z.infer<typeof measurementSchema>

// Active Workout
export const activeWorkoutSchema = z.object({
  [Field.NAME]: nameSchema,
  [Field.DESC]: textAreaSchema,
  [Field.CORE_ID]: idSchema,
  [Field.CREATED_TIMESTAMP]: timestampSchema,
  [Field.NOTE]: textAreaSchema,
  [Field.PREVIOUS_NOTE]: textAreaSchema,
  [Field.EXERCISES]: z.array(
    z.object({
      [Field.NAME]: nameSchema,
      [Field.DESC]: textAreaSchema,
      [Field.CORE_ID]: idSchema,
      [Field.NOTE]: textAreaSchema,
      [Field.PREVIOUS_NOTE]: textAreaSchema,
      [Field.REPS]: setsSchema.optional(),
      [Field.PREVIOUS_REPS]: z.string().optional(),
      [Field.WEIGHT]: setsSchema.optional(),
      [Field.PREVIOUS_WEIGHT]: z.string().optional(),
      [Field.DISTANCE]: setsSchema.optional(),
      [Field.PREVIOUS_DISTANCE]: z.string().optional(),
      [Field.DURATION]: setsSchema.optional(),
      [Field.PREVIOUS_DURATION]: z.string().optional(),
      [Field.WATTS]: setsSchema.optional(),
      [Field.PREVIOUS_WATTS]: z.string().optional(),
      [Field.SPEED]: setsSchema.optional(),
      [Field.PREVIOUS_SPEED]: z.string().optional(),
      [Field.RESISTANCE]: setsSchema.optional(),
      [Field.PREVIOUS_RESISTANCE]: z.string().optional(),
      [Field.INCLINE]: setsSchema.optional(),
      [Field.PREVIOUS_INCLINE]: z.string().optional(),
      [Field.CALORIES]: setsSchema.optional(),
      [Field.PREVIOUS_CALORIES]: z.string().optional(),
    })
  ),
})

export type ActiveWorkoutRecord = z.infer<typeof activeWorkoutSchema>

//
// ANY RECORD TYPES
//

export type AnyDatabaseRecord = { [key in Field]?: any }
export type AnyRecord = z.infer<typeof baseSchema> & AnyDatabaseRecord
export type AnySubRecord = z.infer<typeof subSchema> & AnyDatabaseRecord
export type AnyCoreRecord = z.infer<typeof coreSchema> & AnyDatabaseRecord

//
// MISCELLANEOUS TYPES
//

export type BackupData = {
  appName: string
  databaseVersion: number
  timestamp: number
  logs: Log[]
  settings: Setting[]
  coreRecords: AnyCoreRecord[]
  subRecords: AnySubRecord[]
}

export type RecordProps = {
  type: RecordType
  group: RecordGroup
  icon: Icon
  singular: string
  plural: string
  charts: ReturnType<typeof defineAsyncComponent>[]
  fields: ReturnType<typeof defineAsyncComponent>[]
  tableColumns: QTableColumn[]
  schema: z.ZodObject<any, any, any> | z.ZodEffects<any, any, any>
}
