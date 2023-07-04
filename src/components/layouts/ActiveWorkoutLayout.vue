<script setup lang="ts">
import { RouterView } from 'vue-router'
import { AppHeaderColor, AppName } from '@/constants/global'
import { Icon, routeNames } from '@/types/general'
</script>

<template>
  <QLayout view="hHh LpR lff">
    <QHeader elevated :class="`bg-${AppHeaderColor}`">
      <QToolbar>
        <QToolbarTitle>{{ AppName }}</QToolbarTitle>
        <QBtn flat round :icon="Icon.BACK" :to="{ name: routeNames.Values.Dashboard }" />
      </QToolbar>
    </QHeader>

    <QPageContainer>
      <RouterView v-slot="{ Component, route }">
        <transition name="global-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </RouterView>
    </QPageContainer>
  </QLayout>
</template>
