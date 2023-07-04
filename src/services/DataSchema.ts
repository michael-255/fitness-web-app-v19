import { Icon } from '@/types/general'
import { defineAsyncComponent } from 'vue'
import {
  type RecordProps,
  type RecordGroup,
  type RecordType,
  recordGroups,
  recordTypes,
  workoutSchema,
  workoutResultSchema,
  exerciseSchema,
  exerciseResultSchema,
  measurementSchema,
  measurementResultSchema,
} from '@/types/core'
import {
  exerciseColumns,
  exerciseResultColumns,
  measurementColumns,
  measurementResultColumns,
  workoutColumns,
  workoutResultColumns,
} from '@/services/table-columns'

export default class DataSchema {
  private static recordProps: RecordProps[] = [
    {
      type: recordTypes.Values.workout,
      group: recordGroups.Values.core,
      icon: Icon.WORKOUTS,
      singular: 'Workout',
      plural: 'Workouts',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldName.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldDesc.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldExerciseIds.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldEnabled.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldFavorited.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldActive.vue')),
      ],
      tableColumns: workoutColumns,
      schema: workoutSchema,
    },
    {
      type: recordTypes.Values.workout,
      group: recordGroups.Values.sub,
      icon: Icon.WORKOUTS,
      singular: 'Workout Result',
      plural: 'Workout Results',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCoreId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldExerciseResultIds.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldFinishedTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldNote.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldActive.vue')),
      ],
      tableColumns: workoutResultColumns,
      schema: workoutResultSchema,
    },
    {
      type: recordTypes.Values.exercise,
      group: recordGroups.Values.core,
      icon: Icon.EXERCISES,
      singular: 'Exercise',
      plural: 'Exercises',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldName.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldDesc.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldExerciseInputs.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldEnabled.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldFavorited.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldMultipleSets.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldActive.vue')),
      ],
      tableColumns: exerciseColumns,
      schema: exerciseSchema,
    },
    {
      type: recordTypes.Values.exercise,
      group: recordGroups.Values.sub,
      icon: Icon.EXERCISES,
      singular: 'Exercise Result',
      plural: 'Exercise Results',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldCoreId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldSets.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldNote.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldActive.vue')),
      ],
      tableColumns: exerciseResultColumns,
      schema: exerciseResultSchema,
    },
    {
      type: recordTypes.Values.measurement,
      group: recordGroups.Values.core,
      icon: Icon.MEASUREMENTS,
      singular: 'Measurement',
      plural: 'Measurements',
      charts: [],
      fields: [
        defineAsyncComponent(() => import('@/components/fields/FieldId.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldName.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldDesc.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldMeasurementInput.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldEnabled.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldFavorited.vue')),
      ],
      tableColumns: measurementColumns,
      schema: measurementSchema,
    },
    {
      type: recordTypes.Values.measurement,
      group: recordGroups.Values.sub,
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
        defineAsyncComponent(() => import('@/components/fields/FieldTimestamp.vue')),
        defineAsyncComponent(() => import('@/components/fields/FieldNote.vue')),
      ],
      tableColumns: measurementResultColumns,
      schema: measurementResultSchema,
    },
  ]

  private static logFields: ReturnType<typeof defineAsyncComponent>[] = [
    defineAsyncComponent(() => import('@/components/fields/FieldAutoId.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldTimestamp.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldLogLevel.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldLogLabel.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldDetails.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldErrorMessage.vue')),
    defineAsyncComponent(() => import('@/components/fields/FieldStackTrace.vue')),
  ]

  static getLogFields() {
    return this.logFields
  }

  static getAllOptions(): {
    value: { type: RecordType; group: RecordGroup }
    label: string
    icon: Icon
  }[] {
    return this.recordProps.map((p) => ({
      value: {
        type: p.type,
        group: p.group,
      },
      label: p.plural,
      icon: p.icon,
    }))
  }

  static getGroupOptions(group: RecordGroup): {
    value: { type: RecordType; group: RecordGroup }
    label: string
    icon: Icon
  }[] {
    return this.recordProps
      .filter((p) => p.group === group)
      .map((p) => ({
        value: {
          type: p.type,
          group: p.group,
        },
        label: p.plural,
        icon: p.icon,
      }))
  }

  static getDashboardOptions(): {
    value: RecordType
    label: string
    icon: Icon
  }[] {
    return this.recordProps
      .filter((p) => p.group === recordGroups.Values.core)
      .map((p) => ({
        value: p.type,
        label: p.plural,
        icon: p.icon,
      }))
  }

  static getLabel(group: RecordGroup, type: RecordType, style: 'singular' | 'plural') {
    return this.recordProps.find((p) => p.group === group && p.type === type)?.[style]
  }

  static getTableColumns(group: RecordGroup, type: RecordType) {
    return this.recordProps.find((p) => p.group === group && p.type === type)?.tableColumns ?? []
  }

  static getSchema(group: RecordGroup, type: RecordType) {
    return this.recordProps.find((p) => p.group === group && p.type === type)?.schema
  }

  static getFields(group: RecordGroup, type: RecordType) {
    return this.recordProps.find((p) => p.group === group && p.type === type)?.fields ?? []
  }

  static getCharts(type: RecordType) {
    return (
      this.recordProps.find((p) => p.group === recordGroups.Values.core && p.type === type)
        ?.charts ?? []
    )
  }
}
