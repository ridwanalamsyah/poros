import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { captureException } from "../utils/sentry";

type State = { error: Error | null };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void captureException(error, { componentStack: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="max-w-xl mx-auto px-5 pt-20 pb-10 text-center">
        <p className="kicker text-accent">SOMETHING BROKE</p>
        <h1 className="headline-display text-4xl mt-3">Halaman ini gagal dirender.</h1>
        <p className="text-muted mt-3">
          Maaf, ada yang tidak beres. Insiden sudah dilaporkan ke tim. Coba muat ulang halaman atau kembali ke beranda.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => window.location.reload()}
            className="border rule px-4 py-2 kicker hover:bg-ink hover:text-paper"
          >
            MUAT ULANG
          </button>
          <Link to="/" className="bg-ink text-paper px-4 py-2 kicker">
            BERANDA
          </Link>
        </div>
        {import.meta.env.DEV && (
          <pre className="text-xs text-left text-muted mt-6 overflow-auto max-h-64 border rule-soft p-3">
            {this.state.error.stack ?? this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
