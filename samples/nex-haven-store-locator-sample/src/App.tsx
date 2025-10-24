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

import './App.css'
import StoreMap, { type Store } from './StoreMap';
import { useState } from 'react';
import searchIcon from './assets/ico//Icon-Search.png';
import pinIcon from './assets/ico//Map_Pin.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';


const stores: Store[] = [
  {
    id: 1,
    name: 'NEX Haven Edinburgh',
    address: '32 Princes Street, Edinburgh, EH2 2BY',
    imageUrl: '../storeImages/store1.png',
    lat: 55.9533,
    lng: -3.1883,
  },
  {
    id: 2,
    name: 'NEX Haven Glasgow',
    address: '158 Buchanan Street, Glasgow, G1 2LW',
    imageUrl: '../storeImages/store2.png',
    lat: 55.8642,
    lng: -4.2518,
  },
  {
    id: 3,
    name: 'NEX Haven London',
    address: '214 Oxford Street, London, W1D 1LA',
    imageUrl: '../storeImages/store3.png',
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    id: 4,
    name: 'NEX Haven Manchester',
    address: '42 Market Street, Manchester, M1 1PW',
    imageUrl: '../storeImages/store4.png',
    lat: 53.4808,
    lng: -2.2426,
  },
  {
    id: 5,
    name: 'NEX Haven Birmingham',
    address: '127 New Street, Birmingham, B2 4HQ',
    imageUrl: '../storeImages/store5.png',
    lat: 52.4862,
    lng: -1.8904,
  },
  {
    id: 6,
    name: 'NEX Haven Cardiff',
    address: '78 Queen Street, Cardiff, CF10 2GR',
    imageUrl: '../storeImages/store1.png',
    lat: 51.4816,
    lng: -3.1791,
  },
  {
    id: 7,
    name: 'NEX Haven Liverpool',
    address: '25 Paradise Street, Liverpool, L1 3EU',
    imageUrl: '../storeImages/store2.png',
    lat: 53.4054,
    lng: -2.9898,
  },
  {
    id: 8,
    name: 'NEX Haven Bristol',
    address: '42 Broadmead, Bristol, BS1 3HA',
    imageUrl: '../storeImages/store3.png',
    lat: 51.4577,
    lng: -2.5878,
  },
  {
    id: 9,
    name: 'NEX Haven Newcastle',
    address: '102 Northumberland Street, Newcastle, NE1 7DQ',
    imageUrl: '../storeImages/store4.png',
    lat: 54.9783,
    lng: -1.6178,
  },
  {
    id: 10,
    name: 'NEX Haven Leeds',
    address: '65 Briggate, Leeds, LS1 6LH',
    imageUrl: '../storeImages/store5.png',
    lat: 53.7974,
    lng: -1.5437,
  },
];

function App() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    store.address.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Box className="dxsp-main-layout dxsp">
      <Box className="dxsp-left-panel">
        <Box className="dxsp-search-bar-container">
          <TextField
            placeholder="Search locations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              endAdornment: <img src={searchIcon} alt="Search" className="dxsp-search-icon" />
            }}
            className="dxsp-search-input"
          />
        </Box>
        <Box component="ul" className="dxsp-store-list">
          {filteredStores.map(store => (
            <Card
              key={store.id}
              className={`dxsp-store-card${selectedStoreId === store.id ? ' selected' : ''}`}
              onClick={() => setSelectedStoreId(store.id)}
              sx={{ mb: 2, boxShadow: selectedStoreId === store.id ? 6 : 2, cursor: 'pointer' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  className='dxsp-store-image'
                  src={store.imageUrl || iconMarker}
                  alt={store.name}
                />
                <CardContent className='dxsp-store-info' sx={{ p: 1 }}>
                  <Box className="dxsp-store-name">{store.name}</Box>
                  <Box className="dxsp-store-address">{store.address}</Box>
                  <Box className="dxsp-store-link-container">
                      <img className='dxsp-store-link-icon' src={pinIcon} alt="View Location" />
                      <Box className="dxsp-store-link-text">View Location</Box>
                  </Box>
                </CardContent>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
      <Box className="dxsp-right-panel">
        <StoreMap stores={stores} selectedStoreId={selectedStoreId} />
      </Box>
    </Box>
  )
}

export default App
