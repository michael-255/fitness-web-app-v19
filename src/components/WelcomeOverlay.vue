<script setup lang="ts">
import { Icon, RouteName } from '@/types/general'
import { type Ref, ref, onUnmounted } from 'vue'
import { SettingKey } from '@/types/core'
import { AppDescription, AppName } from '@/constants/global'
import useLogger from '@/composables/useLogger'
import DB from '@/services/Database'

const { log } = useLogger()

const exampleFavorite: Ref<number> = ref(0)
const showWelcome: Ref<any> = ref(false)

const subscription = DB.liveSettings().subscribe({
  next: (liveSettings) => {
    showWelcome.value = liveSettings.find((s) => s.key === SettingKey.WELCOME_OVERLAY)?.value
  },
  error: (error) => {
    log.error('Error fetching live Settings', error)
  },
})

onUnmounted(() => {
  subscription.unsubscribe()
})

async function onCloseWelcomeOverlay() {
  await DB.setSetting(SettingKey.WELCOME_OVERLAY, false)
}
</script>

<template>
  <QDialog v-model="showWelcome" persistent>
    <QCard flat square>
      <QCardSection>
        <p class="text-h6">Welcome to {{ AppName }}</p>

        <!-- Information -->
        <p>{{ AppDescription }}</p>

        <p>
          Continue reading to learn more, or scroll to the bottom and click the "Start Using App"
          button to jump right in.
        </p>

        <!-- Favorites -->
        <div class="q-mb-md">
          <p>
            You are currently on the Dashboard page. This page gives you quick access to the primary
            data you work with in the app. You can favorite items on the Dashboard by clicking the
            star icon in the top right corner of the item. This prioritizes the item to the top of
            the list. An example of the favorite icon button is below.
          </p>
          <QRating
            v-model="exampleFavorite"
            :max="1"
            :icon="Icon.FAVORITE_OFF"
            :icon-selected="Icon.FAVORITE_ON"
            color="warning"
            size="md"
          />
        </div>

        <!-- Menu -->
        <div class="q-mb-md">
          <p>
            You can navigate through the app using the menu in the top left corner of the page. An
            example of the menu button is below. The menu gives you access to the primary data
            tables, Frequently Asked Questions (FAQ), Settings, and more. More advanced operations
            for the app are available on the Settings page.
          </p>
          <QBtn disable color="primary" class="q-px-sm" :icon="Icon.MENU_STANDARD" />
        </div>

        <!-- Donation -->
        <div class="q-mb-md">
          <p>
            Hope you find {{ AppName }} useful. Please consider donating to help me continue to
            create and maintain apps like this. Thank you!
          </p>
          <QBtn
            color="warning"
            label="Donate"
            :to="{ name: RouteName.DONATE }"
            :icon="Icon.DONATE"
          />
        </div>

        <!-- Close Welcome Overlay -->
        <div>
          <p>Click the button below when you are ready to get started.</p>
          <QBtn
            no-caps
            label="Start Using App"
            class="full-width"
            size="lg"
            color="positive"
            :icon="Icon.RECOMMEND"
            @click="onCloseWelcomeOverlay()"
          />
        </div>
      </QCardSection>
    </QCard>
  </QDialog>
</template>
