import {
  idSchema,
  recordTypeSchema,
  type RecordGroup,
  type RecordType,
  recordGroupSchema,
} from '@/types/core'
import { useRoute, useRouter, type Router, type RouteLocationNormalizedLoaded } from 'vue-router'
import { RouteName } from '@/types/general'
import useLogger from '@/composables/useLogger'

export default function useRoutables(): {
  route: RouteLocationNormalizedLoaded
  router: Router
  routeId?: string
  routeCoreId?: string
  routeType?: RecordType
  routeGroup?: RecordGroup
  goToDashboard: () => void
  goToActiveWorkout: () => void
  goToLogsData: () => void
  goToRecordsData: (group: RecordGroup, type: RecordType) => void
  goToCreate: (group: RecordGroup, type: RecordType, coreId?: string) => void
  goToEdit: (group: RecordGroup, type: RecordType, id: string) => void
  goBack: () => void
} {
  const route = useRoute()
  const router = useRouter()
  const { log } = useLogger()

  // Possible route params
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const coreId = Array.isArray(route.params.coreId) ? route.params.coreId[0] : route.params.coreId
  const type = Array.isArray(route.params.type) ? route.params.type[0] : route.params.type
  const group = Array.isArray(route.params.group) ? route.params.group[0] : route.params.group

  // Cleaned route params
  const routeId = idSchema.safeParse(id).success ? id : undefined
  const routeCoreId = idSchema.safeParse(coreId).success ? coreId : undefined
  const routeType = recordTypeSchema.safeParse(type).success ? (type as RecordType) : undefined
  const routeGroup = recordGroupSchema.safeParse(group).success ? (group as RecordGroup) : undefined

  function goToDashboard() {
    try {
      router.push({
        name: RouteName.DASHBOARD,
      })
    } catch (error) {
      log.error('Error accessing dashboard route', error)
    }
  }

  function goToActiveWorkout() {
    try {
      router.push({
        name: RouteName.ACTIVE_WORKOUT,
      })
    } catch (error) {
      log.error('Error accessing active workout route', error)
    }
  }

  function goToLogsData() {
    try {
      router.push({
        name: RouteName.DATA_LOGS,
      })
    } catch (error) {
      log.error('Error accessing logs data route', error)
    }
  }

  function goToRecordsData(group: RecordGroup, type: RecordType) {
    try {
      router.push({
        name: RouteName.DATA_RECORDS,
        params: { group, type },
      })
    } catch (error) {
      log.error('Error accessing records data route', error)
    }
  }

  function goToCreate(group: RecordGroup, type: RecordType, coreId?: string) {
    try {
      router.push({
        name: RouteName.CREATE,
        params: { group, type, coreId },
      })
    } catch (error) {
      log.error('Error accessing create route', error)
    }
  }

  function goToEdit(group: RecordGroup, type: RecordType, id: string) {
    try {
      router.push({
        name: RouteName.EDIT,
        params: { group, type, id },
      })
    } catch (error) {
      log.error('Error accessing edit route', error)
    }
  }

  /**
   * Go back if previous route state is part of the app history, otherwise go to Dashboard.
   */
  function goBack() {
    try {
      if (router?.options?.history?.state?.back) {
        router.back()
      } else {
        router.push({ name: RouteName.DASHBOARD })
      }
    } catch (error) {
      log.error('Error accessing go back route', error)
    }
  }

  return {
    route,
    router,
    routeId,
    routeCoreId,
    routeType,
    routeGroup,
    goToDashboard,
    goToActiveWorkout,
    goToLogsData,
    goToRecordsData,
    goToCreate,
    goToEdit,
    goBack,
  }
}
