import React, { useState } from 'react'
import './Search.css'

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
                {getResults(query).length === 0 ? (
                    <p>No results found</p>
                ) : (
                    getResults(query).map((city) => (
                        <div key={city.id} className="result">
                            <h3>{city.name}</h3>
                        <p>{city.temperature}</p>
                        <p>Condition: {city.condition}</p>
                    </div>
                    ))
                )}
            </div>
        </React.Fragment>
    )
}

function getResults(query: string): CityInfo[] {
    return cities.filter((city) =>
        city.name.toLowerCase().includes(query.toLowerCase()),
    )
}

export default Search