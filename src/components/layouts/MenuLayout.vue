<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { AppHeaderColor, AppName } from '@/constants/global'
import { Icon, RouteName } from '@/types/general'
import { RecordGroup } from '@/types/core'
import useRoutables from '@/composables/useRoutables'
import useUIStore from '@/stores/ui'

const { goBack } = useRoutables()
const { goToRecordsData } = useRoutables()
const route = useRoute()
const uiStore = useUIStore()
</script>

<template>
  <QLayout view="hHh LpR lff">
    <!-- App Header Bar -->
    <QHeader elevated :class="`bg-${AppHeaderColor}`">
      <QToolbar>
        <QBtn flat round :icon="Icon.MENU_STANDARD" @click="uiStore.drawer = !uiStore.drawer" />

        <QToolbarTitle>{{ AppName }}</QToolbarTitle>

        <QBtn
          v-if="route.name !== RouteName.DASHBOARD"
          flat
          round
          :icon="Icon.BACK"
          @click="goBack()"
        />

        <!-- Dashboard Table Links -->
        <div v-else>
          <QBtn
            class="q-px-sm q-mr-sm"
            color="info"
            :icon="Icon.TABLE"
            @click="goToRecordsData(RecordGroup.CORE, uiStore.dashboardSelection)"
          />
          <QBtn
            class="q-px-sm"
            color="info"
            :icon="Icon.RESULTS"
            @click="goToRecordsData(RecordGroup.SUB, uiStore.dashboardSelection)"
          />
        </div>
      </QToolbar>
    </QHeader>

    <!-- Menu Drawer -->
    <QDrawer v-model="uiStore.drawer" :width="250" show-if-above bordered side="left">
      <div class="row justify-center">
        <QAvatar size="96px" class="q-my-md">
          <img src="@/assets/menu-avatar.png" />
        </QAvatar>
      </div>

      <QList>
        <!-- Dashboard Link -->
        <QItem clickable v-ripple :to="{ name: RouteName.DASHBOARD }">
          <QItemSection avatar>
            <QIcon color="primary" :name="Icon.DASHBOARD" />
          </QItemSection>
          <QItemSection>Dashboard</QItemSection>
        </QItem>

        <QSeparator spaced="md" inset />

        <QItem clickable v-ripple :to="{ name: RouteName.SETTINGS }">
          <QItemSection avatar>
            <QIcon color="primary" :name="Icon.SETTINGS" />
          </QItemSection>
          <QItemSection>Settings</QItemSection>
        </QItem>

        <QItem clickable v-ripple :to="{ name: RouteName.FAQ }">
          <QItemSection avatar>
            <QIcon color="primary" :name="Icon.HELP" />
          </QItemSection>
          <QItemSection>FAQ</QItemSection>
        </QItem>

        <QItem clickable v-ripple :to="{ name: RouteName.ABOUT }">
          <QItemSection avatar>
            <QIcon color="primary" :name="Icon.INFO" />
          </QItemSection>
          <QItemSection>About</QItemSection>
        </QItem>

        <QItem clickable v-ripple active-class="text-warning" :to="{ name: RouteName.DONATE }">
          <QItemSection avatar>
            <QIcon color="warning" :name="Icon.DONATE" />
          </QItemSection>
          <QItemSection>Donate</QItemSection>
        </QItem>
      </QList>
    </QDrawer>

    <!-- Router View -->
    <QPageContainer>
      <RouterView v-slot="{ Component, route }">
        <transition name="global-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </RouterView>
    </QPageContainer>
  </QLayout>
</template>
