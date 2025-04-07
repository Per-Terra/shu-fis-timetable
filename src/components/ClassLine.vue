<script lang="ts" setup>
import { computed } from 'vue';
import type { Course } from '~/types/course';
import syllabusData from '~/assets/data/2025/syllabus.json';
import stringsData from '~/assets/data/2025/strings.json';
import type { TimetableEntry } from '~/types/timetableEntry';

const syllabuses = syllabusData as { [key: string]: any }[];
const strings = stringsData as { [key: string]: any };

const props = defineProps<{
  checked: boolean;
  completed: boolean;
  seen: boolean;
  number: string;
  course: Course;
  timetableEntry: TimetableEntry;
  hover?: string | null;
  disabled?: boolean;
  currentGrade: number;
  showField: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:checked' | 'update:completed' | 'update:seen', value: boolean): void;
  (e: 'update:hover', value: string | null): void;
}>();

const localChecked = computed({
  get: () => props.checked || localCompleted.value, // 修得済みまたは既読の場合はチェックを入れる
  set: (val: boolean) => {
    emit('update:checked', val);
  },
});

const localCompleted = computed({
  get: () => props.completed,
  set: (val: boolean) => {
    emit('update:completed', val);
    if (val) {
      emit('update:checked', false); // 修得済みにしたらチェックを外す
    }
  },
});

const localSeen = computed({
  get: () => props.seen,
  set: (val: boolean) => {
    emit('update:seen', val);
  },
});

const onMouseEnter = () => emit('update:hover', props.number);
const onMouseLeave = () => emit('update:hover', null);

const level = parseInt(props.number.substring(3, 4));
const field = props.number.substring(5, 7);
const fieldStrings = strings.field['31'][field];

const syllabus = syllabuses.filter((s) => s.syllabus_number === props.course.syllabus_number)[0];

const disabledState = computed(() => props.disabled || localCompleted.value || localSeen.value);
</script>

<template>
  <div
    class="flex gap-1 rounded-sm border border-gray-200 p-2 shadow-xs"
    :class="[
      props.disabled || (disabledState && (localCompleted || (localSeen && !localChecked)))
        ? 'bg-gray-200'
        : localChecked
          ? 'bg-blue-200'
          : props.hover === props.number
            ? 'bg-sky-100'
            : 'bg-white',
      disabledState ? '' : 'cursor-pointer',
      props.hover === props.number ? '-m-[2px] border-[3px] border-sky-500' : '',
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="!disabledState && (localChecked = !localChecked)"
  >
    <input
      v-model="localChecked"
      type="checkbox"
      class="my-1 h-4 w-4 shrink-0 cursor-pointer"
      :disabled="disabledState"
    />
    <div class="flex grow flex-col gap-1">
      <div class="flex gap-1">
        <BadgeRequired v-if="course.is_required_to_graduate" />
        <BadgeDS
          v-if="field === '22' && course.is_enrollable_ds"
          :is-required="course.is_required_to_master_ds"
        />
        <BadgeIE
          v-if="field === '23' && course.is_enrollable_ie"
          :is-required="course.is_required_to_master_ie"
        />
        <BadgeBA
          v-if="field === '24' && course.is_enrollable_ba"
          :is-required="course.is_required_to_master_ba"
        />
        <BadgeTP
          v-if="field.substring(0, 1) === '9' && course.is_teaching_program_course"
          :is-required="course.is_required_to_teaching_program"
        />
        <div class="line-clamp-2 grow text-left">
          <a
            v-if="course.syllabus_number"
            target="_blank"
            :href="`https://aaaweb.shunan-u.ac.jp/aa_web/syllabus/se0032.aspx?me=EU&sk=2025_2_${course.syllabus_number}&syw=1`"
            class="underline-offset-2 hover:underline"
          >
            <slot />
          </a>
          <span v-else><slot /></span>
        </div>
        <BadgeDS
          v-if="field !== '22' && course.is_enrollable_ds"
          :is-required="course.is_required_to_master_ds"
        />
        <BadgeIE
          v-if="field !== '23' && course.is_enrollable_ie"
          :is-required="course.is_required_to_master_ie"
        />
        <BadgeBA
          v-if="field !== '24' && course.is_enrollable_ba"
          :is-required="course.is_required_to_master_ba"
        />
        <BadgeTP
          v-if="field.substring(0, 1) !== '9' && course.is_teaching_program_course"
          :is-required="course.is_required_to_teaching_program"
        />
      </div>
      <div class="flex flex-wrap gap-1 text-sm text-gray-500">
        <span class="flex flex-wrap gap-1">
          <Icon name="ic:baseline-sticky-note-2" class="relative top-[3px]" />
          <span>{{ level }}年</span>
          <span>{{
            course.quarter !== undefined
              ? `${course.quarter}Q`
              : course.semester !== undefined
                ? course.semester === 1
                  ? '前期'
                  : '後期'
                : ''
          }}</span>
          <span>{{ course.credits }}単位</span>
        </span>
        <span v-if="showField">
          <Icon name="ic:baseline-folder" class="relative top-[2px]" />
          <span class="ml-1">{{ fieldStrings.category }}</span>
          <span class="ml-1">{{ fieldStrings.subject }}</span>
        </span>
        <span class="flex flex-wrap gap-1">
          <span v-if="syllabus">
            <Icon name="ic:baseline-person" class="relative top-0.5 mr-0.5" />
            <span>{{ syllabus.teachers[0].name.replace(/\s/g, '') }}</span>
            <span v-if="syllabus.teachers.length > 1" class="ml-1"
              >ほか{{ syllabus.teachers.length - 1 }}名</span
            >
          </span>
          <span v-else>シラバス未提供</span>
          <span v-if="timetableEntry.location">
            <Icon name="ic:baseline-location-on" class="relative top-0.5" />
            <span>{{ timetableEntry.location }}</span>
          </span>
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <span v-if="props.disabled" class="text-sm text-gray-500">履修できません</span>
        <button
          v-if="!props.disabled"
          class="cursor-pointer rounded-sm border border-gray-500 px-1"
          :class="localSeen ? 'bg-gray-500 text-white' : 'border-gray-500 bg-white text-gray-500'"
          @click.stop="localSeen = !localSeen"
        >
          {{ localSeen ? 'チェック済' : '未チェック' }}
        </button>
        <button
          v-if="!props.disabled && level < currentGrade"
          class="cursor-pointer rounded-sm border border-gray-500 px-1"
          :class="
            localCompleted ? 'bg-gray-500 text-white' : 'border-gray-500 bg-white text-gray-500'
          "
          :disabled="localSeen"
          @click.stop="localCompleted = !localCompleted"
        >
          {{ localCompleted ? '修得済' : '未修得' }}
        </button>
      </div>
    </div>
  </div>
</template>
