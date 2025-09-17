import { defineArrayMember, defineField, defineType } from 'sanity';

export const campaign = defineType({
  name: 'campaign',
  title: 'Campaign',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'year', type: 'string', description: 'Display year, e.g. 2025' }),
    defineField({
      name: 'locations',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'cover',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'heroVideo', type: 'url', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'galleryAsset',
          fields: [
            defineField({
              name: 'type',
              type: 'string',
              options: { list: ['image', 'video'] },
              initialValue: 'image',
            }),
            defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'video', type: 'file' }),
            defineField({ name: 'poster', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'caption', type: 'string' }),
            defineField({
              name: 'aspectRatio',
              type: 'string',
              options: { list: ['portrait', 'landscape', 'square'] },
            }),
          ],
          preview: {
            select: { type: 'type', caption: 'caption', imageUrl: 'image.asset.url' },
            prepare({ type, caption, imageUrl }) {
              return {
                title: caption || `${type} asset`,
                subtitle: type,
                media: imageUrl,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'credits',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'role', type: 'string' }),
            defineField({ name: 'value', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'impactHighlights',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({ name: 'copy', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
    defineField({
      name: 'callToAction',
      type: 'object',
      fields: [
        defineField({ name: 'label', type: 'string' }),
        defineField({ name: 'href', type: 'string' }),
      ],
    }),
  ],
});
