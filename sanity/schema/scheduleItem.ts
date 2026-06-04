import { defineField, defineType } from 'sanity';

export const scheduleItem = defineType({
  name: 'scheduleItem',
  title: 'Schedule Item',
  type: 'document',
  fields: [
    defineField({
      name: 'location_es',
      title: 'Ubicación (Español)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location_en',
      title: 'Location (English)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timeStart',
      title: 'Start Time',
      type: 'string',
      description: 'e.g. 11:00 AM',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timeEnd',
      title: 'End Time',
      type: 'string',
      description: 'e.g. 3:00 PM',
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'Food Truck Regular', value: 'regular' },
          { title: 'Evento / Event', value: 'event' },
          { title: 'Festival', value: 'festival' },
          { title: 'Catering privado / Private Catering', value: 'catering' },
        ],
        layout: 'radio',
      },
      initialValue: 'regular',
    }),
    defineField({
      name: 'note_es',
      title: 'Nota (Español)',
      type: 'string',
      description: 'Nota corta opcional — aparece en el sitio',
    }),
    defineField({
      name: 'note_en',
      title: 'Note (English)',
      type: 'string',
    }),
    defineField({
      name: 'isActive',
      title: 'Active (visible on site)',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'location_es',
      subtitle: 'date',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ?? 'Sin fecha',
      };
    },
  },
  orderings: [
    {
      title: 'Date, Soonest First',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
});
