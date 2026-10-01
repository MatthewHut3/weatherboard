import React, { useState } from 'react'

interface CityInfo {
    name: string
    temperature: string
    condition: string
}

interface Favorites {
    cities: CityInfo[]
}

const cities: CityInfo[] = [
    { name: 'New York', temperature: '25°C', condition: "Sunny" },
    { name: 'Los Angeles', temperature: '30°C', condition: "Cloudy" },
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

            <div className="results">
                {getResults(query).map((city) => (
                    <div key={city.name} className="result">
                        <h3>{city.name}</h3>
                        <p>{city.temperature}</p>
                        <p>Condition: {city.condition}</p>
                    </div>
                ))}
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