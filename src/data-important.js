// Write your own words here. Anything in [square brackets] is a placeholder waiting for your text.
// Set a section's photo to null to hide its photo frame. Set photo.src to an image URL to show a photo.

export const PERSONAL_PAGE = {
  opening: {
    eyebrow: "[A small line to begin with]",
    heading: "[Your opening heading]",
  },
  mainMessage: {
    title: "[Title for your main message]",
    paragraphs: [
      "[Your main personal message, first paragraph]",
      "[Your main personal message, second paragraph]",
    ],
    signature: "[Your signature]",
  },
  sections: [
    {
      title: "[Section one title]",
      paragraphs: ["[Section one text]"],
      photo: { src: "", alt: "[Photo description]", caption: "[Photo caption]" },
    },
    {
      title: "[Section two title]",
      paragraphs: ["[Section two text]"],
      photo: null,
    },
  ],
  closing: "[Closing line]",
};
