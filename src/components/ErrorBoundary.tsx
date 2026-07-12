/**
 * 錯誤邊界元件
 * 
 * 捕獲子元件拋出的錯誤，顯示錯誤訊息。
 * 對應 FRONTME.md ErrorBoundary 章節。
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <Alert severity="error">
          <code style={{ whiteSpace: 'pre' as const }}>
            {this.state.error.stack || this.state.error.message}
          </code>
        </Alert>
      );
    }
    return this.props.children;
  }
}
