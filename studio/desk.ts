import type { StructureBuilder } from "sanity/structure";

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Velvet Collapse")
    .items([
      S.listItem()
        .title("Editorial")
        .child(
          S.list()
            .title("Editorial")
            .items([
              S.listItem()
                .title("All articles")
                .child(S.documentTypeList("article").title("All articles")),
              S.listItem()
                .title("Drafts")
                .child(
                  S.documentList()
                    .title("Drafts")
                    .filter('_type == "article" && _id in path("drafts.**")'),
                ),
              S.listItem()
                .title("Scheduled")
                .child(
                  S.documentList()
                    .title("Scheduled")
                    .filter('_type == "article" && defined(scheduledFor) && scheduledFor > now()'),
                ),
              S.listItem()
                .title("Editor's picks")
                .child(
                  S.documentList()
                    .title("Editor's picks")
                    .filter('_type == "article" && editorsPick == true'),
                ),
              S.divider(),
              S.documentTypeListItem("category").title("Categories"),
              S.documentTypeListItem("author").title("Authors"),
              S.documentTypeListItem("note").title("Notes"),
            ]),
        ),
      S.listItem()
        .title("Magazine")
        .child(
          S.list()
            .title("Magazine")
            .items([
              S.documentTypeListItem("edition").title("Editions"),
              S.documentTypeListItem("newsletter").title("Newsletter archive"),
            ]),
        ),
      S.listItem()
        .title("Shop")
        .child(
          S.list()
            .title("Shop")
            .items([
              S.documentTypeListItem("product").title("Products"),
              S.documentTypeListItem("order").title("Orders"),
            ]),
        ),
      S.listItem()
        .title("Community")
        .child(
          S.list()
            .title("Community")
            .items([
              S.documentTypeListItem("submission").title("Pitch submissions"),
              S.documentTypeListItem("letter").title("Letters to editor"),
              S.documentTypeListItem("reaction").title("Reactions"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Settings")
        .child(
          S.editor()
            .id("settings")
            .schemaType("settings")
            .documentId("settings"),
        ),
      S.listItem()
        .title("Colophon / Masthead")
        .child(
          S.editor()
            .id("colophon")
            .schemaType("colophon")
            .documentId("colophon"),
        ),
    ]);
