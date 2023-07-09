import Dexie, { liveQuery, type Table } from 'dexie'
import { Dark, extend, uid } from 'quasar'
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
  type ExerciseRecord,
  type PreviousData,
  type ActiveWorkoutRecord,
} from '@/types/core'
import DataSchema from '@/services/DataSchema'
import { getDurationFromMilliseconds } from '@/utils/common'

class Database extends Dexie {
  // Required for easier TypeScript usage
  Logs!: Table<Log>
  Settings!: Table<Setting>
  CoreRecords!: Table<AnyCoreRecord>
  SubRecords!: Table<AnySubRecord>
  ActiveWorkout!: Table<ActiveWorkoutRecord>

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

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //     Logs                                                                //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////

  async getLogs() {
    return await this.Logs.toArray()
  }

  async getLog(autoId: number) {
    return await this.Logs.get(autoId)
  }

  async addLog(logLevel: LogLevel, logLabel: string, details?: any) {
    const log: Log = {
      // Auto Id handled by Dexie
      createdTimestamp: Date.now(),
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

    return await this.Logs.add(extend(true, {}, log))
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
        const logTimestamp = log.createdTimestamp ?? 0
        const logAge = Date.now() - logTimestamp
        return logAge > logDuration
      })
      .map((log: Log) => log.autoId as number) // Map remaining Log ids for removal

    await this.Logs.bulkDelete(removableLogs)

    return removableLogs.length // Number of logs deleted
  }

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //     Settings                                                            //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //     Active Workout                                                      //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////

  async getActiveRecords() {
    return await this.CoreRecords.filter((p) => p.active === true).toArray()
  }

  async getActiveWorkout() {
    return (await this.ActiveWorkout.toArray())[0]
  }

  async beginWorkout(workoutCoreRecord: WorkoutRecord) {
    const activeWorkout: ActiveWorkoutRecord = {
      name: workoutCoreRecord.name,
      coreId: workoutCoreRecord.id,
      createdTimestamp: Date.now(),
      exercises: await Promise.all(
        workoutCoreRecord.exerciseIds.map(async (id) => {
          const exercise = (await this.getRecord(RecordGroup.CORE, id)) as ExerciseRecord

          return {
            name: exercise.name,
            desc: exercise.desc,
            coreId: exercise.id,
            exerciseInputs: exercise.exerciseInputs,
            exerciseSets: [
              exercise.exerciseInputs.reduce((acc, input) => {
                acc[DataSchema.getFieldForInput(input)] = undefined
                return acc
              }, {} as { [key in Field]: number | undefined }),
            ],
          }
        })
      ),
    }

    // Set core records being used to active
    await this.CoreRecords.update(workoutCoreRecord.id, { active: true })
    await Promise.all(
      activeWorkout.exercises.map(async (e) => {
        await this.CoreRecords.update(e.coreId, { active: true })
      })
    )

    await this.ActiveWorkout.add(activeWorkout)
  }

  async discardActiveWorkout() {
    const activeRecords = await this.getActiveRecords()
    activeRecords.forEach((r) => (r.active = false))

    // Core records are retained with active set back to false
    await Promise.all(
      activeRecords.map(async (r) => await this.putRecord(RecordGroup.CORE, r.type, r))
    )

    await this.ActiveWorkout.clear()
  }

  async finishActiveWorkout() {
    const activeRecords = await this.getActiveRecords()
    activeRecords.forEach((r) => (r.active = false))

    // Core records are retained with active set back to false
    await Promise.all(
      activeRecords.map(async (r) => await this.putRecord(RecordGroup.CORE, r.type, r))
    )

    // TODO - Make result records based on ActiveWorkoutRecord

    await this.ActiveWorkout.clear()
  }

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //     Live Queries                                                        //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////

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
          .sortBy(Field.CREATED_TIMESTAMP)
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

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //     Gets                                                                //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////

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
        await this.SubRecords.where(Field.TYPE).equals(type).sortBy(Field.CREATED_TIMESTAMP)
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
    return await this.SubRecords.where(Field.CORE_ID).equals(coreId).sortBy(Field.CREATED_TIMESTAMP)
  }

  async getLastSubRecord(coreId: string) {
    return (
      await this.SubRecords.where(Field.CORE_ID).equals(coreId).sortBy(Field.CREATED_TIMESTAMP)
    ).reverse()[0]
  }

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //     Creates                                                             //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //     Updates                                                             //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////

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
    const previousRecord = (
      await this.SubRecords.where(Field.CORE_ID).equals(coreId).sortBy(Field.CREATED_TIMESTAMP)
    ).reverse()[0]

    const previous: PreviousData = {}

    if (previousRecord) {
      // Shared
      previous.createdTimestamp = previousRecord.createdTimestamp
      previous.note = previousRecord.note
      // Workout
      previous.workoutDuration = previousRecord.finishedTimestamp
        ? getDurationFromMilliseconds(
            previousRecord.finishedTimestamp - previousRecord.createdTimestamp
          )
        : undefined
      // Exercise
      previous.exerciseSets = previousRecord.exerciseSets
      // Measurement
      previous.bodyWeight = previousRecord.bodyWeight
      previous.percent = previousRecord.percent
      previous.inches = previousRecord.inches
      previous.lbs = previousRecord.lbs
      previous.number = previousRecord.number
    }

    return await this.CoreRecords.update(coreId, { previous })
  }

  async updateAllPreviousData() {
    const coreRecords = await this.CoreRecords.toArray()
    return await Promise.all(coreRecords.map((cr) => this.updatePreviousData(cr.id)))
  }

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //     Deletes                                                             //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////

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
    await this.ActiveWorkout.clear()
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
