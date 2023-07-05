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
}

export enum ExerciseInput {
  REPS = 'Reps',
  WEIGHT = 'Weight (lbs)',
  DISTANCE = 'Distance (miles)',
  DURATION = 'Duration (minutes)',
  WATTS = 'Watts',
  SPEED = 'Speed (mph)',
  CALORIES = 'Calories Burned',
  RESISTANCE = 'Resistance',
}
export const exerciseInputSchema = z.nativeEnum(ExerciseInput)

// TODO
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
  TIMESTAMP = 'timestamp',
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

  // Workout Result
  FINISHED_TIMESTAMP = 'finishedTimestamp',
  EXERCISE_RESULT_IDS = 'exerciseResultIds',

  // Workout
  EXERCISE_IDS = 'exerciseIds',

  // Exercise Result
  SETS_DATA = 'setsData',
  REPS = 'reps',
  WEIGHT_LBS = 'weightLbs',
  DISTANCE_MILES = 'distanceMiles',
  DURATION_MINUTES = 'durationMinutes',
  WATTS = 'watts',
  SPEED_MPH = 'speedMph',
  CALORIES = 'calories',
  RESISTANCE = 'resistance',

  // Exercise
  EXERCISE_INPUTS = 'exerciseInputs',
  MULTIPLE_SETS = 'multipleSets',

  // Measurement Result
  MEASURED_DATA = 'measuredData',
  BODY_WEIGHT = 'bodyWeight',
  PERCENT = 'percent',
  INCHES = 'inches',
  LBS = 'lbs',

  // Measurement
  MEASUREMENT_INPUT = 'measurementInput',
}

// TODO - organize and rename???
export const heightSchema = z.number().positive().min(1).max(120).optional()
export type Height = z.infer<typeof heightSchema>

export const timestampSchema = z.number().int()
export const detailsSchema = z.record(z.any()).optional()
export type Details = z.infer<typeof detailsSchema>

export const idSchema = z.string().uuid()
export const nameSchema = z.string().min(Limit.MIN_NAME).max(Limit.MAX_NAME).trim()
export const textAreaSchema = z.string().max(Limit.MAX_TEXT_AREA).trim()
export const booleanSchema = z.boolean()
export const finishedTimestampSchema = timestampSchema.optional()
export const exerciseIdsSchema = z.array(idSchema).min(1) // Workout must have at least 1 exercise
export const exerciseResultIdsSchema = z.array(idSchema) // May not have any exercise results
export const exerciseInputsSchema = z.array(exerciseInputSchema) // Can be empty for instructional exercises
export const measurementInputSchema = z.nativeEnum(MeasurementInput)
export const numberSchema = z.number().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER)
export const bodyWeightSchema = z.number().min(1).max(1000)
export const percentSchema = z.number().min(0).max(100)
export const setsSchema = z.array(numberSchema)

// Non-exported schemas
const settingSchema = z.object({
  [Field.KEY]: z.nativeEnum(SettingKey),
  [Field.VALUE]: z.boolean().or(z.string()).or(z.number()).optional(),
})

const logSchema = z.object({
  [Field.AUTO_ID]: z.number().int().positive().optional(), // Handled by Dexie
  [Field.TIMESTAMP]: z.number().int(),
  [Field.LOG_LEVEL]: z.nativeEnum(LogLevel),
  [Field.LOG_LABEL]: z.string().trim(),
  [Field.DETAILS]: detailsSchema,
  [Field.ERROR_MESSAGE]: z.string().trim().optional(),
  [Field.STACK_TRACE]: z.string().trim().optional(),
})

const baseSchema = z.object({
  [Field.TYPE]: recordTypeSchema,
  [Field.ID]: idSchema,
  [Field.TIMESTAMP]: timestampSchema,
})

const subSchema = baseSchema.extend({
  [Field.CORE_ID]: idSchema,
  [Field.NOTE]: textAreaSchema,
})

const coreSchema = baseSchema.extend({
  [Field.NAME]: nameSchema,
  [Field.DESC]: textAreaSchema,
  [Field.ENABLED]: booleanSchema,
  [Field.FAVORITED]: booleanSchema,
  [Field.LAST_SUB]: subSchema.optional(),
})

const setsDataObject = z.object({
  [Field.REPS]: setsSchema.optional(),
  [Field.WEIGHT_LBS]: setsSchema.optional(),
  [Field.DISTANCE_MILES]: setsSchema.optional(),
  [Field.DURATION_MINUTES]: setsSchema.optional(),
  [Field.WATTS]: setsSchema.optional(),
  [Field.SPEED_MPH]: setsSchema.optional(),
  [Field.CALORIES]: setsSchema.optional(),
  [Field.RESISTANCE]: setsSchema.optional(),
})

const measuredDataObject = z.object({
  [Field.BODY_WEIGHT]: bodyWeightSchema.optional(),
  [Field.PERCENT]: percentSchema.optional(),
  [Field.INCHES]: numberSchema.optional(),
  [Field.LBS]: numberSchema.optional(),
})

// Workout Result
export const workoutResultSchema = subSchema.extend({
  [Field.TYPE]: z.literal(RecordType.WORKOUT),
  [Field.FINISHED_TIMESTAMP]: finishedTimestampSchema,
  [Field.EXERCISE_RESULT_IDS]: exerciseResultIdsSchema,
  [Field.ACTIVE]: booleanSchema,
})

// Workout
export const workoutSchema = coreSchema.extend({
  [Field.TYPE]: z.literal(RecordType.WORKOUT),
  [Field.LAST_SUB]: workoutResultSchema.optional(),
  [Field.EXERCISE_IDS]: exerciseIdsSchema,
  [Field.ACTIVE]: booleanSchema,
})

// Exercise Result
export const exerciseResultSchema = subSchema.extend({
  [Field.TYPE]: z.literal(RecordType.EXERCISE),
  [Field.ACTIVE]: booleanSchema,
  [Field.SETS_DATA]: setsDataObject.refine(
    (data) => {
      const setsData = Object.values(data)
      const foundUndefined = setsData.some((value) => value === undefined)
      const foundEmpty = setsData.some((value) => value?.length === 0)
      const foundMissing = setsData.length === 0
      return !foundUndefined && !foundEmpty && !foundMissing
    },
    {
      message: 'Must have at least one valid setsData field with at least one set',
      path: ['measuredData'],
    }
  ),
})

// Exercise
export const exerciseSchema = coreSchema.extend({
  [Field.TYPE]: z.literal(RecordType.EXERCISE),
  [Field.LAST_SUB]: exerciseResultSchema.optional(),
  [Field.MULTIPLE_SETS]: booleanSchema,
  [Field.EXERCISE_INPUTS]: exerciseInputsSchema,
  [Field.ACTIVE]: booleanSchema,
})

// Measurement Result
export const measurementResultSchema = subSchema.extend({
  [Field.TYPE]: z.literal(RecordType.MEASUREMENT),
  [Field.MEASURED_DATA]: measuredDataObject.refine(
    (data) => {
      const measuredData = Object.values(data)
      const foundUndefined = measuredData.some((value) => value === undefined)
      const foundInexact = measuredData.length !== 1
      return !foundUndefined && !foundInexact
    },
    {
      message: 'Must have exactly one valid measuredData field',
      path: ['measuredData'],
    }
  ),
})

// Measurement
export const measurementSchema = coreSchema.extend({
  [Field.TYPE]: z.literal(RecordType.MEASUREMENT),
  [Field.LAST_SUB]: measurementResultSchema.optional(),
  [Field.MEASUREMENT_INPUT]: measurementInputSchema,
})

//
// MODELS
//

export type Log = z.infer<typeof logSchema>
export type Setting = z.infer<typeof settingSchema>

export type AnyDatabaseRecord = { [key: string]: any }
export type AnyRecord = z.infer<typeof baseSchema> & AnyDatabaseRecord
export type AnySubRecord = z.infer<typeof subSchema> & AnyDatabaseRecord
export type AnyCoreRecord = z.infer<typeof coreSchema> & AnyDatabaseRecord

export type WorkoutRecord = z.infer<typeof workoutSchema>
export type WorkoutResultRecord = z.infer<typeof workoutResultSchema>

export type ExerciseRecord = z.infer<typeof exerciseSchema>
export type ExerciseResultRecord = z.infer<typeof exerciseResultSchema>

export type MeasurementRecord = z.infer<typeof measurementSchema>
export type MeasurementResultRecord = z.infer<typeof measurementResultSchema>

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
  schema: z.ZodObject<any, any, any>
}
