import React, { useState, useEffect, type JSX } from 'react'
import './Search.css'
import 'closest-match'
import { closestMatch } from 'closest-match'

interface CityInfo {
    id: number
    name: string
    temperature: string
    condition: string
}

let favorites: number[] = [
    1
]

const cities: CityInfo[] = [
    { id: 1, name: 'New York', temperature: '25°C', condition: "Sunny" },
    { id: 2, name: 'Los Angeles', temperature: '30°C', condition: "Cloudy" },
    { id: 3, name: 'London', temperature: '20°C', condition: "Rainy" },
]

function Search() {
    const [inputValue, setInputValue] = useState('')
    const [query, setQuery] = useState('')
    const [searchResults, setSearchResults] = useState<CityInfo[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (query.trim() === '') {
            setSearchResults([])
            return
        }

        setLoading(true)
        newSearch(query).then(results => {
            setSearchResults(results)
            setLoading(false)
        }).catch(error => {
            console.error('Search failed:', error)
            setSearchResults([])
            setLoading(false)
        })
    }, [query])

    const firstResult = searchResults.length > 0 ? searchResults[0] : null

    return (
        <React.Fragment>

            <div className="search">
                <input
                    type="text"
                    placeholder="Search..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setQuery(e.currentTarget.value)
                            console.log(`Searching for: ${e.currentTarget.value}`)
                        }
                    }}
                />

            </div>
            <div className="results-columns">
                <data className="favorites">
                    <h2>Favorites</h2>
                    {favorites.length === 0 ? (
                        <p>No favorites found</p>
                    ) : (
                        favorites.map((id) => {
                            const city = cities.find((city) => city.id === id)
                            return city ? (
                                <div key={city.id} className="favorite">
                                    <h3>{city.name}</h3>
                                <p>{city.temperature}</p>
                                <p>Condition: {city.condition}</p>
                            </div> ): null
                        })
                    )}
                </data>

                <div className="results">
                    <h2>Search Results</h2>
                    {loading && <p>Loading...</p>}
                    {!loading && firstResult && makeCityCard(firstResult)}
                    {!loading && !firstResult && query && <p>No results found</p>}
                </div>
            </div>
        </React.Fragment>
    )
}

function getResults(query: string): CityInfo[] {
    if (query.trim() === '') {
        return []
    }

    const matchingCities = cities.filter((city) =>
        city.name.toLowerCase().includes(query.toLowerCase()),
    )

    if (matchingCities.length === 0) {
        return []
    }

    const closestCityName = closestMatch(
        query,
        matchingCities.map((city) => city.name),
    )

    const closestCity = Array.isArray(closestCityName)
        ? closestCityName[0]
        : closestCityName

    if (closestCity) {
        return matchingCities.filter(
            (city) => city.name.toLowerCase() === closestCity.toLowerCase(),
        )
    } else {
        return []
    }
}

function makeCityCard(city: CityInfo): JSX.Element {
    return (
        <table className="city-card">
            <tr>
                <th>Name</th>
                <th>Temperature</th> 
                <th>Condition</th>
            </tr>

            <tr>
                <td>{city.name}</td>
                <td>{city.temperature}</td>
                <td>{city.condition}</td>
            </tr> 

            </table>
    )
}

    interface InitCityInfo {
        name: string
        lat: string
        lon: string
    }

function getResultsAPI (query: string): Promise<InitCityInfo[]> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}`

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }
            return response.json() as Promise<{ results?: InitCityInfo[] }>
        })
        .then((data) => data.results ?? [])
        .catch((error) => {
            console.error('Error fetching city data:', error)
            return []
        })
}

function getWeatherAPI (lat: string, lon: string): Promise<{ temperature: number, weathercode: number }> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true`

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }
            return response.json() as Promise<{ current_weather: { temperature: number, weathercode: number } }>
        })
        .then((data) => data.current_weather)
        .catch((error) => {
            console.error('Error fetching weather data:', error)
            return { temperature: 0, weathercode: 0 }
        })
}

async function newSearch(query: string): Promise<CityInfo[]> {
    const cities = await getResultsAPI(query)
    const weatherPromises = cities.map((city) => getWeatherAPI(city.lat, city.lon).then((weather) => ({
        id: Math.floor(Math.random() * 1000000), // Generate a random ID for the city
        name: city.name,
        temperature: weather.temperature.toString(),
        condition: weather.weathercode.toString()
    }))
    )
    return await Promise.all(weatherPromises)
}

export default Search