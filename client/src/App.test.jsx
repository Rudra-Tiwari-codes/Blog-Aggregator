import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the navbar', () => {
    render(<App />);
    // Test for the navbar specifically by looking for the navigation element
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
    
    // Test that the navbar contains the Blog Aggregator text
    expect(navbar).toHaveTextContent('Blog Aggregator');
  });
});
