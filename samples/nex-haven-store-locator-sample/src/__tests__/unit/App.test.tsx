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

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

describe('App', () => {
  it('renders all stores by default', () => {
    render(<App />);
    // Use standard DOM checks instead of custom matchers
    expect(screen.getByText('NEX Haven Edinburgh')).toBeTruthy();
    expect(screen.getByText('NEX Haven Glasgow')).toBeTruthy();
    expect(screen.getByText('NEX Haven London')).toBeTruthy();
  });

  it('filters stores by search input', () => {
    render(<App />);
    const inputs = screen.getAllByPlaceholderText('Search locations...');
    fireEvent.change(inputs[0], { target: { value: 'London' } });
    const storeList = document.querySelector('.dxsp-store-list');
    const storeCards = storeList ? Array.from(storeList.children).filter(child => child.classList.contains('dxsp-store-card')) : [];
    expect(storeCards).toHaveLength(1);
  });

  it('selects a store when clicked', () => {
    render(<App />);
    const glasgowNames = screen.getAllByText('NEX Haven Glasgow');
    // Find the closest .dxsp-store-card for the first match
    const card = glasgowNames[0].closest('.dxsp-store-card');
    // Use standard DOM checks instead of custom matchers
    expect(card?.classList.contains('selected')).toBe(false);
    fireEvent.click(card!);
    expect(card?.classList.contains('selected')).toBe(true);
  });
});
