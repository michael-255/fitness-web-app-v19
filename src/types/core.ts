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

export enum ExercisePreset {
  INSTRUCTIONAL = 'Instructional',
  STRENGTH = 'Strength Training',
  CARDIO = 'Cardio Training',
}
export const exercisePresetSchema = z.nativeEnum(ExercisePreset)

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
  STRENGTH_DATA = 'strengthData',
  CARDIO_DATA = 'cardioData',
  REPS = 'reps',
  WEIGHT = 'weightLbs',
  DISTANCE = 'distanceMiles',
  DURATION = 'durationMinutes',
  WATTS = 'watts',
  SPEED = 'speedMph',
  CALORIES = 'calories',
  RESISTANCE = 'resistance',
  INCLINE = 'incline',

  // Exercise
  EXERCISE_PRESET = 'exercisePreset',

  // Measurement Result
  MEASURED_DATA = 'measuredData',
  BODY_WEIGHT = 'bodyWeight',
  PERCENT = 'percent',
  INCHES = 'inches',
  LBS = 'lbs',

  // Measurement
  MEASUREMENT_INPUT = 'measurementInput',
}

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
export const measurementInputSchema = z.nativeEnum(MeasurementInput)
export const heightSchema = z.number().positive().min(1).max(120).optional()
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

const strengthDataObject = z.object({
  [Field.REPS]: setsSchema.optional(),
  [Field.WEIGHT]: setsSchema.optional(),
})

const cardioDataObject = z.object({
  [Field.DISTANCE]: numberSchema.optional(),
  [Field.DURATION]: numberSchema.optional(),
  [Field.WATTS]: numberSchema.optional(),
  [Field.SPEED]: numberSchema.optional(),
  [Field.RESISTANCE]: numberSchema.optional(),
  [Field.INCLINE]: numberSchema.optional(),
  [Field.CALORIES]: numberSchema.optional(),
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
export const exerciseResultSchema = subSchema
  .extend({
    [Field.TYPE]: z.literal(RecordType.EXERCISE),
    [Field.ACTIVE]: booleanSchema,
    [Field.STRENGTH_DATA]: strengthDataObject
      .refine(
        (data) => {
          const strengthData = Object.values(data)
          const foundUndefined = strengthData.some((val) => val === undefined)
          const foundEmptySets = strengthData.some((val) => val?.length === 0)
          const foundMissingData = strengthData.length !== 2
          return !foundUndefined && !foundEmptySets && !foundMissingData
        },
        {
          message: 'Must have valid entries in strengthData field',
          path: ['strengthData'],
        }
      )
      .optional(),
    [Field.CARDIO_DATA]: cardioDataObject
      .refine(
        (data) => {
          const cardioData = Object.values(data)
          const foundUndefined = cardioData.some((val) => val === undefined)
          const foundMissingData = cardioData.length === 7
          return !foundUndefined && !foundMissingData
        },
        {
          message: 'Must have valid entries in cardioData field',
          path: ['cardioData'],
        }
      )
      .optional(),
  })
  .refine(
    (data) => {
      const strengthData = data[Field.STRENGTH_DATA]
      const cardioData = data[Field.CARDIO_DATA]
      return (strengthData && !cardioData) || (!strengthData && cardioData)
    },
    {
      message: 'Must have exactly one valid data field',
      path: ['strengthData', 'cardioData'],
    }
  )

// Exercise
export const exerciseSchema = coreSchema.extend({
  [Field.TYPE]: z.literal(RecordType.EXERCISE),
  [Field.LAST_SUB]: exerciseResultSchema.optional(),
  [Field.EXERCISE_PRESET]: exercisePresetSchema,
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
  schema: z.ZodObject<any, any, any> | z.ZodEffects<any, any, any>
}
