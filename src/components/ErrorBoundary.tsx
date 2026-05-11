import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-10 text-center">
          <div className="max-w-md p-8 bg-white/5 border border-red-500/20 rounded-3xl backdrop-blur-xl">
            <h1 className="text-2xl font-black text-red-500 uppercase italic mb-4">System Anomaly Detected</h1>
            <p className="text-white/60 mb-8 font-medium">
              The neural link was interrupted by an unexpected error. Please try refreshing the interface.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors uppercase tracking-widest text-xs"
            >
              Reinitialize Link
            </button>
            {process.env.NODE_ENV !== 'production' && (
              <pre className="mt-8 p-4 bg-black/50 rounded text-left text-[10px] text-red-400/80 overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
