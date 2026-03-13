import { authorType, blogPostType, courseType, eventType, galleryType, locationType, siteSettingsType, syllabusLevelType, teacherType } from './types';
import { localizedString, localizedText } from './objects';

export const schemaTypes = [
  localizedString,
  localizedText,
  eventType,
  courseType,
  teacherType,
  authorType,
  blogPostType,
  galleryType,
  locationType,
  syllabusLevelType,
  siteSettingsType
];
