<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue'
import { RouterView } from 'vue-router'
import { AppHeaderColor } from '@/constants/global'
import { Icon, RouteName } from '@/types/general'
import { RecordType } from '@/types/core'
import { getDurationFromMilliseconds } from '@/utils/common'
import { useInterval } from '@vueuse/core'
import DB from '@/services/Database'

const counter = useInterval(1000)
const workoutDuration: Ref<string> = ref('')
const workoutName: Ref<string> = ref('')
const workoutResultTimestamp: Ref<number> = ref(Date.now())

onMounted(async () => {
  const activeRecords = await DB.getActiveRecords()

  workoutName.value = activeRecords.core.find((r) => r.type === RecordType.WORKOUT)?.name ?? ''
  workoutResultTimestamp.value =
    activeRecords.sub.find((r) => r.type === RecordType.WORKOUT)?.createdTimestamp ?? Date.now()
})

watch(counter, () => {
  workoutDuration.value = getDurationFromMilliseconds(Date.now() - workoutResultTimestamp.value)
})
</script>

<template>
  <QLayout view="hHh LpR fFf">
    <QHeader elevated :class="`bg-${AppHeaderColor}`">
      <QToolbar>
        <QToolbarTitle class="q-ml-xs">{{ workoutName }}</QToolbarTitle>
        <QBtn flat round :icon="Icon.BACK" :to="{ name: RouteName.DASHBOARD }" />
      </QToolbar>
    </QHeader>

    <QPageContainer>
      <RouterView v-slot="{ Component, route }">
        <transition name="global-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </RouterView>
    </QPageContainer>

    <QFooter elevated class="bg-primary">
      <QToolbar>
        <QSpace />
        <QIcon :name="Icon.STOPWATCH" size="sm" class="q-mr-sm" />
        <div class="text-h6">{{ workoutDuration }}</div>
        <QSpace />
      </QToolbar>
    </QFooter>
  </QLayout>
</template>
