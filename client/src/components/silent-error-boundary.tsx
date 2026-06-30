"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SilentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SilentErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] p-8 text-center">
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mt-1">An unexpected error occurred. Please try refreshing the page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
