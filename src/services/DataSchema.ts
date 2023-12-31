import { Icon } from '@/types/general'
import { defineAsyncComponent } from 'vue'
import {
  type RecordProps,
  RecordGroup,
  RecordType,
  workoutSchema,
  workoutResultSchema,
  exerciseSchema,
  exerciseResultSchema,
  measurementSchema,
  measurementResultSchema,
  ExerciseInput,
  MeasurementInput,
  Field,
} from '@/types/core'
import {
  exerciseColumns,
  exerciseResultColumns,
  measurementColumns,
  measurementResultColumns,
  workoutColumns,
  workoutResultColumns,
} from '@/services/table-columns'
import type { z } from 'zod'

export default class DataSchema {
  private static recordProps: RecordProps[] = [
    {
      type: RecordType.WORKOUT,
      group: RecordGroup.CORE,
      icon: Icon.WORKOUTS,
      singular: 'Workout',
      plural: 'Workouts',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldName.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldDesc.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldExerciseIds.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCreatedTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldEnabled.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldFavorited.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldActive.vue')),
      ],
      tableColumns: workoutColumns,
      schema: workoutSchema,
    },
    {
      type: RecordType.WORKOUT,
      group: RecordGroup.SUB,
      icon: Icon.WORKOUTS,
      singular: 'Workout Result',
      plural: 'Workout Results',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCoreId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldExerciseResultIds.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCreatedTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldFinishedTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldNote.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldActive.vue')),
      ],
      tableColumns: workoutResultColumns,
      schema: workoutResultSchema,
    },
    {
      type: RecordType.EXERCISE,
      group: RecordGroup.CORE,
      icon: Icon.EXERCISES,
      singular: 'Exercise',
      plural: 'Exercises',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldName.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldDesc.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldExerciseInputs.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldMultipleSets.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCreatedTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldEnabled.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldFavorited.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldActive.vue')),
      ],
      tableColumns: exerciseColumns,
      schema: exerciseSchema,
    },
    {
      type: RecordType.EXERCISE,
      group: RecordGroup.SUB,
      icon: Icon.EXERCISES,
      singular: 'Exercise Result',
      plural: 'Exercise Results',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCoreId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldSets.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCreatedTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldNote.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldActive.vue')),
      ],
      tableColumns: exerciseResultColumns,
      schema: exerciseResultSchema,
    },
    {
      type: RecordType.MEASUREMENT,
      group: RecordGroup.CORE,
      icon: Icon.MEASUREMENTS,
      singular: 'Measurement',
      plural: 'Measurements',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldName.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldDesc.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldMeasurementInput.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCreatedTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldEnabled.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldFavorited.vue')),
      ],
      tableColumns: measurementColumns,
      schema: measurementSchema,
    },
    {
      type: RecordType.MEASUREMENT,
      group: RecordGroup.SUB,
      icon: Icon.MEASUREMENTS,
      singular: 'Measurement Result',
      plural: 'Measurement Results',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCoreId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldBodyWeight.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldPercent.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldInches.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldLbs.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldNumber.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCreatedTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldNote.vue')),
      ],
      tableColumns: measurementResultColumns,
      schema: measurementResultSchema,
    },
  ]

  private static logFields: ReturnType<typeof defineAsyncComponent>[] = [
    defineAsyncComponent(() => import('@/components/fields/FieldAutoId.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldCreatedTimestamp.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldLogLevel.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldLogLabel.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldDetails.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldErrorMessage.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldStackTrace.vue')),
  ]

  static getLogFields() {
    return this.logFields
  }

  static getDashboardOptions(): {
    value: RecordType
    label: string
    icon: Icon
  }[] {
    return this.recordProps
      .filter((p) => p.group === RecordGroup.CORE)
      .map((p) => ({
        value: p.type,
        label: p.plural,
        icon: p.icon,
      }))
  }

  static getLabel(group: RecordGroup, type: RecordType, style: 'singular' | 'plural') {
    return this.recordProps.find((p) => p.group === group && p.type === type)?.[style] as string
  }

  static getTableColumns(group: RecordGroup, type: RecordType) {
    return this.recordProps.find((p) => p.group === group && p.type === type)?.tableColumns ?? []
  }

  static getSchema(group: RecordGroup, type: RecordType) {
    return this.recordProps.find((p) => p.group === group && p.type === type)
      ?.schema as z.ZodObject<any, any, any>
  }

  static getFields(group: RecordGroup, type: RecordType) {
    return this.recordProps.find((p) => p.group === group && p.type === type)?.fields ?? []
  }

  static getCharts(type: RecordType) {
    return (
      this.recordProps.find((p) => p.group === RecordGroup.CORE && p.type === type)?.charts ?? []
    )
  }

  static getInputForField(field: Field) {
    switch (field) {
      case Field.REPS:
        return ExerciseInput.REPS
      case Field.WEIGHT:
        return ExerciseInput.WEIGHT
      case Field.DISTANCE:
        return ExerciseInput.DISTANCE
      case Field.DURATION:
        return ExerciseInput.DURATION
      case Field.WATTS:
        return ExerciseInput.WATTS
      case Field.SPEED:
        return ExerciseInput.SPEED
      case Field.RESISTANCE:
        return ExerciseInput.RESISTANCE
      case Field.INCLINE:
        return ExerciseInput.INCLINE
      case Field.CALORIES:
        return ExerciseInput.CALORIES
      case Field.BODY_WEIGHT:
        return MeasurementInput.BODY_WEIGHT
      case Field.PERCENT:
        return MeasurementInput.PERCENT
      case Field.INCHES:
        return MeasurementInput.INCHES
      case Field.LBS:
        return MeasurementInput.LBS
      case Field.NUMBER:
        return MeasurementInput.NUMBER
      default:
        throw new Error(`No input mapped for field: ${field}`)
    }
  }

  static getFieldForInput(input: ExerciseInput | MeasurementInput) {
    switch (input) {
      case ExerciseInput.REPS:
        return Field.REPS
      case ExerciseInput.WEIGHT:
        return Field.WEIGHT
      case ExerciseInput.DISTANCE:
        return Field.DISTANCE
      case ExerciseInput.DURATION:
        return Field.DURATION
      case ExerciseInput.WATTS:
        return Field.WATTS
      case ExerciseInput.SPEED:
        return Field.SPEED
      case ExerciseInput.RESISTANCE:
        return Field.RESISTANCE
      case ExerciseInput.INCLINE:
        return Field.INCLINE
      case ExerciseInput.CALORIES:
        return Field.CALORIES
      case MeasurementInput.BODY_WEIGHT:
        return Field.BODY_WEIGHT
      case MeasurementInput.PERCENT:
        return Field.PERCENT
      case MeasurementInput.INCHES:
        return Field.INCHES
      case MeasurementInput.LBS:
        return Field.LBS
      case MeasurementInput.NUMBER:
        return Field.NUMBER
      default:
        throw new Error(`No field mapped for input: ${input}`)
    }
  }
}
