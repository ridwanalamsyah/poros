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
                .title("Recently published")
                .child(
                  S.documentList()
                    .title("Recently published (last 30 days)")
                    .filter(
                      '_type == "article" && defined(publishedAt) && publishedAt <= now() && dateTime(publishedAt) > dateTime(now()) - 60*60*24*30',
                    )
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                    .params({}),
                ),
              S.listItem()
                .title("Scheduled")
                .child(
                  S.documentList()
                    .title("Scheduled (publishedAt in the future)")
                    .filter(
                      '_type == "article" && defined(publishedAt) && publishedAt > now()',
                    )
                    .defaultOrdering([{ field: "publishedAt", direction: "asc" }])
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
              S.listItem()
                .title("Needs cover image")
                .child(
                  S.documentList()
                    .title("Needs cover image")
                    .filter('_type == "article" && !defined(coverImage)')
                    .params({}),
                ),
              S.listItem()
                .title("By category")
                .child(
                  S.documentTypeList("category")
                    .title("Articles by category")
                    .child((catId) =>
                      S.documentList()
                        .title("Articles")
                        .filter('_type == "article" && category._ref == $catId')
                        .params({ catId })
                        .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                    ),
                ),
              S.listItem()
                .title("By edition")
                .child(
                  S.documentTypeList("edition")
                    .title("Articles by edition")
                    .child((edId) =>
                      S.documentList()
                        .title("Articles")
                        .filter('_type == "article" && edition._ref == $edId')
                        .params({ edId })
                        .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                    ),
                ),
              S.listItem()
                .title("By author")
                .child(
                  S.documentTypeList("author")
                    .title("Articles by author")
                    .child((authorId) =>
                      S.documentList()
                        .title("Articles")
                        .filter(
                          '_type == "article" && (author._ref == $authorId || $authorId in authors[]._ref)',
                        )
                        .params({ authorId })
                        .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                    ),
                ),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("edition").title("Editions"),
      S.documentTypeListItem("note").title("Notes"),
      S.listItem()
        .title("Shop")
        .child(
          S.list()
            .title("Shop")
            .items([
              S.documentTypeListItem("product").title("Products"),
              S.listItem()
                .title("Orders")
                .child(
                  S.list()
                    .title("Orders")
                    .items([
                      S.listItem()
                        .title("All orders")
                        .child(
                          S.documentTypeList("order")
                            .title("All orders")
                            .defaultOrdering([{ field: "placedAt", direction: "desc" }]),
                        ),
                      S.listItem()
                        .title("Pending payment")
                        .child(
                          S.documentList()
                            .title("Pending payment")
                            .filter('_type == "order" && status == "pending"')
                            .defaultOrdering([{ field: "placedAt", direction: "desc" }])
                            .params({}),
                        ),
                      S.listItem()
                        .title("Paid · awaiting shipment")
                        .child(
                          S.documentList()
                            .title("Paid · awaiting shipment")
                            .filter('_type == "order" && status == "paid"')
                            .defaultOrdering([{ field: "paidAt", direction: "desc" }])
                            .params({}),
                        ),
                      S.listItem()
                        .title("Shipped")
                        .child(
                          S.documentList()
                            .title("Shipped")
                            .filter('_type == "order" && status == "shipped"')
                            .defaultOrdering([{ field: "shippedAt", direction: "desc" }])
                            .params({}),
                        ),
                      S.listItem()
                        .title("Cancelled / refunded")
                        .child(
                          S.documentList()
                            .title("Cancelled / refunded")
                            .filter('_type == "order" && status in ["cancelled", "refunded"]')
                            .defaultOrdering([{ field: "placedAt", direction: "desc" }])
                            .params({}),
                        ),
                    ]),
                ),
            ]),
        ),
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
