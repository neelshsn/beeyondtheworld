import { defineArrayMember, defineField, defineType } from 'sanity';

export const journey = defineType({
  name: 'journey',
  title: 'Journey',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'country', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'summary', type: 'text' }),
    defineField({ name: 'heroVideo', type: 'url' }),
    defineField({ name: 'heroPoster', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'sections',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'journeySection',
          fields: [
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'description', type: 'text' }),
            defineField({
              name: 'highlights',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
            defineField({
              name: 'media',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'type',
                      type: 'string',
                      options: { list: ['image', 'video'] },
                      initialValue: 'image',
                    }),
                    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
                    defineField({ name: 'video', type: 'file' }),
                    defineField({ name: 'alt', type: 'string' }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'media',
      type: 'array',
      of: [
        defineArrayMember({ type: 'image', options: { hotspot: true } }),
        defineArrayMember({ type: 'file' }),
      ],
    }),
    defineField({
      name: 'attachments',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'file', type: 'file' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'budgetRange',
      type: 'string',
      description: 'Display value e.g. 180k - 240k EUR',
    }),
    defineField({ name: 'startDate', type: 'date' }),
    defineField({ name: 'endDate', type: 'date' }),
    defineField({
      name: 'deliverables',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({ name: 'creativeDirector', type: 'string' }),
    defineField({ name: 'logisticsLead', type: 'string' }),
  ],
});
