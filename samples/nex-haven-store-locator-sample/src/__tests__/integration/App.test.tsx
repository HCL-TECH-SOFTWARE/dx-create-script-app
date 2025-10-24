/* ======================================================================== *
 * Copyright 2025 HCL America Inc.                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 * http://www.apache.org/licenses/LICENSE-2.0                               *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 * ======================================================================== */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../../App';

describe('App Integration Tests', () => {
  // Reset the DOM between tests
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders both the store list and map components', () => {
    render(<App />);
    
    // Verify store list renders properly
    const storeList = document.querySelector('.dxsp-store-list');
    expect(storeList).toBeTruthy();
    
    // Verify map component renders properly
    const mapContainer = document.querySelector('.leaflet-container');
    expect(mapContainer).toBeTruthy();
  });

  it('updates the map when filtering stores', () => {
    render(<App />);
    
    // Get initial markers count
    const initialMarkers = document.querySelectorAll('.leaflet-marker-icon');
    const initialMarkersCount = initialMarkers.length;
    expect(initialMarkersCount).toBeGreaterThan(0);
    
    // Filter for London
    const searchInput = screen.getAllByPlaceholderText('Search locations...')[0];
    fireEvent.change(searchInput, { target: { value: 'London' } });
    
    // Check that only one store card is displayed
    const storeList = document.querySelector('.dxsp-store-list');
    const storeCards = storeList ? Array.from(storeList.children).filter(
      child => child.classList.contains('dxsp-store-card')
    ) : [];
    expect(storeCards).toHaveLength(1);
    
    // Verify the filtered card contains London text
    const londonCard = storeCards[0] as HTMLElement;
    const londonTextElements = within(londonCard).getAllByText(/London/);
    expect(londonTextElements.length).toBeGreaterThan(0);
  });

  it('integrates store selection with map markers', () => {
    render(<App />);
    
    // Find Glasgow store
    const glasgowElements = screen.getAllByText(/Glasgow/);
    const glasgowCard = glasgowElements[0].closest('.dxsp-store-card');
    expect(glasgowCard).toBeTruthy();
    
    // Click on Glasgow store to select it
    fireEvent.click(glasgowCard!);
    
    // Verify the card is selected
    expect(glasgowCard?.classList.contains('selected')).toBe(true);
    
    // Verify the map reflects the selection
    const markers = document.querySelectorAll('.leaflet-marker-icon');
    
    // At least one marker should be the selected one
    const hasSelectedMarker = Array.from(markers).some(marker => {
      // Selected markers typically have higher z-index or different styling
      const style = window.getComputedStyle(marker);
      const zIndex = parseInt(style.zIndex, 10);
      return zIndex > 0; // Basic check that some marker has priority in z-index
    });
    
    expect(hasSelectedMarker).toBe(true);
  });
});
