import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { CategoryPage } from "./pages/Category";
import { ArticlePage } from "./pages/Article";
import { AuthorPage } from "./pages/Author";
import { TagPage } from "./pages/Tag";
import { EditionPage, EditionsPage } from "./pages/Editions";
import { NotesPage } from "./pages/Notes";
import { ShopPage } from "./pages/Shop";
import { SavedPage } from "./pages/Saved";
import { AboutPage } from "./pages/About";
import { SubmitPage } from "./pages/Submit";
import { NotFoundPage } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/author/:slug" element={<AuthorPage />} />
        <Route path="/tag/:tag" element={<TagPage />} />
        <Route path="/editions" element={<EditionsPage />} />
        <Route path="/edition/:slug" element={<EditionPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/submit" element={<SubmitPage mode="pitch" />} />
        <Route path="/letters" element={<SubmitPage mode="letter" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
