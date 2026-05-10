"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-3xl mb-3">🎵</p>
            <p className="text-white font-semibold mb-1">Something went wrong</p>
            <p className="text-spotify-light-gray text-sm mb-4">
              Please try refreshing the page
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-4 py-2 bg-spotify-green text-black rounded-xl text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
