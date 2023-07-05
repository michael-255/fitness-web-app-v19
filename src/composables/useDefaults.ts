import { Icon } from '@/types/general'
import {
  type ExerciseRecord,
  type WorkoutRecord,
  type MeasurementRecord,
  recordGroups,
  recordTypes,
  exerciseInputs,
  MeasurementInput,
} from '@/types/core'
import useLogger from '@/composables/useLogger'
import useDialogs from '@/composables/useDialogs'
import DB from '@/services/Database'

export default function useDefaults() {
  const { log } = useLogger()
  const { confirmDialog } = useDialogs()

  async function onAddBarbellStrengthWorkouts() {
    confirmDialog(
      'Add Barbell Strength Workouts',
      `Would you like to add the Barbell Strength workouts into the database?`,
      Icon.INFO,
      'info',
      async () => {
        try {
          const now = Date.now()

          const exercises: ExerciseRecord[] = [
            {
              type: recordTypes.Values.exercise,
              id: '50c1fc75-0975-45f8-8177-ff4988b00de2', // From Fitness Tracker v16 (Alpha & Beta)
              timestamp: now,
              name: 'Barbell Squat',
              desc: 'Standing barbell squat with the bar resting near your neck.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [exerciseInputs.Values.Reps, exerciseInputs.Values['Weight (lbs)']],
            },
            {
              type: recordTypes.Values.exercise,
              id: 'd681459e-10c8-40ae-94e9-9b06b7c40367', // From Fitness Tracker v16 (Alpha)
              timestamp: now,
              name: 'Barbell Bench Press',
              desc: 'Lying barbell bench press chest exercise.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [exerciseInputs.Values.Reps, exerciseInputs.Values['Weight (lbs)']],
            },
            {
              type: recordTypes.Values.exercise,
              id: '08b12cc1-d4b9-4d22-82db-9e33b3e5c3fa', // From Fitness Tracker v16 (Alpha)
              timestamp: now,
              name: 'Barbell Standing Rows',
              desc: 'Standing barbell rows where you hinge at the waist and pull the bar up into your stomach.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [exerciseInputs.Values.Reps, exerciseInputs.Values['Weight (lbs)']],
            },
            {
              type: recordTypes.Values.exercise,
              id: 'cc279615-91a6-42ac-a073-4339e7c2034f', // From Fitness Tracker v16 (Beta)
              timestamp: now,
              name: 'Barbell Overhead Press',
              desc: 'Standing barbell overhead press. Flex your glutes and abs to keep your back straight while pushing the bar above your head.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [exerciseInputs.Values.Reps, exerciseInputs.Values['Weight (lbs)']],
            },
            {
              type: recordTypes.Values.exercise,
              id: 'b8f1a60e-7f21-4f62-8757-d9b371bffd45', // From Fitness Tracker v16 (Beta)
              timestamp: now,
              name: 'Barbell Deadlift',
              desc: 'Standing barbell deadlift. Keep your back straight and flexed while lifting with your legs and lower back.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [exerciseInputs.Values.Reps, exerciseInputs.Values['Weight (lbs)']],
            },
          ]

          const workouts: WorkoutRecord[] = [
            {
              type: recordTypes.Values.workout,
              id: '2158e1b2-27e0-4012-bb14-3846b3ee1d6a', // From Fitness Tracker v16
              timestamp: now,
              name: 'Barbell Strength - A',
              desc: 'Workout A of the barbell strength building program where you alternate between this and workout B. Do this workout 1-2 times per week.',
              favorited: false,
              enabled: true,
              active: false,
              exerciseIds: [
                '50c1fc75-0975-45f8-8177-ff4988b00de2',
                'd681459e-10c8-40ae-94e9-9b06b7c40367',
                '08b12cc1-d4b9-4d22-82db-9e33b3e5c3fa',
              ],
            },
            {
              type: recordTypes.Values.workout,
              id: 'f3a1537c-4d63-43e1-99bd-df5ef59ac220', // From Fitness Tracker v16
              timestamp: now,
              name: 'Barbell Strength - B',
              desc: 'Workout B of the barbell strength building program where you alternate between this and workout A. Do this workout 1-2 times per week. You should only do 1 set of the Barbell Deadlift exercise in this program.',
              favorited: false,
              enabled: true,
              active: false,
              exerciseIds: [
                '50c1fc75-0975-45f8-8177-ff4988b00de2',
                'cc279615-91a6-42ac-a073-4339e7c2034f',
                'b8f1a60e-7f21-4f62-8757-d9b371bffd45',
              ],
            },
          ]

          await Promise.all([
            DB.importRecords(recordGroups.Values.core, exercises),
            DB.importRecords(recordGroups.Values.core, workouts),
          ])

          log.info('Barbell Strength workouts added', {
            newExercises: exercises?.length ?? 0,
            newWorkouts: workouts?.length ?? 0,
          })
        } catch (error) {
          log.error('Error adding Barbell Strength workouts', error)
        }
      }
    )
  }

  /**
   * On confirmation, add the stretch routine into the database.
   */
  async function onAddStretchRoutine() {
    confirmDialog(
      'Add Stretch Routine',
      `Would you like to add the Stretch Routine into the database?`,
      Icon.INFO,
      'info',
      async () => {
        try {
          const now = Date.now()

          const exercises: ExerciseRecord[] = [
            {
              type: recordTypes.Values.exercise,
              id: 'e0cd33be-e28a-46c3-80e6-263240ad5b87',
              timestamp: now,
              name: 'Lying Glute Stretch',
              desc: 'Lying on your back, bring your knee to your chest and then across your body. Hold for 30 seconds and then repeat on the other side.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: '9007a082-249b-48b7-ba59-463d58a20ba5',
              timestamp: now,
              name: 'Pigeon Stretch',
              desc: 'Bring one leg in front of you at an angle with the other behind you. Hold for 30 seconds and then repeat on the other side.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: '8653a6cf-8d26-4115-bda3-d28598065d02',
              timestamp: now,
              name: 'Frog Stretch',
              desc: 'Get on all fours and spread your knees apart. Hold for 30 seconds.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: 'a6e35a70-9249-4515-a45f-6b7787e23156',
              timestamp: now,
              name: 'Standing Quad Stretch',
              desc: 'Standing on one leg, bring your other leg up behind you. Hold for 30 seconds and then repeat on the other side.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: '7f40466f-8621-4567-9181-5fd45fa2418b',
              timestamp: now,
              name: 'Standing Toe Touch Stretch',
              desc: 'Standing with your legs straight, bend over and try to touch your toes. Hold for 30 seconds.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: 'a291154a-bd22-4738-8559-0e4ee48e570d',
              timestamp: now,
              name: 'Standing Calf Stretch',
              desc: 'Lean against a wall with one leg in front of the other. Hold for 30 seconds and then repeat on the other side.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: '5756d452-9272-4cbd-a144-e2b98acf8a3f',
              timestamp: now,
              name: 'Standing Chest Stretch',
              desc: 'Lean against a wall with your elbows behind you. Hold for 30 seconds.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: '66c24ef3-0d53-460f-bff4-4888fb687b93',
              timestamp: now,
              name: 'Cross Spinal Foam Roll',
              desc: 'Foam roll your back going up and down your spine for 90 seconds.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: '2a940995-08fc-4faf-9e52-d94f01e684b8',
              timestamp: now,
              name: 'Parallel Spinal Foam Roll',
              desc: 'Lay on a foam roller with it aligned with your spine. Rest with your arms out to the side for 90 seconds.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
          ]

          const workouts: WorkoutRecord[] = [
            {
              type: recordTypes.Values.workout,
              id: '80add653-aa96-4253-9d94-a30cb10cfa5f',
              timestamp: now,
              name: 'Stretch Routine',
              desc: 'Simple routine with a variety of stretches focusing on larger muscle groups to help you relax and recover. Do this routine after a workout or every day if possible.',
              favorited: false,
              enabled: true,
              active: false,
              exerciseIds: [
                'e0cd33be-e28a-46c3-80e6-263240ad5b87',
                '9007a082-249b-48b7-ba59-463d58a20ba5',
                '8653a6cf-8d26-4115-bda3-d28598065d02',
                'a6e35a70-9249-4515-a45f-6b7787e23156',
                '7f40466f-8621-4567-9181-5fd45fa2418b',
                'a291154a-bd22-4738-8559-0e4ee48e570d',
                '5756d452-9272-4cbd-a144-e2b98acf8a3f',
                '66c24ef3-0d53-460f-bff4-4888fb687b93',
                '2a940995-08fc-4faf-9e52-d94f01e684b8',
              ],
            },
          ]

          await Promise.all([
            DB.importRecords(recordGroups.Values.core, exercises),
            DB.importRecords(recordGroups.Values.core, workouts),
          ])

          log.info('Stretch Routine added', {
            newExercises: exercises?.length ?? 0,
            newWorkouts: workouts?.length ?? 0,
          })
        } catch (error) {
          log.error('Error adding Stretch Routine', error)
        }
      }
    )
  }

  /**
   * On confirmation, add the carpal tunnel routine into the database.
   */
  async function onAddCarpalTunnelRoutine() {
    confirmDialog(
      'Add Carpal Tunnel Routine',
      `Would you like to add the Carpal Tunnel Routine into the database?`,
      Icon.INFO,
      'info',
      async () => {
        try {
          const now = Date.now()

          const exercises: ExerciseRecord[] = [
            {
              type: recordTypes.Values.exercise,
              id: 'db513a6b-b0c0-497a-a034-7456d072d98b',
              timestamp: now,
              name: 'Median Nerve Sliders',
              desc: 'Bring you hand in front of your face, then fully extend your arm to the side while stretching your hand back and forth. Repeat 15 times on each hand.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: '3776575a-3c89-4286-904f-f724bd143aca',
              timestamp: now,
              name: 'Fist, Knuckle, Finger Extensions',
              desc: 'Start with your hands in a fist, then role out to your knuckles, and then extend your fingers. Repeat 15 times.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: 'ceac93d5-6db9-4cca-bcaf-570a25e4a282',
              timestamp: now,
              name: 'Finger Tip Flexion',
              desc: 'Flex each of your finger (including your thumbs) without bending your knuckles if possible one at a time. Repeat 15 times per finger.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: 'e7ddd519-807e-456e-9cb5-7496be50cb9c',
              timestamp: now,
              name: 'Finger Knuckle Flexion',
              desc: 'Flex each of your finger knuckles one at a time. Repeat 15 times per finger (minus the thumbs).',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: 'ee84a9f7-961c-4dbc-bf97-aa9f5b8a353e',
              timestamp: now,
              name: 'In/Out Thumb Stretch',
              desc: 'Touch your thumbs as close to the base of your pinky as possible, then open your hands and spread them far apart. Repeat 15 times.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: 'f66d5c5f-03fc-43a4-b0f3-af0af58b41a7',
              timestamp: now,
              name: 'Gentle Wrist Stretch',
              desc: 'Relax your arms in a T-Rex position, then bring them back while opening your hands for a brief stretch. Repeat 15 times.',
              favorited: false,
              enabled: true,
              multipleSets: true,
              active: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
          ]

          const workouts: WorkoutRecord[] = [
            {
              type: recordTypes.Values.workout,
              id: 'cba94a35-d450-4d0f-955f-df6315522622',
              timestamp: now,
              name: 'Carpal Tunnel Routine',
              desc: 'Physical therapy routine for carpal tunnel syndrome. Do this routine on days where you did any heavy activity with your wrists.',
              favorited: false,
              enabled: true,
              active: false,
              exerciseIds: [
                'db513a6b-b0c0-497a-a034-7456d072d98b',
                '3776575a-3c89-4286-904f-f724bd143aca',
                'ceac93d5-6db9-4cca-bcaf-570a25e4a282',
                'e7ddd519-807e-456e-9cb5-7496be50cb9c',
                'ee84a9f7-961c-4dbc-bf97-aa9f5b8a353e',
                'f66d5c5f-03fc-43a4-b0f3-af0af58b41a7',
              ],
            },
          ]

          await Promise.all([
            DB.importRecords(recordGroups.Values.core, exercises),
            DB.importRecords(recordGroups.Values.core, workouts),
          ])

          log.info('Carpal Tunnel Routine added', {
            newExercises: exercises?.length ?? 0,
            newWorkouts: workouts?.length ?? 0,
          })
        } catch (error) {
          log.error('Error adding Carpal Tunnel Routine', error)
        }
      }
    )
  }

  /**
   * On confirmation, adds the deep breathing routine into the database.
   */
  async function onAddDeepBreathingRoutine() {
    confirmDialog(
      'Add Deep Breathing Routine',
      `Would you like to add the Deep Breathing Routine into the database?`,
      Icon.INFO,
      'info',
      async () => {
        try {
          const now = Date.now()

          const exercises: ExerciseRecord[] = [
            {
              type: recordTypes.Values.exercise,
              id: '729bcb7e-6b40-4497-ba0e-8cce6b57341a',
              timestamp: now,
              name: 'Pursed Lip Breathing',
              desc: 'Inhale through your nose for 2 seconds, then exhale slowly through pursed lips for 4 seconds. Repeat 10 times.',
              favorited: false,
              enabled: true,
              active: false,
              multipleSets: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: '15092ca3-e7c8-4214-a935-8c90126cf408',
              timestamp: now,
              name: 'Diaphragmatic Breathing',
              desc: 'Place one hand on your chest. Inhale through your nose for 2 seconds, then contract your abdominal muscles and exhale slowly through pursed lips for 4 seconds. The hand on your chest should have minimal movement during this process. Repeat 10 times.',
              favorited: false,
              enabled: true,
              active: false,
              multipleSets: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
            {
              type: recordTypes.Values.exercise,
              id: 'cd75a9c7-fed8-4c98-83db-9dc3a64725a0',
              timestamp: now,
              name: 'Box Breathing',
              desc: 'Inhale through your nose for 4 seconds, hold your breath for 4 seconds, exhale through your mouth for 4 seconds, then hold your breath for 4 seconds. Repeat 10 times.',
              favorited: false,
              enabled: true,
              active: false,
              multipleSets: false,
              exerciseInputs: [], // No inputs (records nothing)
            },
          ]

          const workouts: WorkoutRecord[] = [
            {
              type: recordTypes.Values.workout,
              id: 'b0752f64-e6ba-4d98-a981-67860d7ab665',
              timestamp: now,
              name: 'Deep Breathing Routine',
              desc: 'Deep breathing routine for improving lung compacity, oxygen intake, and relieving stress. Do this routine in a comfortable position (sitting or lying down) and in a quiet environment.',
              favorited: false,
              enabled: true,
              active: false,
              exerciseIds: [
                '729bcb7e-6b40-4497-ba0e-8cce6b57341a',
                '15092ca3-e7c8-4214-a935-8c90126cf408',
                'cd75a9c7-fed8-4c98-83db-9dc3a64725a0',
              ],
            },
          ]

          await Promise.all([
            DB.importRecords(recordGroups.Values.core, exercises),
            DB.importRecords(recordGroups.Values.core, workouts),
          ])

          log.info('Deep Breathing Routine added', {
            newExercises: exercises?.length ?? 0,
            newWorkouts: workouts?.length ?? 0,
          })
        } catch (error) {
          log.error('Error adding Deep Breathing Routine', error)
        }
      }
    )
  }

  /**
   * On confirmation, add standard measurements into the database.
   */
  async function onAddStandardMeasurements() {
    confirmDialog(
      'Add Standard Measurements',
      `Would you like to add Standard Measurements into the database?`,
      Icon.INFO,
      'info',
      async () => {
        try {
          const now = Date.now()

          const measurements: MeasurementRecord[] = [
            {
              type: recordTypes.Values.measurement,
              id: '43e3fc4e-b419-468c-9888-b5e072d81dfb', // From Fitness Tracker v16
              timestamp: now,
              name: 'Body Fat',
              desc: 'Body fat percentage (%).',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.PERCENT,
            },
            {
              type: recordTypes.Values.measurement,
              id: 'b4450018-1506-450f-a429-9903aded5c9b', // From Fitness Tracker v16
              timestamp: now,
              name: 'Body Weight',
              desc: 'Body weight in pounds (lbs).',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.BODY_WEIGHT,
            },
            {
              type: recordTypes.Values.measurement,
              id: '880cb344-e537-4f0f-bad4-e212a6df51cd', // From Fitness Tracker v16
              timestamp: now,
              name: 'Chest',
              desc: 'Chest circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: 'e126e959-1675-4b3b-866c-261e453d8dae', // From Fitness Tracker v16
              timestamp: now,
              name: 'Left Bicep',
              desc: 'Left bicep circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: '09108d87-8337-4424-83a1-1ee5be5e8585', // From Fitness Tracker v16
              timestamp: now,
              name: 'Left Calf',
              desc: 'Left calf circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: '96c7229d-91e8-4470-b0a9-ebb1234fe6e7', // From Fitness Tracker v16
              timestamp: now,
              name: 'Left Forearm',
              desc: 'Left forearm circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: '3e3d0d91-3280-491d-967e-d56dcfc51520', // From Fitness Tracker v16
              timestamp: now,
              name: 'Left Thigh',
              desc: 'Left thigh circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: '0090f468-5917-4124-98bd-1e7711ab360e', // From Fitness Tracker v16
              timestamp: now,
              name: 'Neck',
              desc: 'Neck circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: '9fddbad2-ba89-4476-95e4-10d9969e782c', // From Fitness Tracker v16
              timestamp: now,
              name: 'Right Bicep',
              desc: 'Right bicep circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: '0ee16da1-3c8d-48fc-9af1-41ec09cf6317', // From Fitness Tracker v16
              timestamp: now,
              name: 'Right Calf',
              desc: 'Right calf circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: 'fa4c25c7-e1d5-48bf-975a-4fdfd2305646', // From Fitness Tracker v16
              timestamp: now,
              name: 'Right Forearm',
              desc: 'Right forearm circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: '843c6b0f-ce23-4468-9d67-dd1af076b10a', // From Fitness Tracker v16
              timestamp: now,
              name: 'Right Thigh',
              desc: 'Right thigh circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: '222452a2-aa29-460e-85a8-4617092d1ba5', // From Fitness Tracker v16
              timestamp: now,
              name: 'Shoulders',
              desc: 'Shoulder circumference in inches.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
            {
              type: recordTypes.Values.measurement,
              id: 'ed12d669-cffd-45f7-802c-9025426341fa', // From Fitness Tracker v16
              timestamp: now,
              name: 'Waist',
              desc: 'Waist circumference in inches at the belly button.',
              favorited: false,
              enabled: true,
              measurementInput: MeasurementInput.INCHES,
            },
          ]

          await DB.importRecords(recordGroups.Values.core, measurements)

          log.info('Standard Measurements added', { newMeasurements: measurements?.length ?? 0 })
        } catch (error) {
          log.error('Error adding Standard Measurements', error)
        }
      }
    )
  }

  return {
    onAddBarbellStrengthWorkouts,
    onAddStretchRoutine,
    onAddCarpalTunnelRoutine,
    onAddDeepBreathingRoutine,
    onAddStandardMeasurements,
  }
}
