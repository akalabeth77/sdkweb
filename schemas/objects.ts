import { defineField, defineType } from 'sanity';

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized string',
  type: 'object',
  fields: [defineField({ name: 'sk', type: 'string' }), defineField({ name: 'en', type: 'string' })]
});

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized text',
  type: 'object',
  fields: [defineField({ name: 'sk', type: 'text' }), defineField({ name: 'en', type: 'text' })]
});
