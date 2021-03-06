/*
  Settings module

  Saves the settings in localStorage with the prefix `settings/`.
  Further settings modules (like filters) should also add a prefix
  and use constants.

  Examples:

  `settings/filters/*`
  `settings/newsletters/*`
  `settings/feedbackSurveys/*`
 */

import translations from '../../static/translations'
import {
  FILTERS_KEY_PREFIX,
  NEWSLETTER_KEY_PREFIX,
  FEEDBACK_SURVEY_KEY_PREFIX,
  AB_TESTING_PREFIX,
  COUNTLY_PREFIX
} from './prefixes'
import { makeOperations } from './helpers'

/*
  Filters
 */
const filters = {
  TUTORIALS: {
    SHOW_CODING: 'tutorials-show-coding'
  },
  ...makeOperations(FILTERS_KEY_PREFIX)
}

/*
  Newsletters
 */
const newsletters = {
  PROTOSCHOOL: 'protoschool',
  ...makeOperations(NEWSLETTER_KEY_PREFIX)
}

/*
  Tutorial Feedback Survey
 */
const tutorialFeedbackSurvey = {
  ...makeOperations(FEEDBACK_SURVEY_KEY_PREFIX)
}

tutorialFeedbackSurvey.TUTORIAL_FEEDBACK_SURVEY = tutorialId => (
  `tutorial-${tutorialId}-feedback-survey`
)

tutorialFeedbackSurvey.getProgress = function (tutorialId) {
  return tutorialFeedbackSurvey.get(tutorialFeedbackSurvey.TUTORIAL_FEEDBACK_SURVEY(tutorialId)) || {
    lastAnsweredQuestionNumber: -1,
    completed: false,
    answers: [-1, -1, -1]
  }
}

tutorialFeedbackSurvey.saveProgress = function (tutorialId, questionNumber, answer) {
  const totalNumberOfQuestions = translations.feedbackSurvey.form.questions.length
  const answers = tutorialFeedbackSurvey.getProgress(tutorialId).answers

  answers[questionNumber - 1] = answer

  tutorialFeedbackSurvey.set(tutorialFeedbackSurvey.TUTORIAL_FEEDBACK_SURVEY(tutorialId), {
    lastAnsweredQuestionNumber: questionNumber,
    completed: questionNumber === totalNumberOfQuestions,
    answers
  })
}

/*
  A/B Testing
 */
const abTesting = {
  TUTORIAL_FEEDBACK_SURVEY: 'tutorial-feedback-survey',
  ...makeOperations(AB_TESTING_PREFIX)
}

/*
 Countly
 */
const countly = {
  EVENT_TRACKED: 'event-tracked',
  ...makeOperations(COUNTLY_PREFIX)
}

countly.EVENT_KEY = function (event, data) {
  return `${countly.EVENT_TRACKED}/${event}-${JSON.stringify(data)}`
}

countly.hasEventBeenTracked = function (event, data) {
  return !!countly.get(countly.EVENT_KEY(event, data))
}

countly.markEventAsTracked = function (event, data) {
  countly.set(countly.EVENT_KEY(event, data), new Date().toISOString())
}

export default {
  filters,
  newsletters,
  tutorialFeedbackSurvey,
  abTesting,
  countly
}
