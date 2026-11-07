import { Component, type ReactNode, type ReactElement } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  render(): ReactNode {
    if (this.state.hasError) return this.renderFallback();
    return this.props.children;
  }
  private renderFallback(): ReactElement {
    return (
      <main className="fallback" id="main-content">
        <h1>Workspace unavailable</h1>
        <p>An unexpected error occurred. Reload to return to the demo login.</p>
        <a className="button primary" href="/login">
          Return to login
        </a>
      </main>
    );
  }
}
