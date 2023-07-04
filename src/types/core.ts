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

export const recordTypes = z.enum(['workout', 'exercise', 'measurement']) // URL friendly slug
export type RecordType = z.infer<typeof recordTypes>

export const recordGroups = z.enum(['core', 'sub']) // URL friendly slug
export type RecordGroup = z.infer<typeof recordGroups>

export const logLevels = z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR'])
export type LogLevel = z.infer<typeof logLevels>

export const settingkeys = z.enum([
  'user-height-inches',
  'welcome-overlay',
  'dashboard-descriptions',
  'dark-mode',
  'console-logs',
  'info-messages',
  'log-retention-duration',
])
export type SettingKey = z.infer<typeof settingkeys>

export const measurementInputs = z.enum(['Body Weight (lbs)', 'Percentage', 'Inches', 'Lbs'])
export type MeasurementInput = z.infer<typeof measurementInputs>

export const exerciseInputs = z.enum([
  'Reps',
  'Weight (lbs)',
  'Distance (miles)',
  'Duration (minutes)',
  'Watts',
  'Speed (mph)',
  'Calories Burned',
  'Resistence',
])
export type ExerciseInput = z.infer<typeof exerciseInputs>

export const heightSchema = z.number().positive().min(1).max(120).optional()
export type Height = z.infer<typeof heightSchema>

export const settingValueSchema = z.boolean().or(z.string()).or(z.number()).optional()
export const autoIdSchema = z.number().int().positive().optional() // Handled by Dexie
export const timestampSchema = z.number().int()
export const logLabelSchema = z.string().trim()
export const textSchema = z.string().trim().optional()
export const detailsSchema = z.record(z.any()).optional()
export type Details = z.infer<typeof detailsSchema>

export const idSchema = z.string().uuid()
export const nameSchema = z.string().min(Limit.MIN_NAME).max(Limit.MAX_NAME).trim()
export const textAreaSchema = z.string().max(Limit.MAX_TEXT_AREA).trim()
export const booleanSchema = z.boolean()
export const finishedTimestampSchema = z.number().int().optional()
export const exerciseIdsSchema = z.array(idSchema).min(1) // Workout must have at least 1 exercise
export const exerciseResultIdsSchema = z.array(idSchema) // May not have any exercise results
export const exerciseInputsSchema = z.array(exerciseInputs) // Can be empty for instructional exercises
export const measurementInputSchema = measurementInputs
export const numberSchema = z.number().min(0).max(Number.MAX_SAFE_INTEGER)
export const bodyWeightSchema = z.number().min(1).max(1000).nullable()
export const percentSchema = z.number().min(0).max(100).nullable()
export const measureNumberSchema = numberSchema.nullable()
export const setsSchema = z.array(z.number().min(0).max(Number.MAX_SAFE_INTEGER)).nullable()

// Non-exported schemas
const settingSchema = z.object({
  key: settingkeys,
  value: settingValueSchema,
})

const logSchema = z.object({
  autoId: autoIdSchema,
  timestamp: timestampSchema,
  logLevel: logLevels,
  logLabel: logLabelSchema,
  details: detailsSchema,
  errorMessage: textSchema,
  stackTrace: textSchema,
})

const baseSchema = z.object({
  type: recordTypes,
  id: idSchema,
  timestamp: timestampSchema,
})

const subSchema = baseSchema.merge(
  z.object({
    coreId: idSchema,
    note: textAreaSchema,
  })
)

const coreSchema = baseSchema.merge(
  z.object({
    name: nameSchema,
    desc: textAreaSchema,
    enabled: booleanSchema,
    favorited: booleanSchema,
    lastSub: subSchema.optional(),
  })
)

// Workout
export const workoutResultSchema = subSchema.merge(
  z.object({
    type: z.literal(recordTypes.Values.workout),
    finishedTimestamp: finishedTimestampSchema,
    exerciseResultIds: exerciseResultIdsSchema,
    active: booleanSchema,
  })
)

export const workoutSchema = coreSchema.merge(
  z.object({
    type: z.literal(recordTypes.Values.workout),
    lastSub: workoutResultSchema.optional(),
    exerciseIds: exerciseIdsSchema,
  })
)

// Exercise
export const exerciseResultSchema = subSchema.merge(
  z.object({
    type: z.literal(recordTypes.Values.exercise),
    active: booleanSchema,
    reps: setsSchema,
    weightLbs: setsSchema,
    distanceMiles: setsSchema,
    durationMinutes: setsSchema,
    watts: setsSchema,
    speedMph: setsSchema,
    calories: setsSchema,
    resistence: setsSchema,
  })
)

export const exerciseSchema = coreSchema.merge(
  z.object({
    type: z.literal(recordTypes.Values.exercise),
    lastSub: exerciseResultSchema.optional(),
    multipleSets: booleanSchema,
    exerciseInputs: exerciseInputsSchema,
  })
)

export const bodyWeightObject = z.object({ measured: bodyWeightSchema })
export const percentObject = z.object({ measured: percentSchema })
export const inchesObject = z.object({ measured: numberSchema })
export const lbsObject = z.object({ measured: numberSchema })

// Measurement
export const measurementResultSchema = subSchema.merge(
  z.object({
    type: z.literal(recordTypes.Values.measurement),
    bodyWeight: bodyWeightSchema,
    percent: percentSchema,
    inches: measureNumberSchema,
    lbs: measureNumberSchema,
  })
)

export const measurementSchema = coreSchema.merge(
  z.object({
    type: z.literal(recordTypes.Values.measurement),
    lastSub: measurementResultSchema.optional(),
    measurementInput: measurementInputSchema,
  })
)

/**
 * - Use this schema to collect all fields from all schemas
 */
const allSchema = settingSchema
  .merge(logSchema)
  .merge(workoutSchema)
  .merge(workoutResultSchema)
  .merge(exerciseSchema)
  .merge(exerciseResultSchema)
  .merge(measurementSchema)
  .merge(measurementResultSchema)
  .merge(bodyWeightObject)

export const allFields = allSchema.keyof()
export type AnyField = z.infer<typeof allFields>

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
