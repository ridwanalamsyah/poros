import type { StructureBuilder } from "sanity/structure";

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("POROS")
    .items([
      S.listItem()
        .title("Articles")
        .child(
          S.list()
            .title("Articles")
            .items([
              S.listItem()
                .title("All articles")
                .child(S.documentTypeList("article").title("All articles")),
              S.listItem()
                .title("Editor's picks")
                .child(
                  S.documentList()
                    .title("Editor's picks")
                    .filter('_type == "article" && editorsPick == true')
                    .params({}),
                ),
              S.listItem()
                .title("Drafts")
                .child(
                  S.documentList()
                    .title("Drafts")
                    .filter('_type == "article" && _id in path("drafts.**")')
                    .params({}),
                ),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("edition").title("Editions"),
      S.documentTypeListItem("note").title("Notes"),
      S.documentTypeListItem("product").title("Shop products"),
      S.divider(),
      S.listItem()
        .title("Inbox")
        .child(
          S.list()
            .title("Inbox")
            .items([
              S.documentTypeListItem("submission").title("Pitch submissions"),
              S.documentTypeListItem("letter").title("Letters to editor"),
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
    ]);
