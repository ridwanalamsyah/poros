import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";

const CategoryPage = lazy(() => import("./pages/Category").then((m) => ({ default: m.CategoryPage })));
const ArticlePage = lazy(() => import("./pages/Article").then((m) => ({ default: m.ArticlePage })));
const AuthorPage = lazy(() => import("./pages/Author").then((m) => ({ default: m.AuthorPage })));
const TagPage = lazy(() => import("./pages/Tag").then((m) => ({ default: m.TagPage })));
const EditionsPage = lazy(() => import("./pages/Editions").then((m) => ({ default: m.EditionsPage })));
const EditionPage = lazy(() => import("./pages/Editions").then((m) => ({ default: m.EditionPage })));
const NotesPage = lazy(() => import("./pages/Notes").then((m) => ({ default: m.NotesPage })));
const LiveBlogsPage = lazy(() => import("./pages/LiveBlog").then((m) => ({ default: m.LiveBlogsPage })));
const LiveBlogPage = lazy(() => import("./pages/LiveBlog").then((m) => ({ default: m.LiveBlogPage })));
const ShopPage = lazy(() => import("./pages/Shop").then((m) => ({ default: m.ShopPage })));
const ProductPage = lazy(() => import("./pages/Product").then((m) => ({ default: m.ProductPage })));
const CartPage = lazy(() => import("./pages/Cart").then((m) => ({ default: m.CartPage })));
const ShareCardPage = lazy(() => import("./pages/ShareCard").then((m) => ({ default: m.ShareCardPage })));
const SavedPage = lazy(() => import("./pages/Saved").then((m) => ({ default: m.SavedPage })));
const AboutPage = lazy(() => import("./pages/About").then((m) => ({ default: m.AboutPage })));
const ColophonPage = lazy(() => import("./pages/Colophon").then((m) => ({ default: m.ColophonPage })));
const SubmitPage = lazy(() => import("./pages/Submit").then((m) => ({ default: m.SubmitPage })));
const NotFoundPage = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-12" aria-busy="true">
      <div className="h-8 w-1/2 bg-ink/[0.08] mb-4" />
      <div className="h-4 w-2/3 bg-ink/[0.06] mb-2" />
      <div className="h-4 w-1/2 bg-ink/[0.06]" />
    </div>
  );
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<Lazy><CategoryPage /></Lazy>} />
        <Route path="/article/:slug" element={<Lazy><ArticlePage /></Lazy>} />
        <Route path="/author/:slug" element={<Lazy><AuthorPage /></Lazy>} />
        <Route path="/tag/:tag" element={<Lazy><TagPage /></Lazy>} />
        <Route path="/editions" element={<Lazy><EditionsPage /></Lazy>} />
        <Route path="/edition/:slug" element={<Lazy><EditionPage /></Lazy>} />
        <Route path="/notes" element={<Lazy><NotesPage /></Lazy>} />
        <Route path="/live" element={<Lazy><LiveBlogsPage /></Lazy>} />
        <Route path="/live/:slug" element={<Lazy><LiveBlogPage /></Lazy>} />
        <Route path="/shop" element={<Lazy><ShopPage /></Lazy>} />
        <Route path="/shop/:slug" element={<Lazy><ProductPage /></Lazy>} />
        <Route path="/cart" element={<Lazy><CartPage /></Lazy>} />
        <Route path="/share/:slug" element={<Lazy><ShareCardPage /></Lazy>} />
        <Route path="/saved" element={<Lazy><SavedPage /></Lazy>} />
        <Route path="/about" element={<Lazy><AboutPage /></Lazy>} />
        <Route path="/colophon" element={<Lazy><ColophonPage /></Lazy>} />
        <Route path="/submit" element={<Lazy><SubmitPage mode="pitch" /></Lazy>} />
        <Route path="/letters" element={<Lazy><SubmitPage mode="letter" /></Lazy>} />
        <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
      </Route>
    </Routes>
  );
}
