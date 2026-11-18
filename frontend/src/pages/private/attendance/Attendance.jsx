// frontend use
const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
};


// backend use
// const getAddress = async (latitude = "5.628795", longitude = "-0.163812") => {
//     const response = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
//     );

//     if (!response.ok) {
//         throw new Error('Unable to retrieve address');
//     }

//     const data = await response.json();

//     return data.display_name;
// };


const getAddress = async (latitude = "5.628795", longitude = "-0.163812") => {
    try {
        const url = new URL(
            'https://nominatim.openstreetmap.org/reverse'
        );

        url.search = new URLSearchParams({
            format: 'jsonv2',
            lat: latitude,
            lon: longitude,
            zoom: '18',
            addressdetails: '1',
            'accept-language': 'en'
        });

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Geocoding service unavailable');
        }

        const data = await response.json();

        if (!data || !data.address) {
            return null;
        }

        const address = data.address;

        // Find the most specific available neighbourhood
        const area =
            address.suburb ||
            address.neighbourhood ||
            address.quarter ||
            address.city_district ||
            address.village ||
            address.town ||
            address.city;

        return {
            full_address: data.display_name,

            area: area || null,

            street: address.road || null,

            house_number: address.house_number || null,

            city: address.city || address.town || null,

            region: address.state || null,

            country: address.country || null,

            postcode: address.postcode || null,

            latitude: Number(data.lat),
            longitude: Number(data.lon),

            osm_type: data.type || null
        };

    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};


// 5.628795/-0.163812



// {
// "place_id": 299553298,
// "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
// "osm_type": "node",
// "osm_id": 13677435214,
// "lat": "5.6292305",
// "lon": "-0.1635689",
// "category": "amenity",
// "type": "school",
// "place_rank": 30,
// "importance": 0.0000696429388875718,
// "addresstype": "amenity",
// "name": "Accra Stem Academy",
// "display_name": "Accra Stem Academy, Boundary Road, Shiashie, East Legon, Accra, Ayawaso West Municipal District, Greater Accra Region, GD-110-6313, Ghana",
// "address": {
// "amenity": "Accra Stem Academy",
// "road": "Boundary Road",
// "neighbourhood": "Shiashie",
// "suburb": "East Legon",
// "city": "Accra",
// "county": "Ayawaso West Municipal District",
// "state": "Greater Accra Region",
// "ISO3166-2-lvl4": "GH-AA",
// "postcode": "GD-110-6313",
// "country": "Ghana",
// "country_code": "gh"
// },
// "boundingbox": [
// "5.6291805",
// "5.6292805",
// "-0.1636189",
// "-0.1635189"
// ]
// }