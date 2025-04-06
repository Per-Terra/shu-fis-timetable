<script lang="ts" setup>
import coursesData from '~/assets/data/2025/courses.json';
import timetableData from '~/assets/data/2025/timetable.json';
import type { Course } from '~/types/course';
import type { TimetableEntry } from '~/types/timetableEntry';

const courses = coursesData as { [key: string]: Course };
const timetable = timetableData as { [key: string]: TimetableEntry[] };

const flattenTimetable: [string, TimetableEntry][] = (() => {
  const seen = new Set<string>();
  const result: [string, TimetableEntry][] = [];
  for (const [number, entries] of Object.entries(timetable)) {
    for (const entry of entries) {
      const key = `${number}-${entry.day}-${entry.period}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push([number, entry]);
    }
  }
  return result;
})();

const enrolledPrograms = ref({
  DS: true,
  IE: false,
  BA: false,
  TP: false,
});
const enrolledCourses = reactive(
  Object.fromEntries(Object.keys(courses).map((key) => [key, false])),
);
const completedCourses = reactive(
  Object.fromEntries(Object.keys(courses).map((key) => [key, false])),
);
const seenCourses = reactive(Object.fromEntries(Object.keys(courses).map((key) => [key, false])));
const currentGrade = ref('1');
const mainProgram = ref('1');

// 状態の復元（ブラウザ上のみ）
onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('timetableState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        enrolledPrograms.value = state.enrolledPrograms || enrolledPrograms.value;
        Object.assign(enrolledCourses, state.enrolledCourses || {});
        Object.assign(completedCourses, state.completedCourses || {});
        Object.assign(seenCourses, state.seenCourses || {});
        currentGrade.value = state.currentGrade || currentGrade.value;
        mainProgram.value = state.mainProgram || mainProgram.value;
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
  }
});

// 状態の保存（ブラウザ上のみ）
watch(
  [enrolledPrograms, enrolledCourses, completedCourses, seenCourses, currentGrade, mainProgram],
  () => {
    if (typeof window !== 'undefined') {
      const state = {
        enrolledPrograms: enrolledPrograms.value,
        enrolledCourses: { ...enrolledCourses },
        completedCourses: { ...completedCourses },
        seenCourses: { ...seenCourses },
        currentGrade: currentGrade.value,
        mainProgram: mainProgram.value,
      };
      localStorage.setItem('timetableState', JSON.stringify(state));
    }
  },
  { deep: true },
);

const currentQuarter = ref(1);
const visibleTimetable = computed(() => {
  return flattenTimetable.filter(([number, entry]) => {
    const course = courses[number];
    if (course.quarter !== undefined) {
      return course.quarter === currentQuarter.value;
    } else if (course.semester !== undefined) {
      return (
        (currentQuarter.value <= 2 && course.semester === 1) ||
        (currentQuarter.value >= 3 && course.semester === 2)
      );
    }
    return false;
  });
});

const hovered = ref<string | null>(null);
const quarterStats: ComputedRef<{ [key: number]: { credit: number; period: number } }> = computed(
  () => {
    const stats = {
      1: { credit: 0, period: 0 },
      2: { credit: 0, period: 0 },
      3: { credit: 0, period: 0 },
      4: { credit: 0, period: 0 },
    };
    for (const key in enrolledCourses) {
      if (enrolledCourses[key]) {
        const course = courses[key];
        for (let q = 1; q <= 4; q++) {
          const quarterKey = q as 1 | 2 | 3 | 4;
          if (course.quarter !== undefined) {
            if (course.quarter === q) {
              stats[quarterKey].credit += course.credits;
              stats[quarterKey].period += flattenTimetable.filter(
                ([number]) => number === key,
              ).length;
            }
          } else if (course.semester !== undefined) {
            if (q <= 2 && course.semester === 1) {
              stats[quarterKey].credit += course.credits / 2; // 1Qと2Qで単位数を按分
              stats[quarterKey].period += flattenTimetable.filter(
                ([number]) => number === key,
              ).length;
            } else if (q >= 3 && course.semester === 2) {
              stats[quarterKey].credit += course.credits / 2; // 3Qと4Qで単位数を按分
              stats[quarterKey].period += flattenTimetable.filter(
                ([number]) => number === key,
              ).length;
            }
          }
        }
      }
    }
    return stats;
  },
);

const totalCredits = computed(() => {
  let total = 0;
  for (const key in enrolledCourses) {
    if (enrolledCourses[key]) {
      const course = courses[key];
      total += course.credits;
    }
  }
  return total;
});

// mainProgramの値の変更を監視
watch(mainProgram, (newValue) => {
  // enrolledProgramsはrefオブジェクトなので、.valueで参照
  switch (newValue) {
    case '1':
      enrolledPrograms.value.DS = true;
      break;
    case '2':
      enrolledPrograms.value.IE = true;
      break;
    case '3':
      enrolledPrograms.value.BA = true;
      break;
  }
});

// 必修科目をすべてenrollする関数
function enrollAllRequired() {
  for (const key in courses) {
    if (
      (courses[key].is_required_to_graduate ||
        (enrolledPrograms.value.DS && courses[key].is_required_to_master_ds) ||
        (enrolledPrograms.value.IE && courses[key].is_required_to_master_ie) ||
        (enrolledPrograms.value.BA && courses[key].is_required_to_master_ba)) &&
      key.substring(3, 4) === currentGrade.value
    ) {
      enrolledCourses[key] = true;
    }
  }
}
</script>

<template>
  <div>
    <!-- <div>
      <p>
        選択中の講義:
        {{
          Object.keys(enrolledCourses)
            .filter((key) => enrolledCourses[key])
            .join(', ')
        }}
      </p>
    </div> -->
    <header class="sticky top-0 z-10 bg-white/80 pt-2 shadow-sm backdrop-blur-lg">
      <div class="flex h-10 items-center gap-2 px-2 pb-2">
        <label>
          <span class="mr-1">学年</span>
          <select v-model="currentGrade" class="rounded-md border border-gray-300 bg-white px-1">
            <option value="1">1年</option>
            <option value="2">2年</option>
            <option value="3">3年</option>
            <option value="4">4年</option>
          </select>
        </label>
        <label class="border-l border-gray-300 pl-2">
          <span class="mr-1">主プログラム</span>
          <select v-model="mainProgram" class="rounded-md border border-gray-300 bg-white px-1">
            <option value="1">DS</option>
            <option value="2">IE</option>
            <option value="3">BA</option>
          </select>
        </label>
        <div class="flex gap-2 border-l border-gray-300 pl-2">
          <span>サブプログラム</span>
          <label v-for="(value, key) in enrolledPrograms" :key="key">
            <input
              v-model="enrolledPrograms[key]"
              type="checkbox"
              :disabled="
                (key === 'DS' && mainProgram === '1') ||
                (key === 'IE' && mainProgram === '2') ||
                (key === 'BA' && mainProgram === '3')
              "
            />
            {{ key }}
          </label>
        </div>
        <button
          class="ml-auto h-full cursor-pointer rounded-md border border-gray-300 bg-white px-2 hover:bg-gray-100"
          @click="enrollAllRequired"
        >
          必修科目をすべて登録
        </button>
        <button
          class="h-full cursor-pointer rounded-md border border-gray-300 bg-purple-500 px-2 text-white hover:bg-purple-600"
          @click="Object.keys(seenCourses).forEach((key) => (seenCourses[key] = false))"
        >
          チェックをすべて解除
        </button>
        <button
          class="h-full cursor-pointer rounded-md border border-gray-300 bg-red-500 px-2 text-white hover:bg-red-600"
          @click="Object.keys(enrolledCourses).forEach((key) => (enrolledCourses[key] = false))"
        >
          選択科目をすべて解除
        </button>
      </div>
      <div class="flex">
        <div class="grid grow grid-cols-4">
          <button
            v-for="q in 4"
            :key="'quarter-' + q"
            class="cursor-pointer items-center border-b-6"
            :class="{
              'border-amber-500 text-amber-500': q === 1,
              'bg-amber-100': currentQuarter === 1 && q === 1,
              'border-sky-400 text-sky-400': q === 2,
              'bg-sky-100': currentQuarter === 2 && q === 2,
              'border-pink-400 text-pink-400': q === 3,
              'bg-pink-100': currentQuarter === 3 && q === 3,
              'border-blue-600 text-blue-600': q === 4,
              'bg-blue-100': currentQuarter === 4 && q === 4,
            }"
            @click="currentQuarter = q"
          >
            <div class="font-bold">{{ q }}Q</div>
            <div>
              <span>{{ quarterStats[q].credit.toFixed(1) }}単位</span>
              <span class="ml-1">{{ quarterStats[q].period }}コマ</span>
            </div>
          </button>
        </div>
        <div class="flex w-32 flex-col items-center justify-center bg-gray-800 text-white">
          <span class="mx-2">通算{{ totalCredits }}単位</span>
        </div>
      </div>
    </header>
    <table class="w-full table-fixed border-collapse border border-gray-200">
      <thead>
        <tr>
          <th class="w-10 border border-gray-300"></th>
          <th v-for="col in 5" :key="'col-' + col" class="border border-gray-300">
            {{ ['月', '火', '水', '木', '金'][col - 1] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in 6" :key="'row-' + row">
          <th class="w-10 border border-gray-300 text-center">{{ row }}限</th>
          <td
            v-for="col in 5"
            :key="'cell-' + row + '-' + col"
            :class="{
              'bg-red-300':
                visibleTimetable
                  .filter(([num, entry]) => entry.day === col && entry.period === row)
                  .filter(([number]) => enrolledCourses[number]).length >= 2,
              'bg-sky-100':
                visibleTimetable
                  .filter(([num, entry]) => entry.day === col && entry.period === row)
                  .filter(([number]) => enrolledCourses[number]).length === 1,
            }"
            class="border border-gray-300 p-2 align-top"
          >
            <div class="flex h-full w-full flex-col gap-2">
              <ClassLine
                v-for="[number, entry] in visibleTimetable.filter(
                  ([num, e]) => e.day === col && e.period === row,
                )"
                :key="number"
                v-model:checked="enrolledCourses[number]"
                v-model:hover="hovered"
                v-model:completed="completedCourses[number]"
                v-model:seen="seenCourses[number]"
                :number="number"
                :course="courses[number]"
                :timetable-entry="entry"
                :disabled="
                  parseInt(number.substring(3, 4)) > parseInt(currentGrade) ||
                  (['22', '23', '24'].includes(number.substring(5, 7)) &&
                    ((!enrolledPrograms.DS && number.substring(5, 7) === '22') ||
                      (!enrolledPrograms.IE && number.substring(5, 7) === '23') ||
                      (!enrolledPrograms.BA && number.substring(5, 7) === '24')) &&
                    !(
                      (courses[number].is_enrollable_ds && enrolledPrograms.DS) ||
                      (courses[number].is_enrollable_ie && enrolledPrograms.IE) ||
                      (courses[number].is_enrollable_ba && enrolledPrograms.BA)
                    )) ||
                  (!enrolledPrograms.TP && number.substring(5, 6) === '9')
                "
                :current-grade="parseInt(currentGrade)"
              >
                {{ courses[number].course_name }}
              </ClassLine>
            </div>
          </td>
        </tr>
        <tr>
          <th class="w-10 border border-gray-300 text-center">集中</th>
          <td class="border border-gray-300 p-2 align-top" colspan="5">
            <div class="grid h-full w-full grid-cols-3 gap-2">
              <ClassLine
                v-for="[number, entry] in visibleTimetable.filter(
                  ([num, e]) => e.is_intensive_course,
                )"
                :key="number"
                v-model:checked="enrolledCourses[number]"
                v-model:hover="hovered"
                v-model:completed="completedCourses[number]"
                v-model:seen="seenCourses[number]"
                :number="number"
                :course="courses[number]"
                :timetable-entry="entry"
                :disabled="
                  parseInt(number.substring(3, 4)) > parseInt(currentGrade) ||
                  (['22', '23', '24'].includes(number.substring(5, 7)) &&
                    ((!enrolledPrograms.DS && number.substring(5, 7) === '22') ||
                      (!enrolledPrograms.IE && number.substring(5, 7) === '23') ||
                      (!enrolledPrograms.BA && number.substring(5, 7) === '24')) &&
                    !(
                      (courses[number].is_enrollable_ds && enrolledPrograms.DS) ||
                      (courses[number].is_enrollable_ie && enrolledPrograms.IE) ||
                      (courses[number].is_enrollable_ba && enrolledPrograms.BA)
                    )) ||
                  (!enrolledPrograms.TP && number.substring(5, 6) === '9')
                "
                :current-grade="parseInt(currentGrade)"
              >
                {{ courses[number].course_name }}
              </ClassLine>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
