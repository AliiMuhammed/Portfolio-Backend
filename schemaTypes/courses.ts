import { defineField, defineType } from 'sanity';

export const coursesType = defineType({
    name: 'courses',
    title: 'Courses',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            type: 'string',
            title: 'Title',
        }),
      
        defineField({
            name: 'certificateImgUrl',
            type: 'image',
            title: 'Certificate Image',
            options: {
                hotspot: true,  
            },
        }),
        defineField({
            name: 'issuedDate',
            type: 'date',
            title: 'Issued Date',
            options: {
              dateFormat: 'MMM yyyy', 
            },
          }),
        defineField({
            name: 'issuedBy',
            type: 'string',
            title: 'Issued By',
        }),
    ],
})