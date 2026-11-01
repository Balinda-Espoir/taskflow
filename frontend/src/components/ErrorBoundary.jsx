import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('UI error:', error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-slate-500">An unexpected error occurred. Please reload the page.</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
}
