import Dexie, { liveQuery, type Table } from 'dexie'
import { Dark, uid } from 'quasar'
import { Duration } from '@/types/general'
import { AppDatabaseVersion, AppName } from '@/constants/global'
import {
  SettingKey,
  Field,
  RecordType,
  RecordGroup,
  type Log,
  type Setting,
  type AnyRecord,
  type AnyCoreRecord,
  type AnySubRecord,
  type LogLevel,
  type WorkoutRecord,
  type WorkoutResultRecord,
  type ExerciseRecord,
  type ExerciseResultRecord,
  ExerciseInput,
  exerciseDataFields,
} from '@/types/core'
import DataSchema from '@/services/DataSchema'
import { getDurationFromMilliseconds } from '@/utils/common'

class Database extends Dexie {
  // Required for easier TypeScript usage
  Logs!: Table<Log>
  Settings!: Table<Setting>
  CoreRecords!: Table<AnyCoreRecord>
  SubRecords!: Table<AnySubRecord>

  constructor(name: string) {
    super(name)

    this.version(1).stores({
      Logs: `++${Field.AUTO_ID}`,
      Settings: `&${Field.KEY}`,
      CoreRecords: `&${Field.ID}, ${Field.TYPE}`,
      SubRecords: `&${Field.ID}, ${Field.TYPE}, ${Field.CORE_ID}`,
      ActiveWorkout: `&${Field.CORE_ID}`,
    })
  }

  //
  // LOGS
  //

  async getLogs() {
    return await this.Logs.toArray()
  }

  async getLog(autoId: number) {
    return await this.Logs.get(autoId)
  }

  async addLog(logLevel: LogLevel, logLabel: string, details?: any) {
    const log: Log = {
      // Auto Id handled by Dexie
      timestamp: Date.now(),
      logLevel,
      logLabel,
    }

    // Remaining properties determined by details
    if (details && typeof details === 'object') {
      if ('message' in details || 'stack' in details) {
        // An object with a message or stack property is a JS Error
        log.errorMessage = details?.message
        log.stackTrace = details?.stack
      } else {
        // Should be safe to store most other objects into the details property
        // Details only used with non-error logs
        log.details = details
      }
    }

    return await this.Logs.add(log)
  }

  async deleteExpiredLogs() {
    const logDuration = (await this.Settings.get(SettingKey.LOG_RETENTION_DURATION))
      ?.value as Duration

    if (!logDuration || logDuration === Duration.Forever) {
      return 0 // No logs purged
    }

    const logs = await this.Logs.toArray()

    // Find Logs that are older than the retention time and map them to their keys
    const removableLogs = logs
      .filter((log: Log) => {
        const logTimestamp = log.timestamp ?? 0
        const logAge = Date.now() - logTimestamp
        return logAge > logDuration
      })
      .map((log: Log) => log.autoId as number) // Map remaining Log ids for removal

    await this.Logs.bulkDelete(removableLogs)

    return removableLogs.length // Number of logs deleted
  }

  //
  // SETTINGS
  //

  async getSettings() {
    return await this.Settings.toArray()
  }

  async getSetting(key: SettingKey) {
    return await this.Settings.get(key)
  }

  async initSettings() {
    const defaultSettings: Readonly<{
      [key in SettingKey]: any
    }> = {
      [SettingKey.USER_HEIGHT_INCHES]: null,
      [SettingKey.WELCOME_OVERLAY]: true,
      [SettingKey.DASHBOARD_DESCRIPTIONS]: true,
      [SettingKey.DARK_MODE]: true,
      [SettingKey.CONSOLE_LOGS]: false,
      [SettingKey.INFO_MESSAGES]: true,
      [SettingKey.LOG_RETENTION_DURATION]: Duration['Three Months'],
    }

    const keys = Object.values(SettingKey)

    const settings = await Promise.all(
      keys.map(async (key) => {
        const setting = await this.Settings.get(key)

        if (setting) {
          return setting
        } else {
          return { key, value: defaultSettings[key] }
        }
      })
    )

    Dark.set(Boolean(settings.find((s) => s.key === SettingKey.DARK_MODE)?.value))

    await Promise.all(settings.map((s) => this.setSetting(s.key as SettingKey, s.value)))
  }

  async setSetting(key: SettingKey, value: any) {
    if (key === SettingKey.DARK_MODE) {
      Dark.set(Boolean(value))
    }

    const currentSetting = await this.Settings.get(key)

    if (!currentSetting) {
      return await this.Settings.add({ key, value })
    } else {
      return await this.Settings.update(key, { value })
    }
  }

  //
  // ACTIVE WORKOUT
  //

  async beginWorkout(workoutCoreRecord: WorkoutRecord) {
    const activeExerciseResultIds = await Promise.all(
      workoutCoreRecord.exerciseIds.map(async (exerciseId) => {
        return await this.createActiveExerciseResult(exerciseId)
      })
    )

    const newWorkoutResult: WorkoutResultRecord = {
      active: true,
      id: uid(),
      type: RecordType.WORKOUT,
      timestamp: Date.now(),
      coreId: workoutCoreRecord.id,
      note: '',
      exerciseResultIds: activeExerciseResultIds,
      finishedTimestamp: undefined,
    }

    // Setting core workout to active
    workoutCoreRecord.active = true
    await DB.putRecord(RecordGroup.CORE, RecordType.WORKOUT, workoutCoreRecord)

    // Setting core exercises to active
    await Promise.all(
      workoutCoreRecord.exerciseIds.map(async (id) => {
        const exercise = (await DB.getRecord(RecordGroup.CORE, id)) as AnyCoreRecord
        exercise.active = true
        return await DB.putRecord(RecordGroup.CORE, RecordType.EXERCISE, exercise)
      })
    )

    await DB.addRecord(RecordGroup.SUB, RecordType.WORKOUT, newWorkoutResult)
  }

  async createActiveExerciseResult(id: string) {
    const coreExercise = (await this.CoreRecords.get(id)) as ExerciseRecord

    const activeExerciseResult = {
      active: true,
      id: uid(),
      type: RecordType.EXERCISE,
      timestamp: Date.now(),
      coreId: id,
      note: '',
      // Data omitted
    } as any

    const inputFields = coreExercise.exerciseInputs.map((input) =>
      DataSchema.getFieldForInput(input)
    ) as Field[]

    // Only include data fields if there are inputs
    if (inputFields.length > 0) {
      exerciseDataFields.forEach((field) => {
        if (inputFields.includes(field)) {
          activeExerciseResult[field] = [] // Need to set with one undefined in active workout
        }
      })
    }

    await this.addRecord(RecordGroup.SUB, RecordType.EXERCISE, activeExerciseResult)

    return activeExerciseResult.id
  }

  async getExerciseInputDefaults(coreId: string) {
    // return (await this.CoreRecords.where(Field.ID).equals(coreId).toArray()).map((r) => {
    //   return {
    //     reps: r.exerciseInputs.includes(ExerciseInput.REPS) ? [0] : null,
    //     weightLbs: r.exerciseInputs.includes(ExerciseInput.WEIGHT) ? [0] : null,
    //     distanceMiles: r.exerciseInputs.includes(ExerciseInput.DISTANCE) ? [0] : null,
    //     durationMinutes: r.exerciseInputs.includes(ExerciseInput.DURATION) ? [0] : null,
    //     watts: r.exerciseInputs.includes(ExerciseInput.WATTS) ? [0] : null,
    //     speedMph: r.exerciseInputs.includes(ExerciseInput.SPEED) ? [0] : null,
    //     calories: r.exerciseInputs.includes(ExerciseInput.CALORIES) ? [0] : null,
    //     resistance: r.exerciseInputs.includes(ExerciseInput.RESISTANCE) ? [0] : null,
    //   }
    // })
  }

  async getActiveRecords() {
    const activeCoreRecords = await this.CoreRecords.filter((p) => p.active === true).toArray()
    const activeSubRecords = await this.SubRecords.filter((p) => p.active === true).toArray()
    return {
      core: activeCoreRecords,
      sub: activeSubRecords,
      count: activeCoreRecords.length + activeSubRecords.length,
    }
  }

  async discardActiveRecords() {
    const activeRecords = await this.getActiveRecords()
    activeRecords.core.forEach((cr) => (cr.active = false))

    // Sub records are deleted if the active workout is abandoned
    await Promise.all(
      activeRecords.sub.map(async (sr) => await this.deleteRecord(RecordGroup.SUB, sr.id))
    )

    // Core records are retained with active set back to false
    await Promise.all(
      activeRecords.core.map(async (cr) => await this.putRecord(RecordGroup.CORE, cr.type, cr))
    )
  }

  async keepActiveRecords() {
    const activeRecords = await this.getActiveRecords()
    activeRecords.core.forEach((cr) => (cr.active = false))
    activeRecords.sub.forEach((sr) => (sr.active = false))

    // Add the finished timestamp to the workout record
    const workoutResultIndex = activeRecords.sub.findIndex((cr) => cr.type === RecordType.WORKOUT)
    activeRecords.sub[workoutResultIndex].finishedTimestamp = Date.now()

    // Core records updated last so there last sub value is accurate
    await Promise.all(
      activeRecords.sub.map(async (sr) => await this.putRecord(RecordGroup.SUB, sr.type, sr))
    )
    await Promise.all(
      activeRecords.core.map(async (cr) => await this.putRecord(RecordGroup.CORE, cr.type, cr))
    )
  }

  //
  // LIVE QUERIES
  //

  liveLogs() {
    return liveQuery(() => this.Logs.orderBy(Field.AUTO_ID).reverse().toArray())
  }

  liveSettings() {
    return liveQuery(() => this.Settings.orderBy(Field.KEY).toArray())
  }

  liveCoreRecords(type: RecordType) {
    return liveQuery(() =>
      this.CoreRecords.where(Field.TYPE)
        .equals(type)
        .and((r) => r.active !== true)
        .sortBy(Field.NAME)
    )
  }

  liveSubRecords(type: RecordType) {
    return liveQuery(async () =>
      (
        await this.SubRecords.where(Field.TYPE)
          .equals(type)
          .and((r) => r.active !== true)
          .sortBy(Field.TIMESTAMP)
      ).reverse()
    )
  }

  liveDashboard() {
    return liveQuery(async () => {
      const parents = await this.CoreRecords.filter((p) => p.enabled === true).sortBy(Field.NAME)

      const active: AnyCoreRecord[] = []
      const favorites: AnyCoreRecord[] = []
      const nonFavorites: AnyCoreRecord[] = []

      // TODO - Calculate previous data for each record?
      parents.forEach((p) => {
        if (p.active) {
          active.push(p)
        } else if (p.favorited === true) {
          favorites.push(p)
        } else {
          nonFavorites.push(p)
        }
      })

      return Object.values(RecordType).reduce((acc, type) => {
        acc[type] = [
          ...active.filter((p) => p.type === type),
          ...favorites.filter((p) => p.type === type),
          ...nonFavorites.filter((p) => p.type === type),
        ]
        return acc
      }, {} as { [key in RecordType]: AnyCoreRecord[] })
    })
  }

  //
  // GETS
  //

  async getAllCoreRecords() {
    return await this.CoreRecords.toArray()
  }

  async getAllSubRecords() {
    return await this.SubRecords.toArray()
  }

  async getRecords(group: RecordGroup, type: RecordType) {
    if (group === RecordGroup.CORE) {
      return await this.CoreRecords.where(Field.TYPE).equals(type).sortBy(Field.NAME)
    } else {
      return (
        await this.SubRecords.where(Field.TYPE).equals(type).sortBy(Field.TIMESTAMP)
      ).reverse()
    }
  }

  async getRecord(group: RecordGroup, id: string) {
    if (group === RecordGroup.CORE) {
      return await this.CoreRecords.get(id)
    } else {
      return await this.SubRecords.get(id)
    }
  }

  async getCoreSubRecords(coreId: string) {
    return await this.SubRecords.where(Field.CORE_ID).equals(coreId).sortBy(Field.TIMESTAMP)
  }

  async getLastSubRecord(coreId: string) {
    return (
      await this.SubRecords.where(Field.CORE_ID).equals(coreId).sortBy(Field.TIMESTAMP)
    ).reverse()[0]
  }

  // TODO
  async getPreviousRecordData(coreId: string) {
    const previousOrderedRecords = (
      await this.SubRecords.where(Field.CORE_ID).equals(coreId).sortBy(Field.TIMESTAMP)
    ).reverse()

    const previousData = {
      // last sub timestamp
      // last sub note
      // last workout duration (finished timestamp - timestamp)
      // measurement data hint short
      // measurement data hint long
      // exercise data hint short
      // exercise data hint long
    }

    if (previousOrderedRecords.length > 0) {
      if (previousOrderedRecords[0].type === RecordType.WORKOUT) {
        return previousOrderedRecords[0].note
      }
    } else {
      return 'No previous records'
    }
  }

  // getPreviousHint(records: AnySubRecord[], field: Field) {
  //   const values: number[] = []

  //   // Loop through the previousRecords array to extract the weights for the first set
  //   for (let i = 0; i < 6; i++) {
  //     const previousSet1Weight = records[i]?.weight?.[0]
  //     // Check if a weight exists for the current record
  //     if (previousSet1Weight) {
  //       // Add the weight to the weights array
  //       weights.push(previousSet1Weight)
  //     }
  //   }

  //   // Initialize the firstStr and incrementStr variables
  //   let firstStr = '-'
  //   let incrementStr = ''

  //   // Loop through the weights array to calculate the increments
  //   for (let i = 0; i < weights.length; i++) {
  //     const currentWeight = weights[i]
  //     const previousWeight = weights[i + 1]

  //     // Check if it's the first weight, set it as the firstStr
  //     if (i === 0) {
  //       firstStr = `${currentWeight}`
  //     } else {
  //       // Append the difference between the current weight and the previous weight to the incrementStr
  //       incrementStr += `, ${currentWeight - previousWeight}`
  //     }
  //   }

  //   // If there are increments, return the firstStr concatenated with the incrementStr,
  //   // otherwise, return just the firstStr
  //   return incrementStr ? `${firstStr}${incrementStr}` : firstStr
  // }

  //
  // CREATES
  //

  async addRecord(group: RecordGroup, type: RecordType, record: AnyRecord) {
    const schema = DataSchema.getSchema(group, type)

    if (group === RecordGroup.CORE) {
      const newRecord = schema.parse(record) as AnyCoreRecord
      const result = await this.CoreRecords.add(newRecord)
      await this.updatePreviousData(newRecord.id)
      return result
    } else {
      const newRecord = schema.parse(record) as AnySubRecord
      const result = await this.SubRecords.add(newRecord)
      await this.updatePreviousData(newRecord.coreId)
      return result
    }
  }

  async importRecords(group: RecordGroup, records: AnyRecord[]) {
    const validRecords: AnyRecord[] = []
    const skippedRecords: AnyRecord[] = []

    for await (const r of records) {
      const schema = DataSchema.getSchema(group, r.type)

      if (schema && schema.safeParse(r).success) {
        validRecords.push(schema.parse(r) as AnyRecord)
      } else {
        skippedRecords.push(r)
      }
    }

    if (group === RecordGroup.CORE) {
      await this.CoreRecords.bulkAdd(validRecords as AnyCoreRecord[])
    } else {
      await this.SubRecords.bulkAdd(validRecords as AnySubRecord[])
    }

    // Update previous data for all core records
    const coreRecords = await this.CoreRecords.toArray()
    await Promise.all(coreRecords.map(async (cr) => await this.updatePreviousData(cr.id)))

    if (skippedRecords.length > 0) {
      // Error for the frontend to report if any records were skipped
      throw new Error(
        `Records skipped due to validation failures (${
          skippedRecords.length
        }): ${skippedRecords.map((r) => String(r.id))}`
      )
    }
  }

  //
  // UPDATES
  //

  async putRecord(group: RecordGroup, type: RecordType, record: AnyRecord) {
    const schema = DataSchema.getSchema(group, type)

    if (group === RecordGroup.CORE) {
      const result = await this.CoreRecords.put(schema.parse(record) as AnyCoreRecord)
      await this.updatePreviousData(record.id)
      return result
    } else {
      const result = await this.SubRecords.put(schema.parse(record) as AnySubRecord)
      await this.updatePreviousData(record.coreId)
      return result
    }
  }

  async updatePreviousData(coreId: string) {
    const previousRecords = (
      await this.SubRecords.where(Field.CORE_ID).equals(coreId).sortBy(Field.TIMESTAMP)
    ).reverse()

    const previous = {} as any

    if (previousRecords.length > 0) {
      // Shared
      previous[Field.TIMESTAMP] = previousRecords[0][Field.TIMESTAMP]
      previous[Field.NOTE] = previousRecords[0][Field.NOTE]
      // Workout
      previous[Field.WORKOUT_DURATION] = previousRecords[0][Field.FINISHED_TIMESTAMP]
        ? getDurationFromMilliseconds(
            previousRecords[0][Field.FINISHED_TIMESTAMP] - previousRecords[0][Field.TIMESTAMP]
          )
        : undefined
      // Exercise val?.join(', ') || '-'
      previous[Field.REPS] = previousRecords[0][Field.REPS]
        ? previousRecords[0][Field.REPS]?.join(', ') || undefined
        : undefined
      previous[Field.WEIGHT] = previousRecords[0][Field.WEIGHT]
        ? previousRecords[0][Field.WEIGHT]?.join(', ') || undefined
        : undefined
      previous[Field.DISTANCE] = previousRecords[0][Field.DISTANCE]
        ? previousRecords[0][Field.DISTANCE]?.join(', ') || undefined
        : undefined
      previous[Field.DURATION] = previousRecords[0][Field.DURATION]
        ? previousRecords[0][Field.DURATION]?.join(', ') || undefined
        : undefined
      previous[Field.WATTS] = previousRecords[0][Field.WATTS]
        ? previousRecords[0][Field.WATTS]?.join(', ') || undefined
        : undefined
      previous[Field.SPEED] = previousRecords[0][Field.SPEED]
        ? previousRecords[0][Field.SPEED]?.join(', ') || undefined
        : undefined
      previous[Field.RESISTANCE] = previousRecords[0][Field.RESISTANCE]
        ? previousRecords[0][Field.RESISTANCE]?.join(', ') || undefined
        : undefined
      previous[Field.INCLINE] = previousRecords[0][Field.INCLINE]
        ? previousRecords[0][Field.INCLINE]?.join(', ') || undefined
        : undefined
      previous[Field.CALORIES] = previousRecords[0][Field.CALORIES]
        ? previousRecords[0][Field.CALORIES]?.join(', ') || undefined
        : undefined
      // Measurement
      previous[Field.BODY_WEIGHT] = previousRecords[0][Field.BODY_WEIGHT]
        ? `${previousRecords[0][Field.BODY_WEIGHT]} lbs`
        : undefined
      previous[Field.PERCENT] = previousRecords[0][Field.PERCENT]
        ? `${previousRecords[0][Field.PERCENT]}%`
        : undefined
      previous[Field.INCHES] = previousRecords[0][Field.INCHES]
        ? `${previousRecords[0][Field.INCHES]} in`
        : undefined
      previous[Field.LBS] = previousRecords[0][Field.LBS]
        ? `${previousRecords[0][Field.LBS]} lbs`
        : undefined
      previous[Field.NUMBER] = previousRecords[0][Field.NUMBER]
        ? `${previousRecords[0][Field.NUMBER]}`
        : undefined
    }

    return await this.CoreRecords.update(coreId, { previous })
  }

  async updateAllPreviousData() {
    const coreRecords = await this.CoreRecords.toArray()
    return await Promise.all(coreRecords.map((cr) => this.updatePreviousData(cr.id)))
  }

  //
  // DELETES
  //

  async deleteRecord(group: RecordGroup, id: string) {
    const recordToDelete = (await this.getRecord(group, id)) as AnyRecord | undefined

    if (!recordToDelete) {
      throw new Error(`No record found to delete with: ${group}, ${id}`)
    }

    if (group === RecordGroup.CORE) {
      await this.CoreRecords.delete(id)
      await this.SubRecords.where(Field.CORE_ID).equals(id).delete()
    } else {
      await this.SubRecords.delete(id)
      await this.updatePreviousData(recordToDelete.coreId)
    }

    return recordToDelete
  }

  async clearRecordsByType(group: RecordGroup, type: RecordType) {
    if (group === RecordGroup.CORE) {
      await this.CoreRecords.where(Field.TYPE).equals(type).delete()
      return await this.SubRecords.where(Field.TYPE).equals(type).delete()
    } else {
      await this.SubRecords.where(Field.TYPE).equals(type).delete()
      const parentsToUpdate = await this.CoreRecords.where(Field.TYPE).equals(type).toArray()
      return await Promise.all(
        parentsToUpdate.map((r) => this.CoreRecords.update(r.id, { lastChild: undefined }))
      )
    }
  }

  async clearLogs() {
    return await this.Logs.clear()
  }

  async clearSettings() {
    await this.Settings.clear()
    return await this.initSettings()
  }

  async clearAll() {
    await this.Logs.clear()
    await this.Settings.clear()
    await this.CoreRecords.clear()
    await this.SubRecords.clear()
    return await this.initSettings()
  }

  // Deletes entire database. Require app reload to reinitialize the database.
  async deleteDatabase() {
    return await this.delete()
  }
}

/**
 * Use this preconfigured Database instance. Do NOT create another one!
 */
const DB = new Database(`${AppName} v${AppDatabaseVersion}`)

export default DB
