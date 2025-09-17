import { defineArrayMember, defineField, defineType } from 'sanity';

export const client = defineType({
  name: 'clientProfile',
  title: 'Client',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Maison / Client name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'contactEmail', type: 'string' }),
    defineField({
      name: 'journeys',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'journey' }],
        }),
      ],
    }),
    defineField({ name: 'notes', type: 'text' }),
    defineField({ name: 'logo', type: 'image', options: { hotspot: true } }),
  ],
});
