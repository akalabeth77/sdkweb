import { defineArrayMember, defineField, defineType } from 'sanity';

const slugField = defineField({ name: 'slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (Rule) => Rule.required() });

export const locationType = defineType({
  name: 'location', type: 'document', fields: [
    defineField({ name: 'name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'address', type: 'string' }),
    defineField({ name: 'mapsUrl', type: 'url' }),
    defineField({ name: 'coordinates', type: 'geopoint' })
  ]
});

export const teacherType = defineType({
  name: 'teacher', type: 'document', fields: [
    defineField({ name: 'name', type: 'string', validation: (Rule) => Rule.required() }),
    slugField,
    defineField({ name: 'photo', type: 'image' }),
    defineField({ name: 'bio', type: 'localizedText' }),
    defineField({ name: 'dancesTaught', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    defineField({ name: 'socialLinks', type: 'array', of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'platform', type: 'string' }), defineField({ name: 'url', type: 'url' })] })] })
  ]
});

export const eventType = defineType({
  name: 'event', type: 'document', fields: [
    defineField({ name: 'title', type: 'localizedString', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title.en' } }),
    defineField({ name: 'description', type: 'localizedText' }),
    defineField({ name: 'date', type: 'datetime', validation: (Rule) => Rule.required() }),
    defineField({ name: 'eventType', type: 'string', options: { list: ['party', 'workshop', 'course', 'festival'] } }),
    defineField({ name: 'danceStyle', type: 'string' }),
    defineField({ name: 'location', type: 'reference', to: [{ type: 'location' }] }),
    defineField({ name: 'teachers', type: 'array', of: [defineArrayMember({ type: 'reference', to: [{ type: 'teacher' }] })] }),
    defineField({ name: 'coverImage', type: 'image' }),
    defineField({ name: 'registrationLink', type: 'url' })
  ]
});

export const courseType = defineType({
  name: 'course', type: 'document', fields: [
    defineField({ name: 'name', type: 'localizedString' }),
    slugField,
    defineField({ name: 'danceStyle', type: 'string' }),
    defineField({ name: 'level', type: 'string', options: { list: ['beginner', 'intermediate', 'advanced'] } }),
    defineField({ name: 'teacher', type: 'reference', to: [{ type: 'teacher' }] }),
    defineField({ name: 'weekday', type: 'string' }),
    defineField({ name: 'time', type: 'string' }),
    defineField({ name: 'duration', type: 'string' }),
    defineField({ name: 'capacity', type: 'number' }),
    defineField({ name: 'waitingListEnabled', type: 'boolean' }),
    defineField({ name: 'registrationLink', type: 'url' })
  ]
});

export const authorType = defineType({ name: 'author', type: 'document', fields: [defineField({ name: 'name', type: 'string' }), slugField, defineField({ name: 'photo', type: 'image' }), defineField({ name: 'bio', type: 'localizedText' })] });

export const blogPostType = defineType({
  name: 'blogPost', type: 'document', fields: [
    defineField({ name: 'title', type: 'localizedString' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title.en' } }),
    defineField({ name: 'author', type: 'reference', to: [{ type: 'author' }] }),
    defineField({ name: 'coverImage', type: 'image' }),
    defineField({ name: 'content', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
    defineField({ name: 'tags', type: 'array', of: [defineArrayMember({ type: 'string' })] })
  ]
});

export const galleryType = defineType({
  name: 'gallery', type: 'document', fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'images', type: 'array', of: [defineArrayMember({ type: 'image' })] }),
    defineField({ name: 'event', type: 'reference', to: [{ type: 'event' }] }),
    defineField({ name: 'photographerCredit', type: 'string' })
  ]
});

export const syllabusLevelType = defineType({
  name: 'syllabusLevel', type: 'document', fields: [
    defineField({ name: 'level', type: 'string', options: { list: ['beginner', 'intermediate', 'advanced'] } }),
    defineField({ name: 'order', type: 'number' }),
    defineField({ name: 'description', type: 'localizedText' }),
    defineField({ name: 'skills', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    defineField({ name: 'videos', type: 'array', of: [defineArrayMember({ type: 'url' })] })
  ]
});

export const siteSettingsType = defineType({
  name: 'siteSettings', type: 'document', fields: [
    defineField({ name: 'title', type: 'localizedString' }),
    defineField({ name: 'introText', type: 'localizedText' }),
    defineField({ name: 'heroVideoUrl', type: 'url' }),
    defineField({ name: 'heroImageUrl', type: 'url' }),
    defineField({ name: 'newsletterUrl', type: 'url' }),
    defineField({
      name: 'communitySections', type: 'array', of: [defineArrayMember({ type: 'object', fields: [
        defineField({ name: 'title', type: 'localizedString' }),
        defineField({ name: 'body', type: 'localizedText' })
      ] })]
    })
  ]
});
