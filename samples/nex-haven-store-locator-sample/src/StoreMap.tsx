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

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import { useRef, useEffect } from 'react';
import type { Map as LeafletMap } from 'leaflet';

export interface Store {
	id: number;
	name: string;
	address: string;
	lat: number;
	lng: number;
	imageUrl?: string;
}

interface StoreMapProps {
	stores: Store[];
	selectedStoreId: number | null;
}

const StoreMap: React.FC<StoreMapProps> = ({ stores, selectedStoreId }) => {
	const mapRef = useRef<LeafletMap | null>(null);
	const selectedStore = stores.find(store => store.id === selectedStoreId);
	const center: [number, number] = selectedStore
		? [selectedStore.lat, selectedStore.lng]
		: [stores[0].lat, stores[0].lng];

	useEffect(() => {
		if (mapRef.current && selectedStore) {
			mapRef.current.setView([selectedStore.lat, selectedStore.lng], 12, { animate: true });
		}
	}, [selectedStoreId, selectedStore]);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				borderRadius: '12px',
				overflow: 'hidden',
				// position: 'relative',
			}}
		>
			<MapContainer
				center={center}
				zoom={6}
				style={{ height: '100%', width: '100%' }}
				ref={mapRef}
				whenReady={() => { console.log('Map is ready'); }}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution="&copy; OpenStreetMap contributors"
				/>
				{stores.map(store => (
					<Marker key={store.id} position={[store.lat, store.lng]} icon={L.icon({ iconUrl: iconMarker, iconSize: [25, 41], iconAnchor: [12, 41] })}>
						<Popup>
							<strong>{store.name}</strong>
							<br />
							{store.address}
						</Popup>
					</Marker>
				))}
			</MapContainer>
			<div
				style={{
					position: 'absolute',
					bottom: 16,
					right: 16,
					zIndex: 1000,
					display: 'flex',
					gap: '8px',
				}}
			>
			</div>
		</div>
	);
};

export default StoreMap;
