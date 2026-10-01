import React, { useState, type JSX } from 'react'
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
    const [query, setQuery] = useState('')

    return (
        <React.Fragment>
            
            <div className="search">
                <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
                    {makeCityCard(getResults(query).length > 0 ? getResults(query)[0] : { id: 0, name: '', temperature: '', condition: '' })}
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

export default Search