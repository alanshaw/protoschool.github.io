<template>
  <transition
    name="state-view-transition"
  >
    <div
      v-if="!dismissed"
      data-state-view-active="true"
      data-state-view-transition-function="slide"
      class="form content-banner flex flex-column state-view"
    >
      <transition
        name="state-view-transition"
        mode="out-in"
      >
        <h2
          key="initial-title"
          class="state-view mt0 mb0"
          v-if="currentStep < maximumStep"
          :data-state-view-active="currentStep < maximumStep"
          data-state-view-transition-function="slide"
          data-state-view-transition-delay-leave="slow"
        >
          {{translations.form.title}}
        </h2>
        <h2
          key="thank-you"
          class="state-view mt0 mb0"
          v-if="currentStep === maximumStep"
          :data-state-view-active="currentStep === maximumStep"
          data-state-view-transition-function="slide"
        >
          {{translations.thankYouMessage.title}}
        </h2>
      </transition>
      <StepsTracker
        class="steps-tracker mb3"
        :currentStep="currentStep"
        :maximumStep="maximumStep"
      />
      <transition
        name="state-view-transition"
        mode="out-in"
      >
        <Question
          v-if="question"
          class="state-view"
          data-state-view-active="true"
          data-state-view-transition-function="slide"
          :data-state-view-transition-delay-leave="currentStep === (maximumStep - 1) ? 'slow' : 'default'"
          :key="question.text"
          :question="question"
          :onSelect="onSelect"
        />
        <ThankYouMessage
          class="state-view"
          v-if="currentStep === maximumStep"
          :data-state-view-active="currentStep === maximumStep"
          key="thank-you"
        />
      </transition>
      <button
        class="close"
        title="Dismiss survey"
        v-on:click="onDismiss"
        aria-label="Dismiss survey"
      >
        <img src="../../../static/images/close.svg" />
      </button>
    </div>
  </transition>
</template>
<script>
import translations from '../../../static/translations'
import countly from '../../../utils/countly'
import settings from '../../../utils/settings'
import Question from './Question.vue'
import StepsTracker from './StepsTracker.vue'
import ThankYouMessage from './ThankYouMessage.vue'

export default {
  name: 'Form',
  components: {
    Question,
    StepsTracker,
    ThankYouMessage
  },
  props: {
    initialStep: {
      type: Number,
      default: 0
    },
    done: {
      type: Function,
      required: true
    },
    onAnswer: {
      type: Function,
      required: true
    }
  },
  data: self => ({
    translations: translations.feedbackSurvey,
    questions: translations.feedbackSurvey.form.questions,
    currentStep: self.initialStep,
    maximumStep: translations.feedbackSurvey.form.questions.length,
    dismissed: false
  }),
  computed: {
    question: function () {
      return this.questions.find((question, index) => index === this.currentStep)
    },
    trackingData: function () {
      const tutorialFeedbackSurveyOption = settings.abTesting.get(settings.abTesting.TUTORIAL_FEEDBACK_SURVEY)

      return {
        path: this.$route.path,
        option: tutorialFeedbackSurveyOption
      }
    }
  },
  methods: {
    onSelect: function (selectedAnswer) {
      this.onAnswer({ ...this.question, number: this.currentStep + 1 }, selectedAnswer)
      this.currentStep += 1

      if (this.maximumStep === this.currentStep) {
        this.done()
      }
    },
    onDismiss: function () {
      countly.trackEvent(countly.events.TUTORIAL_FEEDBACK_SURVEY_DISMISSED, {
        ...this.trackingData,
        numberOfQuestionsAnswered: this.currentStep === -1 ? 0 : this.currentStep,
        surveyCompleted: this.currentStep === this.maximumStep
      })

      this.dismissed = true
    }
  }
}
</script>
<style scoped>
.form {
  position: relative;
}

.steps-tracker {
  width: 15.625rem;
  max-width: 100%;
}

button.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  transform: scale(0.95);

  padding: 0.5rem;
  background: none;
  border: none;
  line-height: 0;
  -webkit-tap-highlight-color: transparent; /* hide tap highlight on webkit browers */

  cursor: pointer;

  transition:
    transform var(--transition-default),
    opacity var(--transition-default);
}

button.close:hover,
button.close:focus,
button.close:active {
  opacity: 1;
  transform: scale(1);
}

button.close:active {
  transform: scale(0.95);
}

button.close {
  opacity: 0.2;
}
</style>
