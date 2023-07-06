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
  type ExerciseRecord,
  type ExerciseResultRecord,
} from '@/types/core'
import DataSchema from '@/services/DataSchema'

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
  // RECORD GETS
  //

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

  //
  // RECORD CREATES
  //

  // TODO - Fix
  async createActiveExerciseResultRecord(id: string) {
    // const coreExercise = (await this.CoreRecords.get(id)) as ExerciseRecord
    // const activeExerciseResult: ExerciseResultRecord = {
    //   active: true,
    //   id: uid(),
    //   type: RecordType.EXERCISE,
    //   timestamp: Date.now(),
    //   coreId: id,
    //   note: '',
    //   setsData: {},
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.REPS)) {
    //   activeExerciseResult.setsData.reps = [0]
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.WEIGHT)) {
    //   activeExerciseResult.setsData.weightLbs = [0]
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.DISTANCE)) {
    //   activeExerciseResult.setsData.distanceMiles = [0]
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.DURATION)) {
    //   activeExerciseResult.setsData.durationMinutes = [0]
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.WATTS)) {
    //   activeExerciseResult.setsData.watts = [0]
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.SPEED)) {
    //   activeExerciseResult.setsData.speedMph = [0]
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.CALORIES)) {
    //   activeExerciseResult.setsData.calories = [0]
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.RESISTANCE)) {
    //   activeExerciseResult.setsData.resistance = [0]
    // }
    // if (coreExercise.exerciseInputs.includes(ExerciseInput.INCLINE)) {
    //   activeExerciseResult.setsData.incline = [0]
    // }
    // await this.addRecord(RecordGroup.SUB, RecordType.EXERCISE, activeExerciseResult)
    // return activeExerciseResult.id
  }

  async addRecord(group: RecordGroup, type: RecordType, record: AnyRecord) {
    const schema = DataSchema.getSchema(group, type)

    if (group === RecordGroup.CORE) {
      const newRecord = schema.parse(record) as AnyCoreRecord
      const result = await this.CoreRecords.add(newRecord)
      await this.updateLastSub(newRecord.id)
      return result
    } else {
      const newRecord = schema.parse(record) as AnySubRecord
      const result = await this.SubRecords.add(newRecord)
      await this.updateLastSub(newRecord.coreId)
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

    await this.updateAllLastSub()

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
  // RECORD UPDATES
  //

  async discardActiveRecords() {
    const activeRecords = await this.getActiveRecords()
    activeRecords.core.forEach((cr) => (cr.active = false))

    // Sub records are deleted if the active workout is abandoned
    await Promise.all(
      activeRecords.sub.map(async (sr) => await this.deleteRecord(RecordGroup.SUB, sr.id))
    )

    // Core records are retained with active set back to false
    await Promise.all(
      activeRecords.core.map(
        async (cr) => await this.updateRecord(RecordGroup.CORE, cr.type, cr.id, cr)
      )
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
      activeRecords.sub.map(
        async (sr) => await this.updateRecord(RecordGroup.SUB, sr.type, sr.id, sr)
      )
    )
    await Promise.all(
      activeRecords.core.map(
        async (cr) => await this.updateRecord(RecordGroup.CORE, cr.type, cr.id, cr)
      )
    )
  }

  async updateRecord(group: RecordGroup, type: RecordType, id: string, updatedRecord: AnyRecord) {
    const schema = DataSchema.getSchema(group, type)

    if (group === RecordGroup.CORE) {
      const result = await this.CoreRecords.update(id, schema.parse(updatedRecord))
      await this.updateLastSub(id)
      return result
    } else {
      const result = await this.SubRecords.update(id, schema.parse(updatedRecord))
      await this.updateLastSub(updatedRecord.coreId)
      return result
    }
  }

  async updateLastSub(coreId: string) {
    const lastSub = (
      await this.SubRecords.where(Field.CORE_ID).equals(coreId).sortBy(Field.TIMESTAMP)
    ).reverse()[0]
    return await this.CoreRecords.update(coreId, { lastSub })
  }

  /**
   * - Call after imports to update the lastSub property of all core records
   */
  async updateAllLastSub() {
    const coreRecords = await this.CoreRecords.toArray()
    return await Promise.all(coreRecords.map((p) => this.updateLastSub(p.id)))
  }

  //
  // RECORD DELETES
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
      await this.updateLastSub(recordToDelete.coreId)
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
