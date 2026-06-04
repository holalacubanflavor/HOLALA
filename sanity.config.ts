import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schema';

export default defineConfig({
  name: 'holala-cuban-flavor',
  title: 'HOLALA Cuban Flavor',

  projectId: 'd082imwm',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('HOLALA')
          .items([
            S.listItem()
              .title('Menú / Menu')
              .child(S.documentTypeList('menuItem').title('Menu Items')),
            S.listItem()
              .title('Horario / Schedule')
              .child(S.documentTypeList('scheduleItem').title('Schedule')),
            S.listItem()
              .title('Blog')
              .child(S.documentTypeList('blogPost').title('Blog Posts')),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
